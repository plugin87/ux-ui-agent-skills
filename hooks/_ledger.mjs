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
import { join, resolve } from 'node:path';

export function ledgerDir() {
  const data = process.env.CLAUDE_PLUGIN_DATA;
  if (data) return join(data, 'receipts');
  return join(process.env.CLAUDE_PROJECT_DIR || process.cwd(), '.ds-receipts');
}

export function ledgerFile(payload = {}) {
  const project = resolve(process.env.CLAUDE_PROJECT_DIR || process.cwd());
  const tag = createHash('sha256').update(project).digest('hex').slice(0, 10);
  /* The hook's stdin carries session_id on every event; the environment
     variable does not reach hook processes, so it was always 'local' and two
     sessions in one project shared a ledger. */
  const session = (payload.session_id || process.env.CLAUDE_SESSION_ID || 'local')
    .replace(/[^\w-]/g, '');
  return join(ledgerDir(), `edited-${tag}-${session}.jsonl`);
}
