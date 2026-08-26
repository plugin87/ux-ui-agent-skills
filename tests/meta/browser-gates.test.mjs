/**
 * Meta-gate: the render gates must still REJECT a broken page.
 *
 * These are the gates whose verdict nobody can eyeball — real computed contrast,
 * real Tab order, real overflow. Each one gets a page built to break exactly the
 * thing it claims to measure, plus a clean page it must accept, so "passing"
 * cannot mean "no longer looking".
 *
 * DS_REQUIRE_BROWSER=1 is set for every run (see helpers/run.mjs -> gate), and a
 * SKIPPED line is treated as a failure: a gate that did not open a browser has
 * not measured anything.
 */
import { test, before } from 'node:test';
import { gate, rejects, accepts, F } from '../helpers/run.mjs';
import { requireBrowser } from '../helpers/preflight.mjs';

before(requireBrowser);

const CLEAN = F('good/clean-panel.html');

// ---------------------------------------------------------------- rejections

test('measure_render rejects text below 4.5:1 on the real render', () => {
  rejects(gate('measure_render.mjs', [F('bad/low-contrast.html')]), /2\.07:1|need 4\.5/);
});

test('verify_states rejects a button that only fails on hover', () => {
  // The specificity trap: fine at rest, broken on hover. measure_render alone misses it.
  const r = rejects(gate('verify_states.mjs', [F('bad/hover-fail.html')]), /hover/);
  if (!/below WCAG AA/.test(r.out)) throw new Error(`wrong reason:\n${r.out}`);
});

test('axe_audit rejects a control with no accessible name', () => {
  rejects(gate('axe_audit.mjs', [F('bad/unlabelled.html')]), /violation/i);
});

test('verify_target_size rejects a 16x16 target with a crowded neighbour', () => {
  rejects(gate('verify_target_size.mjs', [F('bad/tiny-target.html')]), /16x16 \(min 24x24\)/);
});

test('lint_intent rejects a destructive action wearing the primary accent', () => {
  rejects(gate('lint_intent.mjs', [F('bad/blue-delete.html')]), /destructive but painted with action\.primary/);
});

test('verify_responsive rejects horizontal overflow at 280px', () => {
  rejects(gate('verify_responsive.mjs', [F('bad/overflow-280.html')]), /@280px overflow/);
});

test('verify_keyboard rejects a stateful control Enter and Space cannot operate', () => {
  rejects(gate('verify_keyboard.mjs', [F('bad/dead-key-toggle.html')]), /verify_keyboard: FAIL/);
});

test('verify_overflow rejects silently clipped text', () => {
  rejects(gate('verify_overflow.mjs', [F('bad/clipped.html')]), /clipped/);
});

test('verify_reduced_motion rejects content revealed only by an entrance animation', () => {
  rejects(gate('verify_reduced_motion.mjs', [F('bad/motion-reveal.html')]), /verify_reduced_motion: FAIL/);
});

test('verify_focustrap rejects a dialog Tab can walk out of', () => {
  rejects(
    gate('verify_focustrap.mjs', [F('bad/leaky-modal.html'), '--open=#openBtn']),
    /focus ESCAPED the dialog/);
});

test('verify_interactive rejects an aria-sort header that sorts nothing', () => {
  rejects(gate('verify_interactive.mjs', [F('bad/fake-sort.html')]), /declares aria-sort but a click changes nothing/);
});

test('verify_rtl rejects a physical margin that does not mirror', () => {
  rejects(gate('verify_rtl.mjs', [F('bad/physical-margin.html')]), /RTL introduces .* horizontal overflow/);
});

test('slop_tells --strict rejects the hardcoded indigo gradient', () => {
  rejects(gate('slop_tells.mjs', ['--strict', F('bad/indigo-gradient.html')]), /HIGH.*gradient/);
});

test('taste_audit --strict rejects a 1.5x type scale (bold body, not display type)', () => {
  rejects(gate('taste_audit.mjs', ['--strict', F('bad/bold-body.html')]), /HIGH.*type-scale/);
});

// ---------------------------------------------------------------- acceptances
//
// One page that has to survive every render gate, light and dark. If a gate ever
// starts failing this, it has become stricter than the rules it enforces.

const ACCEPTS = [
  ['measure_render (light)',      'measure_render.mjs',      [CLEAN]],
  ['measure_render (dark)',       'measure_render.mjs',      ['--dark', CLEAN]],
  ['verify_states (light)',       'verify_states.mjs',       [CLEAN]],
  ['verify_states (dark)',        'verify_states.mjs',       ['--dark', CLEAN]],
  ['axe_audit',                   'axe_audit.mjs',           [CLEAN]],
  ['verify_responsive',           'verify_responsive.mjs',   [CLEAN]],
  ['verify_responsive (1.25x)',   'verify_responsive.mjs',   [CLEAN, '--scale=1.25']],
  ['verify_target_size',          'verify_target_size.mjs',  [CLEAN]],
  ['verify_keyboard',             'verify_keyboard.mjs',     [CLEAN]],
  ['verify_reduced_motion',       'verify_reduced_motion.mjs', [CLEAN]],
  ['verify_overflow',             'verify_overflow.mjs',     [CLEAN]],
  ['lint_intent',                 'lint_intent.mjs',         [CLEAN]],
  ['verify_interactive',          'verify_interactive.mjs',  [CLEAN]],
  ['verify_rtl',                  'verify_rtl.mjs',          [CLEAN]],
  ['slop_tells --strict',         'slop_tells.mjs',          ['--strict', CLEAN]],
  ['taste_audit --strict',        'taste_audit.mjs',         ['--strict', CLEAN]],
];

for (const [label, script, args] of ACCEPTS) {
  test(`${label} accepts the clean panel`, () => { accepts(gate(script, args)); });
}

test('verify_focustrap accepts a dialog that traps Tab, closes on Escape and returns focus', () => {
  accepts(gate('verify_focustrap.mjs', [F('good/trapped-modal.html'), '--open=#openBtn']));
});

test('verify_focustrap accepts the same dialog in dark mode', () => {
  accepts(gate('verify_focustrap.mjs', [F('good/trapped-modal.html'), '--open=#openBtn', '--dark']));
});
