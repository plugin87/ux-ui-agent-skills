/**
 * scripts/stats.mjs holds every stated count to the filesystem. A check that
 * only ever sees agreeing prose proves nothing, so this feeds it a wrong
 * truth and asserts it notices, the same way tests/meta drives every gate
 * with broken input.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { collect, check, description } from '../../scripts/stats.mjs';
import { node } from '../helpers/run.mjs';

test('stats.json and every stated count agree with the filesystem', () => {
  const r = node('stats.mjs', ['--check']);
  assert.equal(r.status, 0, r.out);
});

test('a count that drifts is caught, per kind of count', () => {
  const real = collect();
  const bump = (path) => {
    const s = structuredClone(real);
    const keys = path.split('.');
    let o = s;
    for (const k of keys.slice(0, -1)) o = o[k];
    o[keys.at(-1)] += 1;
    return s;
  };
  for (const path of ['skills', 'gates.total', 'gates.browser', 'gates.files', 'evals.gates', 'designSystems.indexed']) {
    const { found } = check(bump(path));
    assert.ok(found.length > 0, `stats --check read no stated count of ${path}, so it could never catch it drifting`);
  }
});

test('the GitHub description is built from the counts and fits GitHub', () => {
  const s = collect();
  const d = description(s);
  assert.ok(d.includes(s.designSystems.indexed.toLocaleString('en-US')), d);
  assert.ok(d.includes(`${s.gates.total} gates`), d);
  assert.ok(d.length <= 350, `GitHub caps the description at 350 characters, this is ${d.length}`);
  assert.doesNotMatch(d, /[\u2013\u2014]/, 'no em or en dash');
  const r = node('stats.mjs', ['--description']);
  assert.equal(r.status, 0, r.out);
  assert.equal(r.stdout.trim(), d);
});
