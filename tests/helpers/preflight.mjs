/**
 * A gate that cannot open a browser proves nothing, and this suite exists to
 * prove things. So the browser is a hard precondition here: if Playwright or
 * the Chrome channel is missing, the meta-gate tests must fail loudly rather
 * than pass on fourteen skipped subprocesses.
 *
 * Six gates (verify_keyboard, verify_overflow, verify_reduced_motion,
 * verify_responsive, verify_target_size, lint_intent) launch
 * chromium.launch({ channel: 'chrome' }) with no bundled-chromium fallback, so
 * real Chrome is checked separately from Playwright itself.
 */
let cached;

export async function browserPreflight() {
  if (cached) return cached;
  const problems = [];
  let chromium;
  try { ({ chromium } = await import('playwright')); }
  catch { problems.push('playwright is not installed — run `npm install`'); }

  if (chromium) {
    try { const b = await chromium.launch(); await b.close(); }
    catch (e) { problems.push(`bundled chromium will not launch (${e.message.split('\n')[0]}) — run \`npx playwright install chromium\``); }
    try { const b = await chromium.launch({ channel: 'chrome' }); await b.close(); }
    catch (e) { problems.push(`the "chrome" channel will not launch (${e.message.split('\n')[0]}) — six gates require real Chrome`); }
  }

  cached = problems;
  return problems;
}

/** Throw unless the machine can actually render. Call once per meta-gate file. */
export async function requireBrowser() {
  const problems = await browserPreflight();
  if (problems.length) {
    throw new Error(
      'browser preflight failed — the meta-gate suite cannot prove anything without a browser:\n  - ' +
      problems.join('\n  - '));
  }
}
