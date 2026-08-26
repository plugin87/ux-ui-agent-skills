/**
 * Unit layer: the arithmetic under the contrast gates, and the CLI contract
 * scripts/contrast.py documents. No browser, no fixtures — these run anywhere.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { run, py } from '../helpers/run.mjs';

test('the pure contrast functions hold their reference values', () => {
  const r = run('python3', ['tests/unit/python_units.py']);
  assert.equal(r.status, 0, r.out);
});

test('contrast.py exits 0 at or above AA and 1 below it', () => {
  // The documented contract: "Exit code 0 if it passes AA normal text, else 1."
  assert.equal(py('contrast.py', ['#767676', '#ffffff']).status, 0, 'AA boundary grey should pass');
  assert.equal(py('contrast.py', ['#777777', '#ffffff']).status, 1, 'just below AA should fail');
});

test('contrast.py exits 2 on unusable input rather than guessing', () => {
  assert.equal(py('contrast.py', ['zzz', '#000000']).status, 2);
  assert.equal(py('contrast.py', ['#000000']).status, 2, 'one colour is not a pair');
});

test('contrast.py reports the ratio it actually computed', () => {
  const r = py('contrast.py', ['#ffffff', '#000000']);
  assert.match(r.stdout, /21\.00:1/);
  assert.match(r.stdout, /Normal text {2}AAA \(7\.0:1\): PASS/);
});
