#!/usr/bin/env node
/**
 * Run a gate and leave a receipt.
 *
 * "Never state a number you did not measure" is the first rule in this repo and
 * the only one with nothing behind it: a model can type a contrast ratio as
 * easily as it can measure one, and nothing downstream can tell the difference.
 *
 * This wrapper closes that. It runs the gate with DS_REQUIRE_BROWSER=1 always
 * set, so a missing browser fails instead of printing SKIPPED and exiting 0, and
 * writes one JSON line per run: which gate, which file, the SHA-256 of that file
 * AT THE MOMENT IT WAS MEASURED, the exit code, the numbers the gate printed, and
 * when.
 *
 * The hash is the point. A receipt is only evidence while the file still hashes
 * the same; edit the file and the receipt is expired, which is exactly the case
 * where a remembered number becomes a lie.
 *
 * Usage:
 *   node scripts/gate.mjs verify_states.mjs examples/sample-app/preview.html
 *   node scripts/gate.mjs --list                 # receipts for this session
 *   node scripts/gate.mjs --check <file>         # is there a live receipt for it?
 *   node scripts/gate.mjs --dir                  # print the receipts directory
 *
 * Exit code is the gate's own. --check exits 1 when a file has no live receipt.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, appendFileSync, readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, resolve, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

/** Where receipts live. A plugin gets a data dir; a clone keeps them in-tree. */
export function receiptsDir() {
  const data = process.env.CLAUDE_PLUGIN_DATA;
  if (data) return join(data, 'receipts');
  return join(process.env.CLAUDE_PROJECT_DIR || process.cwd(), '.ds-receipts');
}

/** One file per session, so a receipt from a previous session is never reused. */
function receiptsFile() {
  const id = process.env.CLAUDE_SESSION_ID || 'local';
  return join(receiptsDir(), `${id.replace(/[^\w-]/g, '')}.jsonl`);
}

export function hashFile(p) {
  try {
    return createHash('sha256').update(readFileSync(p)).digest('hex').slice(0, 16);
  } catch {
    return null;
  }
}

/**
 * The numbers a gate printed. Deliberately shallow: this records what was on
 * screen so a later claim can be checked against it, and does not try to parse
 * every gate's format into a schema that would rot.
 */
function measuredValues(out) {
  const values = [];
  for (const m of out.matchAll(/(\d+(?:\.\d+)?):1/g)) values.push(`${m[1]}:1`);
  for (const m of out.matchAll(/(\d+)\s*\/\s*(\d+) checks passed/g)) values.push(`${m[1]}/${m[2]}`);
  // Nouns the gates actually count, hyphenated forms included
  // ("19 element-state(s)", "3 reference(s)", "1 violation").
  const COUNTED = /(\d+)\s+([a-z-]*(?:violation|finding|state|reference|problem|check|target|element|file)[a-z-]*)\(?s?\)?/gi;
  for (const m of out.matchAll(COUNTED)) values.push(`${m[1]} ${m[2]}`);
  return [...new Set(values)].slice(0, 24);
}

/** Files the gate was pointed at, as given. */
function targetsFrom(args) {
  return args.filter(a => !a.startsWith('-') && extname(a) && existsSync(a));
}

/**
 * Write one receipt, for a caller that ran the gate itself.
 *
 * `accuracy_report.mjs` runs 51 checks, several of them long `&&` chains across
 * many files, so wrapping each one in this script would mean re-parsing those
 * chains here. It records its own receipts through this instead, which keeps
 * one definition of what a receipt is and one place that decides when one is
 * live.
 *
 * `files` are the paths the check measured. A receipt is evidence only while
 * every one of them still hashes the same, so a caller that under-reports its
 * files writes a receipt that outlives the measurement - which is the one
 * failure this whole mechanism exists to prevent.
 */
export function writeReceipt({ gate, args = [], exit, files = [], values = {}, at }) {
  const targets = files.map(f => ({ path: resolve(f), sha256: hashFile(f) }))
    .filter(t => t.sha256);
  const receipt = {
    at: at || new Date().toISOString(),
    gate, args, exit, targets, values,
    browser_required: true,
  };
  try {
    mkdirSync(receiptsDir(), { recursive: true });
    appendFileSync(receiptsFile(), JSON.stringify(receipt) + '\n');
    return true;
  } catch (err) {
    console.error(`gate.mjs: could not write a receipt for ${gate} (${err.message}). `
      + 'Treat that check as unrecorded.');
    return false;
  }
}

