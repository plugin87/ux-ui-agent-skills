/**
 * The CLI is the first thing a new project touches, and `new` is what the eval
 * briefs and the docs tell people to run. CI checked a handful of `test -f`
 * lines inline; this checks the same ground as code, plus the parts that were
 * never checked: the template rename, the --dry contract, and whether the
 * seeded theme a project starts from actually passes the contrast gate.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, existsSync, rmSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { run, py, ROOT } from '../helpers/run.mjs';

const cli = (...args) => run('node', ['bin/cli.js', ...args]);

const tmp = (fn) => {
  const dir = mkdtempSync(join(tmpdir(), 'ds-scaffold-'));
  try { return fn(dir); } finally { rmSync(dir, { recursive: true, force: true }); }
};

const stripAnsi = (s) => s.replace(/\u001B\[[0-9;]*m/g, '');

test('list names every area the installer knows about', () => {
  // Derived from the source, not retyped: a new area must show up in `list`.
  const src = readFileSync(join(ROOT, 'bin', 'cli.js'), 'utf8');
  const block = src.split('const AREAS')[1].split('};')[0];
  const areas = [...block.matchAll(/^\s*['"]?([a-z-]+)['"]?\s*:/gm)].map(m => m[1]);
  assert.ok(areas.length >= 10, `could not read the area map (found ${areas.length})`);

  const r = cli('list');
  assert.equal(r.status, 0);
  const out = stripAnsi(r.stdout);
  for (const area of areas) assert.ok(out.includes(area), `list omits "${area}"`);
});

test('new produces the reference layout', () => {
  tmp((dir) => {
    const dest = join(dir, 'proj');
    const r = cli('new', dest);
    assert.equal(r.status, 0, r.out);
    for (const p of ['CLAUDE.md', 'CLAUDE.local.md', 'design-tokens.json', '.mcp.json',
      '.claude/settings.json', '.claude/rules', '.claude/commands',
      'src/components', 'public/images', 'reference']) {
      assert.ok(existsSync(join(dest, p)), `scaffold is missing ${p}`);
    }
  });
});

test('new renames the local-preferences template instead of shipping it raw', () => {
  tmp((dir) => {
    const dest = join(dir, 'proj');
    assert.equal(cli('new', dest).status, 0);
    assert.ok(existsSync(join(dest, 'CLAUDE.local.md')));
    assert.ok(!existsSync(join(dest, 'CLAUDE.local.md.template')),
      'the .template suffix leaked into a real project');
  });
});

test('the theme a new project starts from passes WCAG in light AND dark', () => {
  // A scaffold that seeds a failing theme hands every future screen a bug.
  tmp((dir) => {
    const dest = join(dir, 'proj');
    assert.equal(cli('new', dest).status, 0);
    const r = py('validate_contrast.py', [join(dest, 'design-tokens.json')]);
    assert.equal(r.status, 0, r.out);
    assert.match(r.stdout, /=== DARK \(required\) ===/, 'the seeded theme has no dark section to check');
  });
});

test('--dry reports what it would write without writing it', () => {
  tmp((dir) => {
    const dest = join(dir, 'proj');
    const r = cli('new', dest, '--dry');
    assert.equal(r.status, 0, r.out);
    const created = existsSync(dest) ? readdirSync(dest) : [];
    assert.deepEqual(created, [], `--dry created files: ${created.join(', ')}`);
  });
});

test('a scaffolded CLAUDE.md keeps the always-on rules', () => {
  tmp((dir) => {
    const dest = join(dir, 'proj');
    assert.equal(cli('new', dest).status, 0);
    const brief = readFileSync(join(dest, 'CLAUDE.md'), 'utf8');
    assert.match(brief, /emoji/i, 'the emoji ban did not reach the scaffolded brief');
  });
});
