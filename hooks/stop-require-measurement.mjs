#!/usr/bin/env node
/**
 * Stop: do not finish a session that edited UI and measured none of it.
 *
 * This is the rule "never state a number you did not measure" turned into
 * something that happens rather than something the model is asked to remember.
 * If the session edited a renderable file and there is no live receipt for it -
 * no receipt at all, or one whose hash no longer matches because the file was
 * edited after it was measured - say so and block.
 *
 * Two deliberate softenings:
 *   - stop_hook_active is checked first. It is true when Claude Code is already
 *     continuing because of a Stop hook, and blocking again there never ends.
 *   - With no browser on the machine the render gates cannot run at all, so
 *     blocking would be a demand nobody can satisfy. It downgrades to requiring
 *     the answer to say the work is unmeasured.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { liveReceiptsFor, receiptsDir } from '../scripts/gate.mjs';
import { ledgerFile } from './_ledger.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

let payload = {};
try { payload = JSON.parse(readFileSync(0, 'utf8') || '{}'); } catch { payload = {}; }

// Already continuing because of a Stop hook: let it through or it never ends.
if (payload.stop_hook_active) process.exit(0);

/* The same path the writer builds, imported rather than rebuilt: two copies of
   a path formula drift, and when they do this hook silently stops seeing any
   edits at all - which looks exactly like a clean session. */
const ledger = ledgerFile();
if (!existsSync(ledger)) process.exit(0);

const edited = [...new Set(
  readFileSync(ledger, 'utf8').split('\n').filter(Boolean)
    .map(l => { try { return JSON.parse(l).path; } catch { return null; } })
    .filter(Boolean)
    .filter(p => existsSync(p)))];

if (!edited.length) process.exit(0);

const unmeasured = edited.filter(p => liveReceiptsFor(p).length === 0);
if (!unmeasured.length) process.exit(0);

const browser = existsSync('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
  || existsSync(join(process.env.HOME || '', 'Library/Caches/ms-playwright'))
  || existsSync(join(process.env.HOME || '', '.cache/ms-playwright'));

const list = unmeasured.map(p => `  ${relative(ROOT, p) || p}`).join('\n');

if (!browser) {
  console.error(
    `[ux-ui-agent-skills] ${unmeasured.length} file(s) were edited and cannot be measured `
    + `here - this machine has no browser for the render gates:\n${list}\n\n`
    + `Not a blocker, but your answer must say the result is UNMEASURED rather than `
    + `implying it passed. Installing one: npx playwright install chrome`);
  process.exit(0);
}

console.error(
  `[ux-ui-agent-skills] ${unmeasured.length} file(s) were edited in this session and have `
  + `no live gate receipt:\n${list}\n\n`
  + `Run them through the wrapper, which records what it measured:\n`
  + `  node ${relative(process.cwd(), join(ROOT, 'scripts/gate.mjs')) || 'scripts/gate.mjs'} verify_states.mjs <file>\n`
  + `  node scripts/gate.mjs --check <file>\n\n`
  + `A receipt expires when the file changes after it was measured, which is exactly `
  + `when a remembered number stops being true.`);
process.exit(2);
