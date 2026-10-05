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
]);

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
  for (const line of text.slice(4, end).split('\n')) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const m = line.match(/^([A-Za-z][\w-]*)\s*:/);
    if (m) keys.push(m[1]);
  }
  return { keys, text };
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
  // `npx skills add` copies the skill folders alone - no scripts/, no tokens/,
  // no taste/. Without this check a skill proceeds from files it never opened
  // and produces confident output built on nothing.
  const missing = [];
  for (const name of skills()) {
    const text = readFileSync(join(SKILLS, name, 'SKILL.md'), 'utf8');
    if (!text.includes('${CLAUDE_SKILL_DIR}/../../../')) continue;
    if (!text.includes('Step 0 — is the kit here?')) missing.push(name);
  }
  assert.deepEqual(missing, [],
    `these read kit files with no kit check: ${missing.join(', ')}`);
});

test('the kit check names the install that fixes it, not just the failure', () => {
  const text = readFileSync(join(SKILLS, 'design-code/SKILL.md'), 'utf8');
  assert.match(text, /KIT_MISSING/);
  assert.match(text, /npx ux-ui-agent-skills init/,
    'a failure the user cannot act on is only half a message');
  assert.match(text, /Do not guess the\n> contents of a file you could not open/,
    'the skill must be told to stop, not to improvise');
});
