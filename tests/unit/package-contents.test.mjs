/**
 * What npm publishes is not what git tracks. `files` in package.json is an
 * allowlist of PATHS, and everything sitting under an allowed directory goes
 * with it - including whatever the working tree happens to be carrying.
 *
 * v2.7.0 shipped two `scripts/__pycache__/*.pyc` files for exactly that reason:
 * .gitignore keeps them out of git, and npm does not read .gitignore when
 * `files` is present. Publishing from a different machine would have produced a
 * different tarball, silently.
 *
 * This asserts the published set from the same command the registry sees.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { run } from '../helpers/run.mjs';

const packed = (() => {
  const r = run('npm', ['pack', '--dry-run', '--json']);
  if (r.status !== 0) throw new Error(`npm pack failed:\n${r.stderr}`);
  // npm prints notices on stderr and the JSON document on stdout
  return JSON.parse(r.stdout)[0].files.map(f => f.path);
})();

test('the tarball carries no build junk from whoever ran publish', () => {
  const junk = packed.filter(p =>
    p.includes('__pycache__') || p.endsWith('.pyc') ||
    p.endsWith('.DS_Store') || p.includes('node_modules/') || p.endsWith('.tgz'));
  assert.deepEqual(junk, [], `junk in the published package:\n  ${junk.join('\n  ')}`);
});

test('the tarball carries everything a consumer needs', () => {
  // Each of these has a reason: the CLI is the entry point, the doctrine skill
  // is what a plugin install loads instead of CLAUDE.md, and the legal and
  // history files are what a package is judged by before anyone reads the code.
  for (const required of [
    'package.json', 'README.md', 'LICENSE', 'CHANGELOG.md', 'CONTRIBUTING.md',
    'CLAUDE.md', 'bin/cli.js',
    '.claude/skills/design-doctrine/SKILL.md',
    '.claude/commands/gate.md',
    '.claude/rules/components.md',
    'tokens/colors.json',
    'examples/index.html',
    'templates/product-design/design-tokens.json',
  ]) {
    assert.ok(packed.includes(required), `the package is missing ${required}`);
  }
});

test('the tarball is not accidentally huge', () => {
  // A design kit is text. If this jumps, something binary crept in.
  assert.ok(packed.length > 250 && packed.length < 400,
    `unexpected file count: ${packed.length}`);
  assert.equal(packed.filter(p => p.startsWith('.github/images/')).length, 0,
    'README screenshots do not belong in a consumer install');
});
