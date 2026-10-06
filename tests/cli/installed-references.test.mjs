/**
 * Scaffold a real project, then open every file the installed skills name.
 *
 * `measure_install_paths.py` reasons about whether a reference *would* resolve.
 * This does not reason: it runs the CLI, walks the installed skills, resolves
 * every `${CLAUDE_SKILL_DIR}/../../../...` against the directory the skill
 * actually landed in, and stats the file.
 *
 * It is the check that would have caught the gap the measurement only inferred:
 * `AREAS` had no entry for `.claude/agents` or `examples`, so an initialised
 * project had no design-critic for `/critique` to delegate to, and every skill
 * holding up `examples/golden/` as the quality bar pointed at nothing.
 */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { run, ROOT } from '../helpers/run.mjs';

let project;

before(() => {
  project = mkdtempSync(join(tmpdir(), 'ds-init-'));
  const r = run('node', ['bin/cli.js', 'init', project]);
  assert.equal(r.status, 0, `init failed:\n${r.out}`);
});

after(() => {
  if (project) rmSync(project, { recursive: true, force: true });
});

/** Every `${CLAUDE_SKILL_DIR}/../../../<path>` in an installed skill. */
function referencesIn(skillDir, file) {
  const text = readFileSync(file, 'utf8');
  const out = [];
  const re = /\$\{CLAUDE_SKILL_DIR\}((?:\/\.\.)+)\/([A-Za-z0-9_./*-]*[A-Za-z0-9_*])/g;
  for (const m of text.matchAll(re)) {
    out.push({ up: m[1], rel: m[2], resolved: resolve(skillDir + m[1], m[2]) });
  }
  return out;
}

test('init installs every area the skills point at', () => {
  for (const area of ['tokens', 'taste', 'scripts', 'accessibility', 'components',
                      'workflows', 'content', 'frameworks', 'design-systems',
                      'examples', 'CLAUDE.md']) {
    assert.ok(existsSync(join(project, area)), `init did not install ${area}`);
  }
  assert.ok(existsSync(join(project, '.claude/skills')), 'init did not install the skills');
  assert.ok(existsSync(join(project, '.claude/rules')), 'init did not install the rules');
  // The critic was the one the CLI never copied, so /critique delegated to an
  // agent that did not exist in the project.
  assert.ok(existsSync(join(project, '.claude/agents/design-critic.md')),
    'init did not install the design-critic agent');
});

test('every file the installed skills name actually exists in the project', () => {
  const skillsRoot = join(project, '.claude/skills');
  const missing = [];
  let checked = 0;

  for (const d of readdirSync(skillsRoot, { withFileTypes: true })) {
    if (!d.isDirectory()) continue;
    const skillDir = join(skillsRoot, d.name);
    const file = join(skillDir, 'SKILL.md');
    if (!existsSync(file)) continue;

    for (const ref of referencesIn(skillDir, file)) {
      // A wildcard names a directory listing, so check the directory.
      const target = ref.rel.includes('*')
        ? resolve(skillDir + ref.up, ref.rel.split('*')[0])
        : ref.resolved;
      checked++;
      if (!existsSync(target)) missing.push(`${d.name}: ${ref.rel}`);
    }
  }

  assert.ok(checked > 100, `expected to check the whole surface, only saw ${checked} reference(s)`);
  assert.deepEqual(missing, [],
    `${missing.length} of ${checked} reference(s) do not exist in an initialised project:\n  ${missing.join('\n  ')}`);
});

test('the kit root arithmetic lands on the project root, not somewhere above it', () => {
  // ../../.. from <project>/.claude/skills/<name>/ is <project>. If a skill ever
  // moves a level, every reference silently starts resolving outside the project
  // - and on a developer machine it may still find the real repo, which is the
  // worst possible outcome: green locally, broken for everyone else.
  const skillDir = join(project, '.claude/skills/design-code');
  const root = resolve(skillDir, '../../..');
  assert.equal(root, resolve(project),
    `${skillDir} + ../../.. resolved to ${root}, not the project root`);
});

test('the installed skills are the ones the repo ships, not a stale copy', () => {
  const installed = readdirSync(join(project, '.claude/skills'), { withFileTypes: true })
    .filter(d => d.isDirectory()).map(d => d.name).sort();
  const shipped = readdirSync(join(ROOT, '.claude/skills'), { withFileTypes: true })
    .filter(d => d.isDirectory()).map(d => d.name).sort();
  assert.deepEqual(installed, shipped);
});

test('a scaffolded project is not carrying the repo build output', () => {
  // dist/ and node_modules/ are not the user's problem.
  for (const junk of ['dist', 'node_modules', '.git']) {
    assert.ok(!existsSync(join(project, junk)), `init leaked ${junk} into the project`);
  }
  // examples/ is the one big area now copied; make sure it is the real thing
  // and not an empty directory that satisfies existsSync.
  const golden = join(project, 'examples/golden/Button.tsx');
  assert.ok(existsSync(golden) && statSync(golden).size > 0,
    'examples/ was installed but examples/golden/Button.tsx is missing or empty');
});
