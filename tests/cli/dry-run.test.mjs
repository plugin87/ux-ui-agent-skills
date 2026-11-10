/**
 * `init --dry-run` is how a reader audits the install before trusting it, and
 * SECURITY.md points them at it. So it has to be exactly true: it lists every
 * file the real run writes, and it writes nothing, not even an empty folder.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { ROOT } from '../helpers/run.mjs';

const CLI = join(ROOT, 'bin', 'cli.js');
const plain = s => s.replace(/\x1b\[[0-9;]*m/g, '');
const cli = (cwd, args) => {
  const r = spawnSync('node', [CLI, ...args], { cwd, encoding: 'utf8' });
  return { status: r.status, out: plain(r.stdout + r.stderr) };
};
const listed = out => out.split('\n').filter(l => /^ {2}\+ /.test(l)).map(l => l.slice(4).trim()).sort();
const walk = (d, root = d) => readdirSync(d, { withFileTypes: true })
  .flatMap(e => e.isDirectory() ? walk(join(d, e.name), root) : [relative(root, join(d, e.name))]);

for (const args of [['init'], ['init', '--agent', 'codex'], ['init', '--agent', 'gemini'], ['new', '.'], ['add', 'tokens', 'taste']]) {
  test(`${args.join(' ')} --dry-run writes nothing and lists exactly what the real run writes`, () => {
    const dry = mkdtempSync(join(tmpdir(), 'uxui-dry-'));
    const real = mkdtempSync(join(tmpdir(), 'uxui-real-'));
    try {
      const d = cli(dry, [...args, '--dry-run']);
      assert.equal(d.status, 0, d.out);
      assert.deepEqual(readdirSync(dry), [], 'the dry run created something');
      assert.match(d.out, /Nothing was changed\./);
      assert.doesNotMatch(d.out, /\bcopied\b/, 'a dry run must not say it copied');

      const r = cli(real, args);
      assert.equal(r.status, 0, r.out);
      assert.deepEqual(listed(d.out), walk(real).sort(), 'the dry run and the real run disagree about what is written');
      assert.deepEqual(walk(real).filter(f => /__pycache__|\.pyc$|\.DS_Store/.test(f)), [], 'build litter was installed');
    } finally {
      rmSync(dry, { recursive: true, force: true });
      rmSync(real, { recursive: true, force: true });
    }
  });
}
