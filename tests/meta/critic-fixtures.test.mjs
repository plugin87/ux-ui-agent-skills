/**
 * The seeded-defect fixtures, and the one property that makes them worth having.
 *
 * `tests/fixtures/critic/` holds four pages carrying fourteen deliberate design
 * defects, and `evals/critic-answer-key.json` says what they are. They exist to
 * score the critic (H6), which only works while **no gate in this repo can
 * catch any of them**. The moment a fixture trips a gate, scoring it measures
 * the gate instead, and the H6 number silently starts describing something
 * else.
 *
 * So that property is a test rather than a note: every fixture must pass every
 * browser gate, in light and dark, with DS_REQUIRE_BROWSER=1 so a missing
 * browser fails loudly instead of printing SKIPPED and exiting 0.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, gate, run } from '../helpers/run.mjs';

const DIR = 'tests/fixtures/critic';
const KEY = JSON.parse(readFileSync(join(ROOT, 'evals/critic-answer-key.json'), 'utf8'));

const fixtures = () =>
  readdirSync(join(ROOT, DIR)).filter(f => f.endsWith('.html')).sort();

test('the answer key and the fixtures describe the same four pages', () => {
  const onDisk = new Set(fixtures());
  const inKey = new Set(KEY.defects.map(d => d.fixture));

  for (const f of inKey) {
    assert.ok(onDisk.has(f), `the key names ${f}, which is not in ${DIR}`);
  }
  for (const f of onDisk) {
    assert.ok(inKey.has(f), `${f} has no defects in the key, so critiquing it scores nothing`);
  }
});

test('every defect is fully specified', () => {
  const ids = new Set();
  for (const d of KEY.defects) {
    assert.ok(/^D\d+-[a-z-]+$/.test(d.id), `malformed id: ${d.id}`);
    assert.ok(!ids.has(d.id), `duplicate defect id: ${d.id}`);
    ids.add(d.id);
    assert.ok(d.defect && d.defect.length > 40, `${d.id}: the defect is not described`);
    assert.ok(d.rule && d.rule.includes('.md'), `${d.id}: no rule file cited`);
    assert.ok(Array.isArray(d.signals) && d.signals.length >= 4,
      `${d.id}: needs at least four alternative phrasings, or the keyword match is a coin flip`);
    for (const s of d.signals) {
      assert.doesNotThrow(() => new RegExp(s, 'i'), `${d.id}: signal is not a valid regex: ${s}`);
    }
  }
});

/**
 * The answer key must stay out of reach. If a fixture, or anything the critic is
 * told to read, pointed at the key, the critic would be marking its own paper.
 */
test('nothing the critic reads points at the answer key', () => {
  const reachable = [
    ...fixtures().map(f => join(ROOT, DIR, f)),
    join(ROOT, '.claude/agents/design-critic.md'),
    join(ROOT, '.claude/skills/critique/SKILL.md'),
  ].filter(existsSync);

  for (const f of reachable) {
    const text = readFileSync(f, 'utf8');
    assert.ok(!/critic-answer-key/.test(text),
      `${f} mentions the answer key, so the critic can read the answers`);
  }
});

test('the scorer refuses input it cannot attribute to a page', () => {
  // A critique scored against every page at once credits the critic for
  // defects on pages it never opened - the first version of the scorer did
  // exactly that, and over-counted on its first real input.
  const r = run('node', ['evals/score_critic.mjs', 'README.md']);
  assert.equal(r.status, 2, `expected exit 2, got ${r.status}:\n${r.out}`);
  assert.match(r.out, /could not tell which page/);
});

test('the scorer treats a missing file as a non-run, not a zero', () => {
  const r = run('node', ['evals/score_critic.mjs', 'critique-async-lies-nope.md']);
  assert.equal(r.status, 2, `expected exit 2, got ${r.status}`);
  assert.match(r.out, /not a 0% catch rate/);
});

/**
 * The property the whole instrument rests on. Slow by design: it renders four
 * pages through thirteen gates in both themes, and there is no cheaper way to
 * know the fixtures still measure judgement rather than tooling.
 */
const BROWSER_GATES = [
  ['measure_render.mjs', []], ['measure_render.mjs', ['--dark']],
  ['verify_states.mjs', []], ['verify_states.mjs', ['--dark']],
  ['axe_audit.mjs', []], ['axe_audit.mjs', ['--dark']],
  ['verify_keyboard.mjs', []],
  ['verify_target_size.mjs', []],
  ['verify_overflow.mjs', []],
  ['verify_reduced_motion.mjs', []],
  ['verify_interactive.mjs', []],
  ['lint_intent.mjs', []],
  ['slop_tells.mjs', ['--strict']],
  ['taste_audit.mjs', ['--strict']],
  ['verify_responsive.mjs', ['--scale=1.25']],
];

for (const f of fixtures()) {
  test(`${f} passes every gate, so only judgement can catch its defects`, { timeout: 300000 }, () => {
    const rejected = [];
    for (const [script, args] of BROWSER_GATES) {
      const r = gate(script, [...args, `${DIR}/${f}`]);
      if (/SKIPPED/.test(r.out)) {
        throw new Error(`${script} SKIPPED - no browser. Run: npm install && npx playwright install chrome`);
      }
      if (r.status !== 0) rejected.push(`${script} ${args.join(' ')} -> exit ${r.status}\n${r.out.trim().split('\n').slice(-6).join('\n')}`);
    }
    assert.deepEqual(rejected, [],
      `a gate caught a seeded defect in ${f}. Scoring it would measure the gate, not the critic:\n\n${rejected.join('\n\n')}`);
  });
}
