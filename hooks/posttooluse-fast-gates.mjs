#!/usr/bin/env node
/**
 * PostToolUse on Write and Edit: run the browser-free gates on the file that
 * just changed, and remember that it changed.
 *
 * These four are cheap enough to run on every edit and catch the drift that is
 * hardest to see later: a raw hex that bypassed the theme, an emoji used as an
 * icon, a var() that resolves to nothing. A finding exits 2, which is how a
 * PostToolUse hook gets its stderr in front of Claude after the write.
 *
 * It also appends the file to a per-session ledger, which the Stop hook reads to
 * ask whether anything was edited and never measured.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, appendFileSync, existsSync, readFileSync } from 'node:fs';
import { join, dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const UI_EXT = new Set(['.html', '.htm', '.css', '.scss', '.tsx', '.jsx', '.vue', '.svelte']);

function ledgerDir() {
  const data = process.env.CLAUDE_PLUGIN_DATA;
  if (data) return join(data, 'receipts');
  return join(process.env.CLAUDE_PROJECT_DIR || process.cwd(), '.ds-receipts');
}
const ledgerFile = () =>
  join(ledgerDir(), `edited-${(process.env.CLAUDE_SESSION_ID || 'local').replace(/[^\w-]/g, '')}.jsonl`);

// `require` is not available in an ES module. The first version of this hook
// used it, the catch swallowed the ReferenceError, and the hook silently did
// nothing while exiting 0 - a hook that never fires is indistinguishable from a
// codebase with no findings.
let input = '';
try {
  input = readFileSync(0, 'utf8');
} catch { /* no stdin (run by hand): nothing to check */ }

let payload = {};
try { payload = JSON.parse(input || '{}'); } catch { payload = {}; }

const file = payload?.tool_input?.file_path || payload?.tool_input?.path;
if (!file || !UI_EXT.has(extname(file)) || !existsSync(file)) process.exit(0);

// Record the edit first. If a gate below crashes, the Stop hook must still know
// this file was touched - a missing ledger entry would read as "nothing to check".
try {
  mkdirSync(ledgerDir(), { recursive: true });
  appendFileSync(ledgerFile(), JSON.stringify({ at: new Date().toISOString(), path: resolve(file) }) + '\n');
} catch { /* a ledger we cannot write is reported by the Stop hook, not here */ }

const GATES = [
  ['python3', [join(ROOT, 'scripts/lint_hardcodes.py'), file]],
  ['python3', [join(ROOT, 'scripts/check_no_emoji.py'), file]],
];

const findings = [];
for (const [cmd, args] of GATES) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', timeout: 20000 });
  if (r.status === 1) {
    findings.push((r.stdout || '').trim().split('\n').filter(l => /^\s*x |FAIL/.test(l)).slice(0, 6).join('\n'));
  }
}

if (findings.length) {
  console.error(`[ux-ui-agent-skills] ${file} has findings a gate caught on write:\n`
    + findings.join('\n')
    + `\n\nFix them now, while the change is small. These are the browser-free gates;`
    + ` the render gates still have to be run through scripts/gate.mjs.`);
  process.exit(2);
}
process.exit(0);
