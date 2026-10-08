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
import assert from 'node:assert/strict';
import { gate, rejects, accepts, py, F } from '../helpers/run.mjs';
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

test('verify_keyboard rejects an interactive role Tab can never reach', () => {
  // The gate used to filter this out before auditing: not tabbable, so not
  // looked at. A div role="button" with no tabindex is the commonest keyboard
  // bug there is, and the fixture pairs it with a correct one so a gate that
  // flagged the role itself would fail for the wrong reason.
  rejects(gate('verify_keyboard.mjs', [F('bad/div-button-no-tabindex.html')]), /A0 no tab stop/);
});

test('verify_overflow rejects silently clipped text', () => {
  rejects(gate('verify_overflow.mjs', [F('bad/clipped.html')]), /clipped/);
});

test('verify_reduced_motion rejects content revealed only by an entrance animation', () => {
  rejects(gate('verify_reduced_motion.mjs', [F('bad/motion-reveal.html')]), /verify_reduced_motion: FAIL/);
});

/**
 * The other half of check C, and the one it got wrong for real users.
 *
 * Respecting `prefers-reduced-motion` correctly means skipping an artificial
 * loading delay, so the reduced-motion reader reaches the content SOONER. The
 * gate used to sample both branches on a flat 450ms timer, catch the skeleton
 * mid-load in one and the finished content in the other, and report the
 * placeholder as "content lost under reduce" - sending the author to fix code
 * that was already right.
 *
 * Found on 2026-10-08 in the first blind run through the plugin route: six of
 * the ten files it produced failed this way, every one of them correct. The
 * gate now waits for the page to stop saying `aria-busy` AND for the visible
 * set to stop changing, so both branches are compared once they have settled.
 */
test('verify_reduced_motion accepts a skeleton that skips its delay under reduce', () => {
  accepts(gate('verify_reduced_motion.mjs', [F('good/skeleton-respects-reduce.html')]),
    /no content lost/);
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

// ------------------------------------------------- the README's before/after

test('the slop screen in the README is rejected by every gate the README claims', () => {
  // .github/images/before-slop.png is a screenshot of this file, and the README
  // prints what the gates say about it. If a gate ever stops catching one of
  // these, the README becomes a lie - so the claims are asserted here.
  const SLOP = F('bad/slop-screen.html');

  rejects(gate('measure_render.mjs', [SLOP]), /1\.00:1|need/);
  rejects(gate('measure_render.mjs', ['--dark', SLOP]), /need/);
  rejects(gate('verify_states.mjs', [SLOP]), /"Save Changes" 1\.00:1/);
  rejects(gate('verify_target_size.mjs', [SLOP]), /min 24x24/);
  rejects(gate('verify_responsive.mjs', [SLOP]), /@280px overflow/);
  rejects(gate('slop_tells.mjs', ['--strict', SLOP]), /HIGH/);
  rejects(gate('taste_audit.mjs', ['--strict', SLOP]), /HIGH/);
  rejects(gate('axe_audit.mjs', [SLOP]), /violation/i);
  // the hole this page exposed: intent was only checked against the page's own
  // tokens, so a page with none passed. A saturated non-danger fill on a
  // destructive label is now wrong-intent whether or not a theme exists.
  rejects(gate('lint_intent.mjs', [SLOP]), /Delete Account.*not a danger colour/s);
});

test('exactly ten gates reject the slop screen - the number both front doors print', () => {
  // examples/index.html says "ten of the gates reject it" and the README prints
  // a ten-row table of their verdicts. Counting it here is the only thing that
  // keeps both true: a gate that stops catching this page, or a new gate that
  // starts, moves the number and fails this test.
  //
  // Count it in a process, never in a shell loop. The first attempt at this
  // number read 13, from a zsh loop doing `node scripts/$g` where $g held
  // "slop_tells.mjs --strict": zsh does not word-split an unquoted expansion, so
  // every multi-word entry became one bogus filename, exited MODULE_NOT_FOUND,
  // and was counted as a rejection. A gate that cannot even start is not a gate
  // that found something, which is why only status 1 counts below and anything
  // else is an error.
  const SLOP = F('bad/slop-screen.html');
  const ONE_FILE = [
    'measure_render.mjs', 'verify_states.mjs', 'axe_audit.mjs', 'verify_keyboard.mjs',
    'verify_target_size.mjs', 'verify_overflow.mjs', 'verify_responsive.mjs',
    'verify_reduced_motion.mjs', 'lint_intent.mjs', 'verify_interactive.mjs',
    'verify_rtl.mjs',
  ];
  // status must be exactly 1 - the gates' "I found something" code. A crash or
  // a timeout gives null, which would otherwise inflate the count silently.
  const verdicts = [
    ...ONE_FILE.map(g => [g, gate(g, [SLOP]).status]),
    ...['slop_tells.mjs', 'taste_audit.mjs'].map(g => [g, gate(g, ['--strict', SLOP]).status]),
    ...['check_no_emoji.py', 'lint_hardcodes.py'].map(g => [g, py(g, [SLOP]).status]),
  ];
  const broken = verdicts.filter(([, st]) => st !== 0 && st !== 1);
  assert.equal(broken.length, 0, `gate(s) neither passed nor reported a finding: ${broken.map(([g, st]) => `${g}=${st}`).join(', ')}`);
  const rejecting = verdicts.filter(([, st]) => st === 1).map(([g]) => g);
  assert.equal(rejecting.length, 10, `gates rejecting the slop screen: ${rejecting.join(', ')}`);
});
