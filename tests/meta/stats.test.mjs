/**
 * scripts/stats.mjs holds every stated count to the filesystem. A check that
 * only ever sees agreeing prose proves nothing, so this feeds it a wrong
 * truth and asserts it notices, the same way tests/meta drives every gate
 * with broken input.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { collect, check } from '../../scripts/stats.mjs';
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
