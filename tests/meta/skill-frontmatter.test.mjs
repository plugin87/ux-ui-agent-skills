/**
 * Skill frontmatter, and the two things it was getting silently wrong.
 *
 * Claude Code ignores unknown frontmatter keys without an error. That is a
 * reasonable design and a trap: all 19 skills carried `invocation: user|model`,
 * a key Claude Code does not read, so the six marked user-only were auto-
 * invocable for as long as the field existed. Nothing failed, nothing warned,
 * and `claude plugin validate` passed the whole time.
 *
 * A typo in a key behaves identically. So the allowed set is pinned here: a new
 * key has to be added deliberately, in the same commit that starts using it.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from '../helpers/run.mjs';

const SKILLS = join(ROOT, '.claude/skills');

/** Keys this repo uses on purpose. Extend it when you start using another. */
const ALLOWED = new Set([
  'name',
  'description',
  'disable-model-invocation',
  // `critique` runs as a forked subagent so the critic never sees the
  // conversation that produced the work. Verified against the skills
  // frontmatter reference on 2026-10-07, which is the whole lesson of
  // `invocation:` below: a plausible key that nothing reads changes nothing.
  'context',
  'background',
]);

/** Values each field accepts, where the reference lists a closed set. */
const ALLOWED_VALUES = {
  context: new Set(['fork']),
  background: new Set(['true', 'false']),
};

/** The eleven that take an action or set a direction: the user's call, not the model's. */
const USER_STARTED = [
  'brandkit', 'governance', 'image-to-code', 'migrate-design-system', 'prototype',
  'redesign', 'gate', 'critique', 'grill-me', 'ship', 'scaffold-project',
];

function skills() {
  return readdirSync(SKILLS, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort();
}

function frontmatter(name) {
  const text = readFileSync(join(SKILLS, name, 'SKILL.md'), 'utf8');
  assert.ok(text.startsWith('---'), `${name}: no frontmatter`);
  const end = text.indexOf('\n---', 3);
  assert.ok(end > 0, `${name}: frontmatter is not closed`);
  const keys = [];
  const pairs = [];
  for (const line of text.slice(4, end).split('\n')) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const m = line.match(/^([A-Za-z][\w-]*)\s*:\s*(.*)$/);
    if (m) { keys.push(m[1]); pairs.push([m[1], m[2].trim()]); }
  }
  return { keys, pairs, text };
}

test('no skill carries a frontmatter key Claude Code does not read', () => {
  const offenders = [];
  for (const name of skills()) {
    for (const k of frontmatter(name).keys) {
      if (!ALLOWED.has(k)) offenders.push(`${name}: ${k}`);
    }
  }
  assert.deepEqual(offenders, [],
    `unknown frontmatter key(s). Claude Code ignores these silently, so a typo \
behaves exactly like a working field. Add it to ALLOWED only if it is real:\n  ${offenders.join('\n  ')}`);
});

test('`invocation` is gone - it never did anything', () => {
  for (const name of skills()) {
    assert.ok(!frontmatter(name).text.match(/^invocation:/m),
      `${name} still uses invocation:, which Claude Code does not read`);
  }
});

test('every skill that should be user-started says so with the real field', () => {
  for (const name of USER_STARTED) {
    const { keys } = frontmatter(name);
    assert.ok(keys.includes('disable-model-invocation'),
      `${name} must carry disable-model-invocation: true`);
  }
});

test('no other skill is accidentally hidden from the model', () => {
  // The inverse matters as much: a design skill the model cannot reach is a
  // skill that never runs.
  const hidden = skills().filter(n =>
    frontmatter(n).keys.includes('disable-model-invocation') && !USER_STARTED.includes(n));
  assert.deepEqual(hidden, [],
    `these are hidden from the model but are not on the user-started list: ${hidden.join(', ')}`);
});

