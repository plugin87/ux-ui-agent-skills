/**
 * Mobile-first, which the kit preached and its own examples did not practise.
 *
 * Before 2026-10-05 the examples carried 90 `max-width` media queries against 9
 * `min-width` ones, and ten pages were desktop-first in the way that matters:
 * strip every query and the base layer could not fit a phone at all. Agents copy
 * examples far more readily than they follow prose, so the examples were teaching
 * the opposite of the rule.
 *
 * The gate does not count keywords - counting cannot tell a desktop-first
 * stylesheet from a mobile-first one with a couple of narrow refinements. It
 * removes every @media and @container rule and renders what is left at 320px.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { gate, ROOT, F } from '../helpers/run.mjs';

test('every example and template is mobile-first at the base', () => {
  const r = gate('verify_mobile_first.mjs', [join(ROOT, 'examples')]);
  assert.equal(r.status, 0, r.out);
  assert.match(r.stdout, /every base layer is already the mobile layout/);
});

test('it REJECTS a desktop-first page, and names what overflows', () => {
  const r = gate('verify_mobile_first.mjs', [F('bad/desktop-first.html')]);
  assert.equal(r.status, 1, `expected a finding, got ${r.status}:\n${r.out}`);
  assert.match(r.stdout, /desktop-first/);
  assert.match(r.stdout, /overflows by \d+px/);
  assert.match(r.stdout, /card/, 'a failure you cannot locate is half a gate');
});

test('it ACCEPTS a mobile-first page that uses max-width refinements', () => {
  // This is the half that proves the rule stays flexible. max-width is not
  // banned: a narrow refinement on top of a mobile base is exactly right, and a
  // gate that failed it would push people into contorted stylesheets.
  const r = gate('verify_mobile_first.mjs', [join(ROOT, 'tests/fixtures/good/mobile-first.html')]);
  assert.equal(r.status, 0, `the gate rejected a legitimate refinement:\n${r.out}`);
});

test('the ratio is reported, never gated on', () => {
  // A lopsided max/min count is worth a reviewer's eye and proves nothing on its
  // own, so it is a note and the build does not fail over it.
  const r = gate('verify_mobile_first.mjs', [join(ROOT, 'tests/fixtures/good/mobile-first.html')]);
  assert.equal(r.status, 0);
  const src = readFileSync(join(ROOT, 'scripts/verify_mobile_first.mjs'), 'utf8');
  assert.match(src, /warnings\.push/, 'the ratio should still be reported');
  assert.ok(!/warnings\.length[\s\S]{0,80}exit\(1\)/.test(src),
    'the ratio must not be able to fail the build');
});

test('the reduced-motion branch survives the strip', () => {
  // Deleting every @media would take prefers-reduced-motion with it and make
  // every page look animated to the next gate that ran.
  const src = readFileSync(join(ROOT, 'scripts/verify_mobile_first.mjs'), 'utf8');
  assert.match(src, /prefers-reduced-motion/);
});
