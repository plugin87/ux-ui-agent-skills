/**
 * What npm ships is what a reviewer can read in this repository, and nothing
 * more. `files` in package.json is an allowlist of paths, and npm ignores
 * .gitignore once it is set, so anything lying in the working tree under an
 * allowed path ships: v2.7.0 published scripts/__pycache__/*.pyc that way.
 *
 * Every file in the tarball must be tracked by git, and the package must run
 * no code on install.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { run, ROOT } from '../helpers/run.mjs';

test('every file in the npm tarball is tracked by git', () => {
  const pack = run('npm', ['pack', '--dry-run', '--json', '--ignore-scripts']);
  assert.equal(pack.status, 0, pack.stderr);
  const shipped = JSON.parse(pack.stdout)[0].files.map(f => f.path);
  const tracked = new Set(run('git', ['ls-files']).stdout.split('\n'));
  const extra = shipped.filter(f => !tracked.has(f));
  assert.deepEqual(extra, [], `the tarball ships files no reviewer can see in git:\n  ${extra.join('\n  ')}`);
  assert.ok(shipped.includes('SECURITY.md'), 'SECURITY.md does not ship');
});

test('installing the package runs no code', () => {
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  const hooks = ['preinstall', 'install', 'postinstall', 'prepare', 'preprepare', 'postprepare']
    .filter(k => pkg.scripts?.[k]);
  assert.deepEqual(hooks, [], `install-time scripts: ${hooks.join(', ')}`);
  assert.deepEqual(Object.keys(pkg.dependencies || {}), [], 'the package claims no runtime dependencies');
});
