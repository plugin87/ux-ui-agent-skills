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

test('demo copies the rendered examples and never launches a browser under --no-open', () => {
  // The first 60 seconds decide whether anyone keeps reading, so `demo` has to
  // put real rendered pages in front of someone without installing anything.
  tmp((dir) => {
    const dest = join(dir, 'shown');
    const r = cli('demo', dest, '--no-open');
    assert.equal(r.status, 0, r.stderr);
    const out = stripAnsi(r.stdout);

    assert.ok(existsSync(join(dest, 'index.html')), 'demo produced no front door');
    assert.ok(existsSync(join(dest, 'sample-app', 'preview.html')), 'the reference app is missing');
    const harnesses = readdirSync(join(dest, 'component-states')).filter(f => f.endsWith('.html'));
    assert.ok(harnesses.length >= 20, `only ${harnesses.length} component harnesses were copied`);

    assert.match(out, /Not opening a browser/, '--no-open must suppress the launch');
    assert.doesNotMatch(out, /Opening it in your browser/);
  });
});

test('demo --dry writes nothing', () => {
  tmp((dir) => {
    const dest = join(dir, 'nothing-here');
    const r = cli('demo', dest, '--dry');
    assert.equal(r.status, 0, r.stderr);
    assert.ok(!existsSync(join(dest, 'index.html')), '--dry created files');
  });
});

test('a mistyped flag is refused, not read as a destination path', () => {
  // --forse used to fall through into the positional args and become a folder.
  const r = cli('init', '--forse');
  assert.equal(r.status, 1, 'an unknown flag must fail');
  assert.match(stripAnsi(r.stderr + r.stdout), /unknown flag: --forse/);
  assert.ok(!existsSync(join(ROOT, '--forse')), 'a flag became a directory');
});

/**
 * `version` exists because the Homebrew formula's test block asserts the CLI
 * reports the version Homebrew installed. That assertion only means something
 * if the number is read from the running package rather than typed, so this
 * checks the number AND where it came from.
 */
test('version prints package.json, under every spelling', () => {
  const expected = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).version;
  for (const spelling of ['version', '--version', '-v']) {
    const r = cli(spelling);
    assert.equal(r.status, 0, `\`${spelling}\` exited ${r.status}`);
    assert.equal(stripAnsi(r.stdout).trim(), expected,
      `\`${spelling}\` printed something other than package.json's version`);
  }
  const src = readFileSync(join(ROOT, 'bin', 'cli.js'), 'utf8');
  assert.match(src, /require\(path\.join\(ROOT, 'package\.json'\)\)\.version/,
    'the version must be read from package.json, never retyped into the source');
});

/**
 * A Codex install has no CLAUDE.md and no slash commands. The closing line used
 * to tell every user to open Claude Code and run /design-tokens regardless,
 * which names a file they do not have and a mechanism their agent does not
 * implement - the first thing a Codex user would see, and wrong.
 */
test('the closing line matches the surface that was installed', () => {
  // The closing line only, not the whole log: the codex route also prints a
  // note saying the Claude-Code-only areas were skipped, which is correct and
  // mentions Claude Code on purpose.
  const closing = (out) => stripAnsi(out).trim().split('\n').pop();

  tmp((dir) => {
    const line = closing(cli('init', '--agent', 'codex', dir).stdout);
    assert.match(line, /AGENTS\.md is read automatically/);
    assert.doesNotMatch(line, /Claude Code/, 'a Codex install closed by pointing at Claude Code');
    assert.doesNotMatch(line, /\/design-tokens/, 'a Codex install advertised a slash command');
  });
  tmp((dir) => {
    const line = closing(cli('init', dir).stdout);
    assert.match(line, /CLAUDE\.md loads automatically/);
    assert.match(line, /\/design-tokens/);
  });
});

/**
 * The claim the closing line makes about the codex route has to be true: slash
 * commands, skills, rules and the critic are Claude Code mechanisms, so on that
 * route they are dead files. `.claude/` should not exist at all.
 */
test('a codex install ships no Claude Code mechanism', () => {
  tmp((dir) => {
    cli('init', '--agent', 'codex', dir);
    assert.ok(existsSync(join(dir, 'AGENTS.md')), 'AGENTS.md was not installed');
    assert.ok(!existsSync(join(dir, 'CLAUDE.md')), 'CLAUDE.md leaked onto the codex route');
    assert.ok(!existsSync(join(dir, '.claude')), '.claude/ leaked onto the codex route');
    // The gates are plain Node and Python, so they must still be there.
    assert.ok(existsSync(join(dir, 'scripts', 'verify_states.mjs')), 'the gates did not install');
    assert.ok(existsSync(join(dir, 'tokens', 'colors.json')), 'the tokens did not install');
  });
});
