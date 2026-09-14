/** Candidate read failures must not turn an incomplete lint into a clean result. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { run, ROOT } from '../helpers/run.mjs';

const SCRIPT = join(ROOT, 'scripts', 'lint_hardcodes.py');
const HARD = '.card { color: #ff0000; }\n';
const CLEAN = '.card { color: var(--color-text-primary); }\n';

// Inject at read time, after real candidate selection. chmod is unreliable as root,
// and a genuinely disappearing file would make this test depend on a race.
const READ_FAILURE = String.raw`
import errno
import runpy
import sys
from pathlib import Path
from unittest.mock import patch

script, kind, *paths = sys.argv[1:]
unreadable = {Path(p) for p in paths if Path(p).name.startswith("unreadable")}
original = Path.read_text

def read_text(path, *args, **kwargs):
    if path in unreadable:
        if kind == "UnicodeDecodeError":
            raise UnicodeDecodeError("utf-8", b"\xff", 0, 1, "injected read failure")
        if kind == "PermissionError":
            raise PermissionError(errno.EACCES, "injected read failure", str(path))
        if kind == "FileNotFoundError":
            raise FileNotFoundError(errno.ENOENT, "injected read failure", str(path))
        raise AssertionError(f"unknown failure kind: {kind}")
    return original(path, *args, **kwargs)

sys.argv = [script, *paths]
with patch.object(Path, "read_text", new=read_text):
    runpy.run_path(script, run_name="__main__")
`;

function withFiles(names, check) {
  const dir = mkdtempSync(join(tmpdir(), 'hardcodes-read-'));
  try {
    const paths = names.map(name => {
      const path = join(dir, name);
      writeFileSync(path, name === 'clean.css' ? CLEAN : HARD);
      return path;
    });
    check(paths, dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function assertIncomplete(result, paths, scanned, violations) {
  assert.equal(result.signal, null, result.out);
  assert.equal(result.status, 1, result.out);
  assert.doesNotMatch(result.out, /\bOK:/);
  assert.match(result.stdout, new RegExp(`Scanned ${scanned} file\\(s\\)\\.`));
  assert.match(result.stdout, new RegExp(
    `FAIL: ${paths.length - scanned} of ${paths.length} candidate file\\(s\\) could not be read`));
  assert.match(result.stdout, new RegExp(`${violations} hardcoded value\\(s\\) found`));
  assert.match(result.stderr, /ERROR: could not read/);
  assert.doesNotMatch(result.stderr, /Traceback/);
}

const cases = [
  { name: 'one unreadable candidate', files: ['unreadable.css'], scanned: 0, violations: 0 },
  { name: 'all candidates unreadable', files: ['unreadable-1.css', 'unreadable-2.css'], scanned: 0, violations: 0 },
  { name: 'unreadable then clean', files: ['unreadable.css', 'clean.css'], scanned: 1, violations: 0 },
  { name: 'unreadable then violation', files: ['unreadable.css', 'violation.css'], scanned: 1, violations: 1 },
  { name: 'violation then unreadable', files: ['violation.css', 'unreadable.css'], scanned: 1, violations: 1 },
];

for (const kind of ['UnicodeDecodeError', 'PermissionError', 'FileNotFoundError']) {
  for (const scenario of cases) {
    test(`lint_hardcodes: ${kind}, ${scenario.name}`, () => {
      withFiles(scenario.files, paths => {
        const result = run('python3', ['-X', 'utf8', '-c', READ_FAILURE, SCRIPT, kind, ...paths]);
        assertIncomplete(result, paths, scenario.scanned, scenario.violations);
        assert.match(result.stderr, /injected read failure/);
        for (const [i, name] of scenario.files.entries()) {
          if (name.startsWith('unreadable')) {
            assert.ok(result.stderr.includes(paths[i]), `missing failed path: ${result.stderr}`);
          }
          if (name === 'violation.css') {
            assert.ok(result.stdout.includes(`${paths[i]}:1: hardcoded hex '#ff0000'`), result.stdout);
          }
        }
      });
    });
  }
}

test('lint_hardcodes keeps deliberately excluded files outside the read-error policy', () => {
  withFiles(['unreadable.txt', 'clean.css'], paths => {
    const result = run('python3', ['-X', 'utf8', '-c', READ_FAILURE, SCRIPT, 'UnicodeDecodeError', ...paths]);
    assert.equal(result.status, 0, result.out);
    assert.match(result.stdout, /Scanned 1 file\(s\)\./);
    assert.match(result.stdout, /OK: no hardcoded values found/);
    assert.equal(result.stderr, '');
  });
});

test('lint_hardcodes rejects real invalid UTF-8 after detecting the readable control', () => {
  withFiles(['unreadable.css'], (paths, dir) => {
    // Explicit UTF-8 mode makes this independent of the host locale.
    const command = ['-X', 'utf8', SCRIPT, dir];
    const control = run('python3', command);
    assert.equal(control.status, 1, control.out);
    assert.match(control.stdout, /hardcoded hex '#ff0000'/);
    assert.equal(control.stderr, '');

    writeFileSync(paths[0], Buffer.concat([Buffer.from(HARD), Buffer.from([0xff])]));
    const result = run('python3', command);
    assertIncomplete(result, paths, 0, 0);
    assert.ok(result.stderr.includes(paths[0]), result.stderr);
    assert.match(result.stderr, /decode/);
  });
});
