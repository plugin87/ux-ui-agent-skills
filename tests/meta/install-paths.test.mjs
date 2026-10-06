/**
 * The plugin surface must stay reachable on every install route.
 *
 * Before 2026-10-05 all 156 kit-file references in the skills, commands and
 * agent were bare repo-root paths. On the plugin route - the one the README
 * recommends first - every one of them resolved against the user's own project,
 * where the kit is not, so a skill that says "read accessibility/wcag-checklist.md"
 * read nothing. Nothing failed; the model simply proceeded without the file.
 *
 * That is the quietest failure in the kit: no error, no gate, just an agent
 * working from less than it was given. These tests hold the fix in place.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { py, ROOT, F } from '../helpers/run.mjs';

test('every reference in the plugin surface is built from a path variable', () => {
  const r = py('measure_install_paths.py', ['--gate']);
  assert.equal(r.status, 0, r.out);
  assert.match(r.stdout, /every reference in the plugin surface carries a path variable/);
});

test('it REJECTS a surface that has gone back to bare repo-root paths', () => {
  // The fixture is one skill written the way the whole surface used to be.
  const r = py('measure_install_paths.py', ['--root', F('bad/bare-paths'), '--gate']);
  assert.equal(r.status, 1, `expected a finding, got ${r.status}:\n${r.out}`);
  assert.match(r.stdout, /accessibility\/wcag-checklist\.md/);
  assert.match(r.stdout, /scripts\/measure_render\.mjs/);
  assert.match(r.stdout, /CLAUDE_SKILL_DIR/, 'the failure must say how to fix it');
});

test('plugin and init resolve every reference; skills-add is reported, not hidden', () => {
  const r = py('measure_install_paths.py', ['--json']);
  assert.equal(r.status, 0, r.out);
  const d = JSON.parse(r.stdout);
  assert.equal(d.routes.plugin.share, 1, 'plugin route must resolve everything');
  assert.equal(d.routes.init.share, 1, 'init route must resolve everything');
  // skills-add copies the skill folder alone, so no spelling of a path reaches
  // the kit there. It stays visible at its real value rather than being dropped
  // from the measurement to make the headline rounder.
  assert.equal(d.routes['skills-add'].share, 0,
    'if this is no longer 0, the kit became reachable on that route - update this test and HARNESS.md');
});

test('a subagent is handed the kit root, because it has no CLAUDE_SKILL_DIR', () => {
  // An agent gets no skill directory of its own. design-critic therefore takes
  // $KIT, and the skill that delegates to it has to pass the value - otherwise
  // the agent either guesses a path or silently reviews without the scripts.
  const agent = readFileSync(join(ROOT, '.claude/agents/design-critic.md'), 'utf8');
  const usesKit = agent.includes('$KIT/');
  assert.ok(usesKit, 'design-critic should reference scripts through $KIT');

  const critique = readFileSync(join(ROOT, '.claude/skills/critique/SKILL.md'), 'utf8');
  assert.match(critique, /KIT=\$\{CLAUDE_SKILL_DIR\}\/\.\.\/\.\.\/\.\./,
    'critique must pass the resolved kit root in its delegation message');
  assert.match(agent, /If no `KIT=` was passed/,
    'the agent must say what to do when the value is missing, not guess');
});

test('the converted commands stay user-started, as commands were', () => {
  // Converting a command into a skill makes it model-invocable by default, which
  // would let the model run /ship or /scaffold-project on its own. These five
  // are user affordances and must behave as they did before the conversion.
  for (const name of ['gate', 'critique', 'grill-me', 'ship', 'scaffold-project']) {
    const p = join(ROOT, '.claude/skills', name, 'SKILL.md');
    const text = readFileSync(p, 'utf8');
    assert.match(text, /^disable-model-invocation:\s*true$/m,
      `${name} must keep disable-model-invocation: true`);
  }
});

test('no command file is left behind, and plugin.json no longer lists any', () => {
  let leftover = [];
  try {
    leftover = readdirSync(join(ROOT, '.claude/commands'));
  } catch { /* the directory is gone, which is the expected end state */ }
  assert.deepEqual(leftover, [], 'commands were converted to skills; none should remain');

  const manifest = JSON.parse(readFileSync(join(ROOT, '.claude-plugin/plugin.json'), 'utf8'));
  assert.ok(!('commands' in manifest),
    'plugin.json must not point at command files that no longer exist');
});
