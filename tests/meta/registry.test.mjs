/**
 * The two gate registries are hand-maintained literals in two files, and the
 * counts they claim are retyped into CI and the docs. That drifted: ci.yml said
 * "12 objective gates" while evals/run.mjs had 14, and nothing noticed.
 *
 * These tests count the real arrays and hold the prose to them.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from '../helpers/run.mjs';

const read = (...p) => readFileSync(join(ROOT, ...p), 'utf8');

/** Count top-level [ ... ] entries in an array literal, ignoring nested brackets. */
function countEntries(src, opener) {
  const body = src.split(opener)[1].split('\n];')[0];
  let depth = 0, n = 0;
  for (const ch of body) {
    if (ch === '[') depth++;
    else if (ch === ']') { depth--; if (depth === 0) n++; }
  }
  return n;
}

const accuracy = countEntries(read('scripts', 'accuracy_report.mjs'), 'const checks = [');
const evals = countEntries(read('evals', 'run.mjs'), 'const GATES = [');

test('the accuracy report still runs the full check list', () => {
  // Not a magic number to bump casually: dropping a check silently shrinks what
  // "100%" means. Adding one is fine — update this line in the same commit.
  assert.equal(accuracy, 37, `accuracy_report.mjs now has ${accuracy} checks`);
});

test('the eval scorer still runs the full gate list', () => {
  assert.equal(evals, 14, `evals/run.mjs now has ${evals} gates`);
});

test('every count claimed in prose matches the array it describes', () => {
  // Scoped per claim: README talks about both registries on different lines, so
  // a blanket regex would match the wrong number.
  const ci = read('.github', 'workflows', 'ci.yml');
  const ciClaim = ci.match(/(\d+) objective gates/);
  assert.ok(ciClaim, 'ci.yml no longer states a gate count');
  assert.equal(Number(ciClaim[1]), evals, 'ci.yml disagrees with evals/run.mjs');

  const rep = read('scripts', 'accuracy_report.mjs').match(/(\d+)-gate cold-start scorer/);
  assert.ok(rep, 'accuracy_report.mjs no longer names the eval gate count');
  assert.equal(Number(rep[1]), evals, 'accuracy_report.mjs disagrees with evals/run.mjs');

  const readme = read('README.md');
  const shipped = readme.match(/\*\*(\d+) objective gates\*\*/);
  assert.ok(shipped, 'README no longer states how many gates ship');
  assert.equal(Number(shipped[1]), accuracy, 'README disagrees with accuracy_report.mjs');

  for (const line of readme.split('\n').filter(l => l.includes('evals/run.mjs'))) {
    const n = line.match(/(\d+) objective gates/);
    if (n) assert.equal(Number(n[1]), evals, `README line disagrees with evals/run.mjs: ${line.trim()}`);
  }
});

test('evals/README spells the same number it scores with', () => {
  const WORDS = { 12: 'Twelve', 13: 'Thirteen', 14: 'Fourteen', 15: 'Fifteen', 16: 'Sixteen' };
  const src = read('evals', 'README.md');
  const written = new RegExp(WORDS[evals], 'i');
  assert.match(src, written, `evals/README.md does not say "${WORDS[evals]}" but run.mjs has ${evals} gates`);
});
