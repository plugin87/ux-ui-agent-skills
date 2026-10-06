#!/usr/bin/env node
/**
 * SessionStart: say what can actually be measured here, before anything is built.
 *
 * Most of this kit's gates open a real browser. Without one they print SKIPPED
 * and exit 0, which reads like a pass to a model scanning output. The agent
 * should know that from the first turn, not discover it when it is about to
 * state a contrast ratio.
 *
 * Prints to stdout, which Claude Code adds to the session context. Installs
 * nothing, and must finish fast.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function playwrightPresent() {
  for (const p of [join(ROOT, 'node_modules/playwright/package.json'),
                   join(process.cwd(), 'node_modules/playwright/package.json')]) {
    if (existsSync(p)) return true;
  }
  return false;
}

/** A browser Playwright can actually drive, without launching one. */
function browserPresent() {
  const home = process.env.HOME || '';
  const macChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  if (existsSync(macChrome)) return true;
  const caches = [join(home, 'Library/Caches/ms-playwright'), join(home, '.cache/ms-playwright')];
  return caches.some(c => existsSync(c));
}

const pw = playwrightPresent();
const br = browserPresent();

const lines = ['[ux-ui-agent-skills] Verification preflight'];

if (pw && br) {
  lines.push('  Render gates CAN run here. Run them through scripts/gate.mjs so the');
  lines.push('  result is recorded, and quote the output rather than remembering it.');
} else {
  lines.push(`  Render gates CANNOT run here (playwright: ${pw ? 'yes' : 'no'}, browser: ${br ? 'yes' : 'no'}).`);
  lines.push('  Fix: npm install && npx playwright install chrome');
  lines.push('  Until then, every contrast, state, axe, target-size, overflow and');
  lines.push('  responsive claim is UNMEASURED. Say so in your answer. A render gate');
  lines.push('  with no browser prints SKIPPED and exits 0 - that is not a pass.');
}

lines.push('  Browser-free gates always work: lint_hardcodes, check_no_emoji,');
lines.push('  validate_theme_refs, validate_tokens, validate_contrast.');

console.log(lines.join('\n'));
process.exit(0);