test('every skill that reads kit files checks the kit is there first', () => {
  /* `npx skills add` copies the skill folders alone - no scripts/, no tokens/,
     no taste/. Without this check a skill proceeds from files it never opened
     and produces confident output built on nothing.
  
     This checks the probe and its position, not the heading above it. It used
     to require the literal string "Step 0 - is the kit here?", which failed the
     moment design-screen moved its taste block to the top: the kit check was
     still there, still first, and no longer step zero. A test on a label fails
     for a renamed heading and passes for a probe that was moved after the reads
     it protects - which is the wrong way round. */
  const missing = [], outOfOrder = [];
  for (const name of skills()) {
    const text = readFileSync(join(SKILLS, name, 'SKILL.md'), 'utf8');
    const firstUse = text.indexOf('${CLAUDE_SKILL_DIR}/../../../');
    if (firstUse === -1) continue;

    const probe = text.indexOf('KIT_MISSING');
    if (probe === -1) { missing.push(name); continue; }

    /* The probe is itself a ${CLAUDE_SKILL_DIR} reference, so the first use in
       the file must be the probe's own line - anything earlier reads the kit
       before establishing the kit is there. */
    const probeLineStart = text.lastIndexOf('\n', text.lastIndexOf('`ls ${CLAUDE_SKILL_DIR}')) + 1;
    if (firstUse < probeLineStart) outOfOrder.push(name);
  }
  assert.deepEqual(missing, [],
    `these read kit files with no kit check: ${missing.join(', ')}`);
  assert.deepEqual(outOfOrder, [],
    `these read a kit file before checking the kit is there: ${outOfOrder.join(', ')}`);
});

test('the kit check names the install that fixes it, not just the failure', () => {
  const text = readFileSync(join(SKILLS, 'design-code/SKILL.md'), 'utf8');
  assert.match(text, /KIT_MISSING/);
  assert.match(text, /npx ux-ui-agent-skills init/,
    'a failure the user cannot act on is only half a message');
  assert.match(text, /Do not guess the\n> contents of a file you could not open/,
    'the skill must be told to stop, not to improvise');
});


/**
 * `context: fork` is only worth having if the fork actually returns something
 * in the turn that asked for it. Forked skills run in the BACKGROUND by
 * default, so a skill that sets `context: fork` and forgets `background: false`
 * hands the user a "started" notice instead of the critique they asked for -
 * the field doing half its job, which is the hardest kind of bug to notice.
 */
test('a forked skill waits for its own result', () => {
  for (const name of skills()) {
    const { pairs } = frontmatter(name);
    const map = Object.fromEntries(pairs);
    if (map.context !== 'fork') continue;
    assert.equal(map.background, 'false',
      `${name} sets context: fork without background: false, so its result arrives after the turn that asked for it`);
    assert.equal(map['disable-model-invocation'], 'true',
      `${name} forks but is model-invocable; a fork the model can start on its own spends a whole subagent without the user asking`);
  }
});

test('every frontmatter value is one the field accepts', () => {
  const bad = [];
  for (const name of skills()) {
    for (const [k, v] of frontmatter(name).pairs) {
      const allowed = ALLOWED_VALUES[k];
      if (allowed && !allowed.has(v)) bad.push(`${name}: ${k}: ${v}`);
    }
  }
  assert.deepEqual(bad, [], `value(s) outside what the reference lists:\n  ${bad.join('\n  ')}`);
});

/**
 * The critique skill deliberately carries no `agent:` field. A plugin
 * namespaces its components, so this repo's critic is `design-critic` on the
 * init route and `ux-ui-agent-skills:design-critic` under a plugin install, and
 * no single value is right on both. The skill body loads the brief from a
 * ${CLAUDE_SKILL_DIR}-relative path instead, which resolves either way.
 *
 * This is pinned because `agent: design-critic` is the obvious-looking edit,
 * and it would silently stop briefing the critic on the route the README
 * recommends first.
 */
test('the forked critic is briefed by path, not by a route-dependent agent name', () => {
  const { pairs, text } = frontmatter('critique');
  const map = Object.fromEntries(pairs);
  assert.equal(map.agent, undefined,
    'critique sets agent:, which cannot be correct on both the plugin and init routes');
  assert.match(text, /\$\{CLAUDE_SKILL_DIR\}\/\.\.\/\.\.\/\.\.\/\.claude\/agents\/design-critic\.md/,
    'critique no longer loads design-critic.md, so the fork would improvise a critique');
});
