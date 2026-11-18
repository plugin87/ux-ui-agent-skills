// Issue #31: design-systems/library/com7 left Windows clones empty. The check
// must reject every name Windows refuses, and must not reject the near misses.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { problem } from '../../scripts/check_filenames.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SCRIPT = join(ROOT, 'scripts/check_filenames.mjs');

test('reserved device names fail in any case, with or without an extension', () => {
  for (const n of ['con', 'PRN', 'Aux', 'nul', 'nul.txt', 'com7', 'COM1', 'com0', 'com¹', 'lpt9', 'LPT².md', 'con.tar.gz']) {
    assert.ok(problem(n), `${n} should be refused`);
  }
});

test('forbidden characters and trailing space or dot fail', () => {
  for (const n of ['a<b', 'a>b', 'a:b', 'a"b', 'a|b', 'a?b', 'a*b', 'trailing.', 'trailing ']) {
    assert.ok(problem(n), `${n} should be refused`);
  }
});

test('near misses pass', () => {
  for (const n of ['comseven', 'com10', 'console', 'auxiliary', 'nullable.js', 'lpt', 'com', '.gitignore', 'DESIGN.md', 'a.b.c']) {
    assert.equal(problem(n), null, `${n} should pass`);
  }
});

test('the repo itself is portable', () => {
  const r = spawnSync('node', [SCRIPT], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
});

test('a folder named nul fails the run with exit 1 and names it', () => {
  const dir = mkdtempSync(join(tmpdir(), 'portable-'));
  try {
    mkdirSync(join(dir, 'library', 'nul'), { recursive: true });
    writeFileSync(join(dir, 'library', 'ok.md'), 'x');
    const r = spawnSync('node', [SCRIPT, dir], { encoding: 'utf8' });
    assert.equal(r.status, 1);
    assert.match(r.stderr, /library\/nul/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('a directory that cannot be read exits 2', () => {
  const r = spawnSync('node', [SCRIPT, join(tmpdir(), 'no-such-dir-portable')], { encoding: 'utf8' });
  assert.equal(r.status, 2);
});
