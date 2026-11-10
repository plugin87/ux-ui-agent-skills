/**
 * Launch the browser a render gate measures in, or say plainly that there is
 * none. One contract for every gate, the one measure_render.mjs set first:
 *
 *   DS_REQUIRE_BROWSER=1   no browser is a failure: "REQUIRED, FAILING", exit 1.
 *                          accuracy_report.mjs, gate.mjs, evals/run.mjs and the
 *                          MCP server always set it.
 *   otherwise              "SKIPPED (no browser)", exit 0, and the line says
 *                          that nothing was measured. Local convenience only.
 *
 * Before this existed, sixteen gates called chromium.launch() bare. With
 * Playwright installed and no browser they died on a stack trace, exit 1: never
 * a false pass, but a message that named a Playwright internal instead of the
 * missing browser and the one command that fixes it.
 *
 * `fallback` tries Playwright's bundled Chromium when system Chrome will not
 * launch. Gates that need the real Chrome channel (font metrics, target sizes)
 * pass false, so they never measure in a different engine than they claim.
 */
export async function launchOrSkip(chromium, gate, { fallback = true } = {}) {
  let err;
  try { return await chromium.launch({ channel: 'chrome' }); }
  catch (e) { err = e; }
  if (fallback) {
    try { return await chromium.launch(); }
    catch (e) { err = e; }
  }
  const why = String(err?.message || err).split('\n')[0];
  if (process.env.DS_REQUIRE_BROWSER === '1') {
    console.log(`${gate}: REQUIRED, FAILING: no browser could launch (${why}).`);
    console.log('Fix: npm install && npx playwright install chrome');
    process.exit(1);
  }
  console.log(`${gate}: SKIPPED (no browser): ${why}. Nothing was measured, so this is not a pass.`);
  console.log('Fix: npm install && npx playwright install chrome');
  process.exit(0);
}
