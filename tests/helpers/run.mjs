/**
 * Run a gate and keep its NUMERIC exit status.
 *
 * The repo's two runners (evals/run.mjs, scripts/accuracy_report.mjs) both use
 * execSync, which throws on non-zero and reduces the status to a boolean. A
 * suite whose whole job is "prove the gate still fails" needs the number, and
 * needs to tell a real finding apart from a crash or a usage message — so this
 * uses spawnSync and exposes status, stdout and stderr.
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const ROOT = fileURLToPath(new URL('../..', import.meta.url));

export function run(cmd, args = [], opts = {}) {
  const r = spawnSync(cmd, args, {
    cwd: ROOT,
    encoding: 'utf8',
    env: { ...process.env, ...(opts.env || {}) },
    timeout: opts.timeout ?? 120000,
  });
  const stdout = r.stdout || '';
  const stderr = r.stderr || '';
  return { status: r.status, stdout, stderr, out: stdout + stderr, signal: r.signal };
}

export const py = (script, args = [], opts) => run('python3', [`scripts/${script}`, ...args], opts);
export const node = (script, args = [], opts) => run('node', [`scripts/${script}`, ...args], opts);

/** Node gates need a real browser; a SKIPPED line is never a pass in this suite. */
export const gate = (script, args = [], opts = {}) =>
  node(script, args, { ...opts, env: { DS_REQUIRE_BROWSER: '1', ...(opts.env || {}) } });

/**
 * Assert a gate REJECTED a fixture — and did it for the right reason.
 *
 * status must be exactly 1 (the gates' own "I found something" code). A crash
 * (null status from a signal), a usage message, or a skipped browser would all
 * produce a non-zero-ish result that says nothing about detection, so each is
 * rejected explicitly. `expect` pins the finding to the signal under test.
 */
export function rejects(res, expect) {
  const detail = () => `\n--- exit ${res.status} ---\n${res.out.trim()}\n`;
  if (res.signal) throw new Error(`gate died on signal ${res.signal}${detail()}`);
  if (/SKIPPED/.test(res.out)) throw new Error(`gate SKIPPED instead of running${detail()}`);
  if (/^usage:/im.test(res.out)) throw new Error(`gate printed usage — the path never reached it${detail()}`);
  if (res.status !== 1) throw new Error(`expected exit 1, got ${res.status}${detail()}`);
  if (expect && !expect.test(res.out)) throw new Error(`exit 1 but not for the expected reason (${expect})${detail()}`);
  return res;
}

/** Assert a gate ACCEPTED a clean fixture — and actually looked at it. */
export function accepts(res, expect) {
  const detail = () => `\n--- exit ${res.status} ---\n${res.out.trim()}\n`;
  if (res.signal) throw new Error(`gate died on signal ${res.signal}${detail()}`);
  if (/SKIPPED/.test(res.out)) throw new Error(`gate SKIPPED instead of running${detail()}`);
  if (/^usage:/im.test(res.out)) throw new Error(`gate printed usage — the path never reached it${detail()}`);
  if (res.status !== 0) throw new Error(`expected exit 0, got ${res.status}${detail()}`);
  if (expect && !expect.test(res.out)) throw new Error(`exit 0 but the gate does not look like it ran (${expect})${detail()}`);
  return res;
}

export const F = (p) => `tests/fixtures/${p}`;
