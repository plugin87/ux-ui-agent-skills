/**
 * The `claude plugin eval` suite, checked before a run is paid for.
 *
 * Every case costs real model calls. The first run of this suite spent $0.33
 * to discover that a grader regex used an inline `(?i)`, which JavaScript does
 * not support and which the plugin-evals reference says in as many words - a
 * line that had been read before the grader was written. A run reports a
 * throwing grader as a failure, so the money buys a message a static check
 * gives away for nothing.
 *
 * None of this runs the suite. It checks that the suite is well-formed, that
 * every skill it names exists, and that its "never auto-invoked" claims are
 * written in the one shape that actually asserts never.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from '../helpers/run.mjs';

const MANIFEST = JSON.parse(readFileSync(join(ROOT, '.claude-plugin/plugin.json'), 'utf8'));
const EVAL_DIR = (MANIFEST.experimental?.evals || 'evals').replace(/^\.\//, '');

/** Fields the plugin-evals reference lists for prompt.md frontmatter. */
const PROMPT_FIELDS = new Set([
  'schema_version', 'name', 'description', 'tags', 'plugins', 'runs',
  'expected_outcome', 'model', 'max_turns', 'timeout_seconds', 'allowed_tools',
  'append_system_prompt', 'env',
]);

/** Keys every grader may carry, plus the per-type options. */
const GRADER_FIELDS = new Set([
  'type', 'weight', 'arm',
  'pattern', 'flags', 'match', 'target',                 // regex
  'tool', 'input_match', 'min', 'max',                   // tool_used
  'before', 'after',                                     // tool_order
  'path', 'exists',                                      // file_exists
  'criteria', 'focus',                                   // llm
  'baseline_file',                                       // baseline
]);
const GRADER_TYPES = new Set(['regex', 'tool_used', 'tool_order', 'file_exists', 'llm', 'baseline']);

function frontmatter(text) {
  assert.ok(text.startsWith('---'), 'no frontmatter');
  const end = text.indexOf('\n---', 3);
  assert.ok(end > 0, 'frontmatter is not closed');
  const out = {};
  for (const line of text.slice(4, end).split('\n')) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const m = line.match(/^([A-Za-z][\w-]*)\s*:\s*(.*)$/);
    if (m) out[m[1]] = m[2].trim();
  }
  return out;
}