export function readReceipts() {
  const f = receiptsFile();
  if (!existsSync(f)) return [];
  return readFileSync(f, 'utf8').split('\n').filter(Boolean).map(l => {
    try { return JSON.parse(l); } catch { return null; }
  }).filter(Boolean);
}

/** A receipt is live when the file still hashes as it did when measured. */
export function liveReceiptsFor(file) {
  const now = hashFile(file);
  if (!now) return [];
  const abs = resolve(file);
  return readReceipts().filter(r =>
    r.targets.some(t => resolve(t.path) === abs && t.sha256 === now));
}

function main(argv) {
  if (argv.includes('--dir')) {
    console.log(receiptsDir());
    return 0;
  }

  if (argv.includes('--list')) {
    const rs = readReceipts();
    if (!rs.length) {
      console.log('No receipts in this session. Nothing has been measured yet.');
      return 0;
    }
    for (const r of rs) {
      const verdict = r.exit === 0 ? 'pass' : `FAIL(${r.exit})`;
      const stale = r.targets.filter(t => hashFile(t.path) !== t.sha256);
      const mark = stale.length ? `  [EXPIRED: ${stale.map(t => relative(ROOT, t.path)).join(', ')} changed since]` : '';
      console.log(`${r.at}  ${verdict.padEnd(8)} ${r.gate} ${r.targets.map(t => relative(ROOT, t.path)).join(' ')}${mark}`);
      if (r.values.length) console.log(`           measured: ${r.values.join(', ')}`);
    }
    return 0;
  }

  if (argv.includes('--check')) {
    const file = argv[argv.indexOf('--check') + 1];
    if (!file) {
      console.log('ERROR: --check needs a file.');
      return 2;
    }
    const live = liveReceiptsFor(file);
    if (!live.length) {
      const any = readReceipts().some(r => r.targets.some(t => resolve(t.path) === resolve(file)));
      console.log(any
        ? `EXPIRED: ${file} was measured, then edited. The old numbers no longer describe it.`
        : `UNMEASURED: no gate has been run against ${file} in this session.`);
      return 1;
    }
    console.log(`OK: ${live.length} live receipt(s) for ${file}:`);
    for (const r of live) console.log(`  ${r.at}  ${r.gate}  exit ${r.exit}  ${r.values.join(', ')}`);
    return 0;
  }

  const [gate, ...rest] = argv;
  if (!gate) {
    console.log('Usage: node scripts/gate.mjs <gate.mjs|gate.py> [args...]');
    console.log('       node scripts/gate.mjs --list | --check <file> | --dir');
    return 2;
  }

  const script = join(ROOT, 'scripts', gate);
  if (!existsSync(script)) {
    console.log(`ERROR: no gate named ${gate} in scripts/`);
    return 2;
  }

  const runner = gate.endsWith('.py') ? 'python3' : 'node';
  const started = new Date().toISOString();
  const targets = targetsFrom(rest);
  // Hash BEFORE the run: that is the state the numbers describe.
  const snapshot = targets.map(p => ({ path: resolve(p), sha256: hashFile(p) }));

  const r = spawnSync(runner, [script, ...rest], {
    cwd: process.cwd(),
    encoding: 'utf8',
    // Always set, never optional. A render gate with no browser prints SKIPPED
    // and exits 0, and a receipt saying "pass" for a run that measured nothing
    // would be worse than no receipt at all.
    env: { ...process.env, DS_REQUIRE_BROWSER: '1' },
  });

  const out = (r.stdout || '') + (r.stderr || '');
  process.stdout.write(out);

  const receipt = {
    at: started,
    gate,
    args: rest,
    exit: r.status,
    targets: snapshot,
    values: measuredValues(out),
    browser_required: true,
  };

  try {
    mkdirSync(receiptsDir(), { recursive: true });
    appendFileSync(receiptsFile(), JSON.stringify(receipt) + '\n');
  } catch (err) {
    // A receipt that cannot be written must not silently vanish: the whole point
    // is that its absence is meaningful.
    console.error(`\ngate.mjs: could not write the receipt (${err.message}). `
      + 'Treat this run as unrecorded.');
  }

  if (r.status === null) {
    console.error(`\ngate.mjs: ${gate} did not exit normally (signal ${r.signal}). `
      + 'That is not a pass and not a finding - it is a run that did not happen.');
    return 2;
  }
  return r.status;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(main(process.argv.slice(2)));
}
