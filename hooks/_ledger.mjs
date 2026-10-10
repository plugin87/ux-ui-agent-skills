/**
 * Where the hooks record what this session edited.
 *
 * Its own file because both hooks need the same path and neither may import
 * the other: `posttooluse-fast-gates.mjs` runs its work at the top level, so
 * importing it from the Stop hook would run a PostToolUse pass as a side
 * effect of asking where a file lives.
 *
 * One ledger per project AND per session. Under a plugin install the data
 * directory is shared by every project on the machine, and CLAUDE_SESSION_ID
 * is not always set - a `claude -p` run has none - so keying on the session
 * alone put every such run in one `edited-local.jsonl`. Observed on
 * 2026-10-08: a session in /tmp/mcptest was told that ten files under
 * /tmp/blind-plugin were unmeasured. Being blocked by work you did not do, in
 * a repository you are not in, is the fastest way to get a hook switched off.
 */
import { createHash } from 'node:crypto';
import { readdirSync, rmSync } from 'node:fs';
import { join, resolve, relative, isAbsolute } from 'node:path';

export function ledgerDir() {
  const data = process.env.CLAUDE_PLUGIN_DATA;
  if (data) return join(data, 'receipts');
  return join(process.env.CLAUDE_PROJECT_DIR || process.cwd(), '.ds-receipts');
}

export function projectDir() {
  return resolve(process.env.CLAUDE_PROJECT_DIR || process.cwd());
}

/**
 * The ledger for this project and this session, or null when the session is
 * unknown. The hook's stdin carries session_id on every event; the environment
 * variable does not reach hook processes. With neither there is no ledger at
 * all: a shared fallback name is exactly how sessions came to block each other
 * (2026-10-10, five files from two other repositories).
 */
export function ledgerFile(payload = {}) {
  const session = String(payload.session_id || process.env.CLAUDE_SESSION_ID || '')
    .replace(/[^\w-]/g, '');
  if (!session) return null;
  const tag = createHash('sha256').update(projectDir()).digest('hex').slice(0, 10);
  return join(ledgerDir(), `edited-${tag}-${session}.jsonl`);
}

/** True when `p` lies inside the current project. The Stop hook never names anything else. */
export function insideProject(p) {
  const rel = relative(projectDir(), resolve(p));
  return rel !== '' && !rel.startsWith('..') && !isAbsolute(rel);
}

/**
 * Delete ledgers written by versions up to 2.9.6, whose names were shared
 * across sessions (`edited-local.jsonl`, `edited-<tag>-local.jsonl`). Left in
 * place they keep a stale list of edits that an older hook still reads.
 */
export function removeLegacyLedgers() {
  let removed = 0;
  try {
    for (const f of readdirSync(ledgerDir())) {
      if (/^edited-(?:[0-9a-f]{10}-)?local\.jsonl$/.test(f)) {
        rmSync(join(ledgerDir(), f), { force: true });
        removed++;
      }
    }
  } catch { /* no ledger directory yet: nothing to clean */ }
  return removed;
}