const cases = () =>
  readdirSync(join(ROOT, EVAL_DIR), { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name !== 'results')
    .map(d => d.name)
    .sort();

const graders = (c) => {
  const dir = join(ROOT, EVAL_DIR, c, 'graders');
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(f => f.endsWith('.md'))
    .map(f => ({ name: f, ...frontmatter(readFileSync(join(dir, f), 'utf8')) }));
};

test('the eval directory the manifest declares exists and holds cases', () => {
  assert.ok(existsSync(join(ROOT, EVAL_DIR)),
    `plugin.json declares experimental.evals = ${EVAL_DIR}, which does not exist`);
  assert.ok(cases().length >= 8, `only ${cases().length} cases found in ${EVAL_DIR}`);
});

test('every case has a prompt and at least one grader', () => {
  for (const c of cases()) {
    assert.ok(existsSync(join(ROOT, EVAL_DIR, c, 'prompt.md')), `${c}: no prompt.md`);
    assert.ok(graders(c).length >= 1, `${c}: no graders - the case fails to load`);
  }
});

test('no prompt or grader carries a field the reference does not list', () => {
  const bad = [];
  for (const c of cases()) {
    const fm = frontmatter(readFileSync(join(ROOT, EVAL_DIR, c, 'prompt.md'), 'utf8'));
    for (const k of Object.keys(fm)) if (!PROMPT_FIELDS.has(k)) bad.push(`${c}/prompt.md: ${k}`);
    for (const g of graders(c)) {
      for (const k of Object.keys(g)) {
        if (k === 'name') continue;
        if (!GRADER_FIELDS.has(k)) bad.push(`${c}/graders/${g.name}: ${k}`);
      }
      assert.ok(GRADER_TYPES.has(g.type), `${c}/graders/${g.name}: unknown type "${g.type}"`);
    }
  }
  // An unknown key in prompt.md frontmatter is an error, not a warning.
  assert.deepEqual(bad, [], `unknown field(s):\n  ${bad.join('\n  ')}`);
});

/**
 * The $0.33 lesson. Inline `(?i)` is not supported; case-insensitivity goes in
 * `flags`. A grader that throws is reported as a failed grader, so an invalid
 * regex looks exactly like a plugin that behaved wrongly.
 */
test('every grader regex compiles, with its own flags', () => {
  const bad = [];
  for (const c of cases()) {
    for (const g of graders(c)) {
      for (const key of ['pattern', 'input_match']) {
        const raw = g[key];
        if (!raw) continue;
        const src = raw.replace(/^'(.*)'$/s, '$1').replace(/^"(.*)"$/s, '$1');
        assert.ok(!src.includes('(?i)'),
          `${c}/graders/${g.name}: inline (?i) is not supported - use flags: i`);
        try { new RegExp(src, g.flags || ''); }
        catch (e) { bad.push(`${c}/graders/${g.name}: ${e.message}`); }
      }
    }
  }
  assert.deepEqual(bad, [], `grader regex would throw at run time:\n  ${bad.join('\n  ')}`);
});

test('every skill a grader names actually exists', () => {
  const installed = new Set(readdirSync(join(ROOT, '.claude/skills'), { withFileTypes: true })
    .filter(d => d.isDirectory()).map(d => d.name));
  const missing = [];
  for (const c of cases()) {
    for (const g of graders(c)) {
      if (g.tool !== 'Skill' || !g.input_match) continue;
      // The graders name the skill inside the namespace-tolerant pattern.
      const m = g.input_match.match(/\)\?([\w-]+)\\?"/);
      assert.ok(m, `${c}/graders/${g.name}: cannot read a skill name out of input_match`);
      if (!installed.has(m[1])) missing.push(`${c}/graders/${g.name}: ${m[1]}`);
    }
  }
  assert.deepEqual(missing, [], `grader names a skill that does not exist:\n  ${missing.join('\n  ')}`);
});

/**
 * "Never auto-invoked" has exactly one correct spelling. `min: 0` alone still
 * passes when the skill fired, because min is a floor. And without `arm: both`
 * a Skill grader is excluded from scoring in a two-arm run, so the claim would
 * be reported as an indicator and never counted.
 */
test('a "must not invoke" claim is written so it can actually fail', () => {
  const wrong = [];
  for (const c of cases()) {
    for (const g of graders(c)) {
      const negative = /not-auto|^no-/.test(g.name.replace(/\.md$/, ''));
      if (!negative) continue;
      if (g.min !== '0') wrong.push(`${c}/graders/${g.name}: min is ${g.min}, must be 0`);
      if (g.max !== '0') wrong.push(`${c}/graders/${g.name}: max is ${g.max}, must be 0`);
      if (g.arm !== 'both') wrong.push(`${c}/graders/${g.name}: arm is ${g.arm}, must be both or it is not scored`);
    }
  }
  assert.deepEqual(wrong, [], `negative claim written so it cannot fail:\n  ${wrong.join('\n  ')}`);
});

/**
 * The eleven user-started skills are the reason this suite exists: they all
 * carried `invocation: user`, a key Claude Code does not read, so they were
 * auto-invocable for as long as the field existed and nothing noticed. At
 * least a third of them must have a case here that invites them by name and
 * asserts they stay out.
 */
/**
 * A case tagged `artifact` asks for something the kit writes as files in the
 * project - a screen, a token set - in a session that grants no Write and no
 * Bash. Its reply is therefore whatever the model happens to say about being
 * unable to produce it, and in one run it spent 28 turns trying and timed out
 * before saying anything at all.
 *
 * Three graders were written against those replies before this rule replaced
 * them, and all three measured the sandbox rather than the plugin. One full run
 * settled the line with evidence:
 *
 *   dtcg-shape           token-request      1/2   produces a token file
 *   taste-block-first    screen-request     0/2   produces a screen
 *   destructive-by-intent component-request 2/2   produces prose
 *   solves-it            unrelated-code     2/2   produces one short function
 *   answers-anyway       wcag-explainer     2/2   produces a number
 *
 * So: a case whose answer would normally be files grades routing only, and caps
 * its turns so it cannot spiral. A case answerable in a message may grade the
 * message. See the NOTES.md beside each tagged case.
 */
test('an artifact case grades routing only, and is capped so it cannot spiral', () => {
  for (const c of cases()) {
    const fm = frontmatter(readFileSync(join(ROOT, EVAL_DIR, c, 'prompt.md'), 'utf8'));
    if (!/\bartifact\b/.test(fm.tags || '')) continue;

    const turns = Number(fm.max_turns);
    assert.ok(turns <= 4,
      `${c}: max_turns is ${turns}. An artifact request in a read-only session spends every turn it is given; the routing claim is settled by turn two.`);

    const output = graders(c).filter(g => g.type === 'regex' && (g.target ?? 'last_message') !== 'trace');
    assert.deepEqual(output.map(g => g.name), [],
      `${c} is tagged artifact but grades its own output (${output.map(g => g.name).join(', ')}). It cannot produce files - it has no Write or Bash. Grade routing here and output quality in evals/.`);

    assert.ok(existsSync(join(ROOT, EVAL_DIR, c, 'NOTES.md')),
      `${c} is tagged artifact but has no NOTES.md saying why it grades routing only`);
  }
});

test('the user-started skills are covered by an invitation case', () => {
  const covered = new Set();
  for (const c of cases()) {
    for (const g of graders(c)) {
      if (g.tool !== 'Skill' || g.max !== '0') continue;
      const m = g.input_match?.match(/\)\?([\w-]+)\\?"/);
      if (m) covered.add(m[1]);
    }
  }
  const USER_STARTED = ['brandkit', 'governance', 'image-to-code', 'migrate-design-system',
    'prototype', 'redesign', 'gate', 'critique', 'grill-me', 'ship', 'scaffold-project'];
  const hit = USER_STARTED.filter(s => covered.has(s));
  assert.ok(hit.length >= 4,
    `only ${hit.length} of the ${USER_STARTED.length} user-started skills have an invitation case: ${hit.join(', ')}`);
});
