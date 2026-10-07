/**
 * The README states how the 51 checks split between the ones that open a real
 * browser and the ones that read files. Until 2026-10-07 it said 35/16 in one
 * place and 31 in another, and the real answer was 33/18 - three numbers, none
 * of them measured, inside the section about never stating a number you did not
 * measure. That is the failure this whole repo is about, printed on its own
 * front page.
 *
 * So the split is derived here rather than trusted: a check opens a browser if
 * and only if some gate it runs imports Playwright. If the report gains a gate,
 * or a gate gains or loses a browser, this fails until the README agrees.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, gate } from '../helpers/run.mjs';

/**
 * Gate scripts that actually drive a browser.
 *
 * Both spellings count: a static `import { chromium } from 'playwright'` and
 * the `await import('playwright')` inside a try that lets a gate print SKIPPED
 * when the browser is absent. Matching only the static form found one gate and
 * would have let this whole test pass by measuring almost nothing - which is
 * the exact shape of failure the file is here to prevent, so the count is
 * asserted to be plausible before anything is derived from it.
 */
function browserGates() {
  const dir = join(ROOT, 'scripts');
  return readdirSync(dir)
    .filter(f => f.endsWith('.mjs'))
    .filter(f => /(^import[^;]*from '|await import\(')(playwright|playwright-core)'/m
      .test(readFileSync(join(dir, f), 'utf8')));
}

/** Every top-level entry of the CHECKS array, as one string each. */
function checkEntries() {
  const lines = readFileSync(join(ROOT, 'scripts', 'accuracy_report.mjs'), 'utf8').split('\n');
  const out = [];
  let cur = null;
  const close = () => { if (cur !== null) out.push(cur); cur = null; };
  for (const l of lines) {
    if (/^ {2}\[/.test(l)) { close(); cur = l; }
    else if (/^\];/.test(l)) close();
    else if (cur !== null) cur += l;
  }
  close();
  return out;
}

test('the README states the browser/file split the report actually has', () => {
  const gates = browserGates();
  assert.ok(gates.length > 10, `only ${gates.length} browser gates found - the import check is wrong`);

  const re = new RegExp(gates.map(f => f.replace('.', '\\.')).join('|'));
  const entries = checkEntries();
  const browser = entries.filter(e => re.test(e)).length;
  const files = entries.length - browser;

  const readme = readFileSync(join(ROOT, 'README.md'), 'utf8');

  assert.match(readme, new RegExp(`\\*\\*${browser} of them open a real browser`),
    `README does not say ${browser} browser checks`);
  assert.match(readme, new RegExp(`those ${browser} report \`REQUIRED, FAILING\``),
    `the REQUIRED/FAILING sentence does not say ${browser}`);
  assert.match(readme, new RegExp(`${browser} of the ${entries.length} checks open a real`),
    `the "stated exactly" paragraph does not say ${browser} of ${entries.length}`);
  assert.match(readme, new RegExp(`The other ${files} read\\s+files`),
    `the "stated exactly" paragraph does not say ${files} file checks`);

  // And the total the README leads with must be the real number of checks.
  assert.match(readme, new RegExp(`\\*\\*${entries.length} objective gates\\*\\*`),
    `README does not lead with ${entries.length} gates`);
});

test('every browser gate refuses a path that is not there, by running it', () => {
  /* `_targets.mjs` exists because thirteen render gates handed a missing path
     straight to Playwright: on macOS that exited 1, and on Linux CI
     `verify_states.mjs tests/fixtures/nope.html` exited **0** - a typo in a
     filename reading as a clean pass.

     This checks the behaviour, not the implementation. An earlier version of
     this test looked for a `requireTargets` import and flagged
     `verify_mobile_first.mjs`, which guards its targets correctly in its own
     collect() - the test was wrong, the gate was fine. What matters is the exit
     code the gate actually produces, so run it.

     Exit 2, never 1: 1 means "I looked and found something wrong", 2 means "I
     could not look". A caller that treats them the same is already wrong. */
  const nowhere = 'tests/fixtures/__no_such_file__.html';
  const exempt = new Set(['screenshot_docs.mjs']);  // writes a directory, takes no target

  const bad = [];
  for (const g of browserGates()) {
    if (exempt.has(g)) continue;
    const r = gate(g, [nowhere]);
    if (r.status !== 2) bad.push(`${g}: exit ${r.status}`);
    else if (!/not found|Nothing was measured/i.test(r.out)) bad.push(`${g}: exit 2 but said nothing about the path`);
  }
  assert.deepEqual(bad, [], `gates mishandled a missing path:\n  ${bad.join('\n  ')}`);
});
