/**
 * Screen economy — the owner's rule, and the gate that holds it.
 *
 * Every part of the screen earns its space, in two senses that both bind:
 * space, because the viewport is scarce on a phone, and energy, because large
 * bright areas and endless motion cost battery.
 *
 * Six broken fixtures, one per failing check. A gate that has only ever seen
 * passing input proves nothing, and this one needed that discipline more than
 * most: its first two thresholds were both wrong in ways only a real run
 * showed. The hollow-box check measured ink coverage and failed a checkout
 * panel full of content at 15%, because text set at a comfortable line-height
 * does not cover a third of its own box in ink - it would have told every
 * author with good spacing that their panels were empty. It measures unused
 * space now. The endless-motion check flagged every loading spinner until the
 * page's own `aria-busy` was allowed to answer for it.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, gate, rejects, accepts } from '../helpers/run.mjs';

const BAD = 'tests/fixtures/bad/economy';

/** One fixture per failing check, named by the check it must trip. */
const EXPECTED = {
  'hero-fills-screen.html': /1 oversized media/,
  'image-wider-than-viewport.html': /1 oversized media/,
  'hollow-box.html': /2 hollow box/,
  'first-screen-is-all-image.html': /3 first screen/,
  'unsized-eager-image.html': /4 image weight/,
  'infinite-spinner.html': /5 endless motion/,
};

test('every failing check has a fixture that trips it', () => {
  const onDisk = readdirSync(join(ROOT, BAD)).filter(f => f.endsWith('.html')).sort();
  assert.deepEqual(onDisk, Object.keys(EXPECTED).sort(),
    'the fixtures on disk and the checks they cover have drifted apart');
});

for (const [file, expect] of Object.entries(EXPECTED)) {
  test(`verify_screen_economy rejects ${file}`, { timeout: 180000 }, () => {
    rejects(gate('verify_screen_economy.mjs', [`${BAD}/${file}`]), expect);
  });
}

test('it accepts a clean page', { timeout: 180000 }, () => {
  accepts(gate('verify_screen_economy.mjs', ['tests/fixtures/good/clean-panel.html']), /OK/);
});

/**
 * The two opt-outs are deliberate and narrow. A harness is not a product
 * screen and does not owe a primary action above the fold; motion that never
 * stops on purpose has to say why, in a sentence, because a bare switch gets
 * flipped to quiet a gate and a reason has to be read by whoever flips it.
 */
test('a bare opt-out does not silence the motion check', { timeout: 180000 }, () => {
  const src = readFileSync(join(ROOT, 'scripts/verify_screen_economy.mjs'), 'utf8');
  assert.match(src, /waiver\[1\]\.trim\(\)\.length > 15/,
    'the endless-motion waiver no longer requires a reason');
  assert.match(src, /data-harness/, 'the harness opt-out is gone');
});

/**
 * The thresholds live in the token source, not in the script. A gate whose
 * numbers are constants in its own source cannot be adjusted without editing
 * the gate - and then it gets edited to pass.
 */
test('every threshold comes from tokens/sizing.json', () => {
  const sizing = JSON.parse(readFileSync(join(ROOT, 'tokens/sizing.json'), 'utf8'));
  assert.ok(sizing.screen, 'tokens/sizing.json has no `screen` section');
  for (const k of ['media-max-block', 'box-max-viewport-share', 'box-min-content-density', 'image-bytes-budget']) {
    assert.ok(sizing.screen[k], `tokens/sizing.json -> screen is missing ${k}`);
    assert.ok(sizing.screen[k].$description?.length > 30,
      `${k} has no description saying what it is for`);
  }

  const src = readFileSync(join(ROOT, 'scripts/verify_screen_economy.mjs'), 'utf8');
  const body = src.split('const T = {')[1].split('};')[0];
  assert.ok(/screen\[/.test(body), 'the thresholds are not read from the token source');
  assert.doesNotMatch(body, /=\s*0\.\d+\s*[,;]/,
    'a threshold is hardcoded in the script instead of read from tokens');
});

/**
 * The doctrine and the gate must agree. The kit used to teach the opposite of
 * this rule - "bento sizing" as the answer to repeated cards, a full-bleed card
 * image, a screen-filling hero archetype - so an agent following the docs would
 * fail the gate that enforces the owner's rule.
 */
test('the doctrine no longer teaches what the gate rejects', () => {
  const taste = readFileSync(join(ROOT, 'taste/design-taste.md'), 'utf8');
  assert.match(taste, /## Screen economy/, 'design-taste.md does not state the rule');
  assert.match(taste, /sizing\.screen\.media-max-block/, 'the rule does not name its tokens');

  const contradictions = [
    ['taste/design-taste.md', /bento sizing/],
    ['components/molecules.md', /Image: full-bleed/],
    ['taste/aesthetic-systems.md', /full-bleed media, dramatic hero scale/],
    ['.claude/skills/image-to-code/SKILL.md', /full-bleed hero/],
  ];
  for (const [f, pattern] of contradictions) {
    if (!existsSync(join(ROOT, f))) continue;
    assert.doesNotMatch(readFileSync(join(ROOT, f), 'utf8'), pattern,
      `${f} still recommends what verify_screen_economy rejects`);
  }

  const systems = readFileSync(join(ROOT, 'taste/aesthetic-systems.md'), 'utf8');
  assert.match(systems, /never overrides \*\*screen economy\*\*/,
    'the Library Contract does not say economy wins over a named system');
});
