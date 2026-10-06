/**
 * Two instruction surfaces, held in step.
 *
 * `CLAUDE.md` is for Claude Code, where skills load on demand and hooks fire
 * whether or not the model remembers. `AGENTS.md` is the open convention Codex,
 * Cursor, Copilot, Jules, Aider, VS Code and about twenty more read. They
 * describe the same design system, so a rule that reaches only one of them is a
 * rule half the users never see - and nothing about writing two files makes them
 * stay equal on their own.
 *
 * Both failures this file guards against were found by running real Codex against
 * a freshly installed project, not by reading:
 *
 *   - Asked to name the two house rules, Codex answered with two different rules
 *     entirely. They were in the file, as unlabelled paragraphs among eight other
 *     bold paragraphs, and were not findable.
 *   - AGENTS.md told it to run `accuracy_report.mjs`, which is the KIT's
 *     self-test: it points at `tests/`, `evals/` and `examples/` inside the kit's
 *     own repository. In a consuming project it scored 17/50, a number that means
 *     nothing about that project.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { py, ROOT, F } from '../helpers/run.mjs';

const agents = () => readFileSync(join(ROOT, 'AGENTS.md'), 'utf8');

test('the two surfaces carry the same doctrine', () => {
  const r = py('validate_agents_surface.py');
  assert.equal(r.status, 0, r.out);
  assert.match(r.stdout, /carries every rule CLAUDE\.md does/);
});

test('it REJECTS a surface that quietly dropped two rules and typo-ed a gate', () => {
  // The fixture is the real AGENTS.md with three injuries, and a scripts/ of
  // empty files named after the real gates - so the only name that fails to
  // resolve is the typo, and the finding is sharp rather than a wall of noise.
  const r = py('validate_agents_surface.py', ['--root', F('bad/drifted-agents')]);
  assert.equal(r.status, 1, `expected a finding, got ${r.status}:\n${r.out}`);
  assert.match(r.stdout, /mobile is the base/);
  assert.match(r.stdout, /no native select/);
  assert.match(r.stdout, /the surfaces drifted/);
  assert.match(r.stdout, /verify_keyboadr\.mjs, which does not exist/);
});

test('the house rules are findable, not just present', () => {
  // Codex read right past them when they were unlabelled paragraphs. A heading is
  // the difference between a rule being in the file and a rule being answerable.
  assert.match(agents(), /###\s+The two house rules on what never ships/,
    'the house rules need a heading of their own');
});

test('it does not send a consuming project at the kit self-test', () => {
  const text = agents();
  assert.match(text, /kit's own self-test/,
    'AGENTS.md must say what accuracy_report.mjs actually measures');
  assert.match(text, /17\/50/,
    'the real number from the real run is the evidence; keep it');
  // and the quick reference must not still offer it as the one command
  assert.ok(!/accuracy_report\.mjs\s+#\s*everything/.test(text),
    'the quick reference still presents the self-test as the command to run');
});

test('every gate AGENTS.md names takes the files as an argument', () => {
  // A command shown with no target teaches the agent to run the kit's own sweep.
  const block = agents().match(/```bash\n([\s\S]*?)```/g) || [];
  const bare = [];
  for (const b of block) {
    for (const line of b.split('\n')) {
      const m = line.match(/^(?:node|python3)\s+(scripts\/[\w.]+)\s*(.*)$/);
      if (!m) continue;
      const [, script, rest] = m;
      if (script.includes('accuracy_report')) continue;     // named only to warn against it
      const args = rest.replace(/#.*/, '').trim();
      if (!args) bare.push(script);
    }
  }
  assert.deepEqual(bare, [],
    `these are shown with no target, so they read as "sweep the kit": ${bare.join(', ')}`);
});

test('it is honest that it enforces less than CLAUDE.md', () => {
  const text = agents();
  assert.match(text, /hook/i, 'it must mention what it does not have');
  assert.match(text, /request/i,
    'on this surface the rules are requests, and saying so is the point');
});
