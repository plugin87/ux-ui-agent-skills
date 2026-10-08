#!/usr/bin/env node
/**
 * The Harness Score, computed rather than assembled.
 *
 *   node evals/measure_harness.mjs            # the table
 *   node evals/measure_harness.mjs --json     # the same, machine-readable
 *
 * Every indicator here was written up by hand in HARNESS.md, and three of them
 * went stale the moment the thing they described changed. H3 was recorded as
 * "3 of 11 rules enforced" while the always-on list had grown to 13 and the
 * PostToolUse hook had gained a fourth gate - a number that was true when it
 * was typed and wrong by the time anyone read it.
 *
 * So no number in this file is typed. Each indicator names its source and
 * derives its value, and an indicator whose source does not exist reports
 * NO INSTRUMENT rather than a zero that could be mistaken for a measurement.
 * That distinction is the whole point of the file: "nobody has looked" and
 * "we looked and it failed" are different facts, and averaging them together
 * loses the one that matters.
 *
 * Indicators that need a paid model run (H2, H5, H6, H7) cannot be recomputed
 * on demand, so they are read from `evals/harness-measurements.json`, which
 * records each result with the commit it was measured at. When the tree has
 * moved on, the value still counts but is marked STALE with the distance, so a
 * score is never quietly carried forward as if it were fresh.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => join(ROOT, p);
const read = (p) => readFileSync(R(p), 'utf8');
const sh = (cmd, args) => {
  const r = spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', timeout: 120000 });
  return (r.stdout || '') + (r.stderr || '');
};

const RECORDED = 'evals/harness-measurements.json';
const recorded = existsSync(R(RECORDED)) ? JSON.parse(read(RECORDED)) : {};

let HEAD = 'unknown';
try { HEAD = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim(); } catch {}

/** How many commits ago a recorded measurement was taken, or null if unknowable. */
function distance(commit) {
  if (!commit || commit === HEAD) return 0;
  try {
    return Number(execFileSync('git', ['rev-list', '--count', `${commit}..HEAD`],
      { cwd: ROOT, encoding: 'utf8' }).trim());
  } catch { return null; }
}

/** An indicator read from the recorded file rather than recomputed. */
function fromRecord(id) {
  const rec = recorded[id];
  if (!rec || typeof rec.value !== 'number') {
    return { value: null, source: `${RECORDED} has no entry for ${id}`, note: 'NO INSTRUMENT' };
  }
  const d = distance(rec.commit);
  const stale = d === null ? 'commit unknown' : d > 0 ? `${d} commit(s) old` : null;
  return {
    value: rec.value,
    source: rec.command || RECORDED,
    note: stale ? `STALE: measured at ${rec.commit}, ${stale}` : null,
    detail: rec.detail,
  };
}

// ---------------------------------------------------------------- H1
function h1() {
  const out = sh('python3', ['scripts/measure_install_paths.py']);
  const m = out.match(/H1 \(mean across the three routes\) = ([\d.]+)/);
  if (!m) return { value: null, source: 'scripts/measure_install_paths.py', note: 'NO INSTRUMENT: the script printed no H1 line' };
  const routes = [...out.matchAll(/^\s+(\S+)\s+(\d+) \/ (\d+)\s+([\d.]+)%/gm)]
    .map(x => `${x[1]} ${x[2]}/${x[3]}`);
  return { value: Number(m[1]), source: 'python3 scripts/measure_install_paths.py', detail: routes.join(', ') };
}

// ---------------------------------------------------------------- H3
/**
 * Enforcement coverage: of the always-on rules, how many fire without the
 * model choosing to run anything.
 *
 * Both halves are read from source. The rules come from the ALWAYS_ON list in
 * validate_instruction_surface.py - the same list that gate already enforces,
 * so a rule cannot be added in one place and missed here. The enforcement comes
 * from the gates the hooks actually invoke, not from a list of gates that
 * exist.
 */
function h3() {
  const py = read('scripts/validate_instruction_surface.py');
  /* Anchor on the line start, for two reasons that both bit.
  
     `split('ALWAYS_ON = [')` matches `PLUGIN_ALWAYS_ON = [` first, so this read
     the doctrine skill's nine rules while reporting them as CLAUDE.md's
     thirteen - a denominator off by four, in the indicator about enforcement.
  
     And cutting at the first `]` lands inside a regex such as `[Nn]ever`, which
     read three rules out of thirteen on the first run.
  
     Both are the same mistake: matching a substring where a line was meant.
     This script exists because hand-maintained numbers go stale; a parser that
     quietly reads the wrong list is the same failure with extra steps. */
  const block = py.split(/^ALWAYS_ON = \[/m)[1]?.split(/^\]/m)[0] ?? '';
  const rules = [...block.matchAll(/\(\s*"([^"]+)"/g)].map(m => m[1]);
  if (!rules.length) return { value: null, source: 'scripts/validate_instruction_surface.py', note: 'NO INSTRUMENT: could not read ALWAYS_ON' };

  // Which gates do the hooks actually run? Read the hook scripts, not a list.
  const hookDir = R('hooks');
  const hookFiles = existsSync(hookDir)
    ? readdirSync(hookDir).filter(f => f.endsWith('.mjs'))
    : [];
  /* Filenames as well as contents. A rule can be enforced by a gate a hook
     CALLS - lint_hardcodes, named inside posttooluse-fast-gates.mjs - or by a
     hook that IS the enforcement, like stop-require-measurement.mjs, whose own
     name never appears in its own source. Searching contents alone missed the
     second kind and under-reported H3 by a rule the repo actually enforces. */
  const hookSrc = [...hookFiles, ...hookFiles.map(f => read(`hooks/${f}`))].join('\n');
  const runsGate = (g) => new RegExp(g.replace('.', '\\.')).test(hookSrc);

  /* A rule counts as enforced when a hook runs a gate that decides it. The
     mapping is deliberately conservative: a gate that only partly covers a rule
     does not count it, because a half-enforced rule still depends on the model
     for the other half. */
  const ENFORCED_BY = {
    'emoji ban, stated as absolute': 'check_no_emoji.py',
    'emoji gate named': 'check_no_emoji.py',
    'single shared theme': 'lint_hardcodes.py',
    'no native select': 'lint_native_select.py',
    'never state an unmeasured number': 'stop-require-measurement',
  };
  const enforced = rules.filter(r => {
    const gate = ENFORCED_BY[r];
    return gate && runsGate(gate);
  });

  return {
    value: enforced.length / rules.length,
    source: 'ALWAYS_ON in validate_instruction_surface.py, against the gates hooks/*.mjs invoke',
    detail: `${enforced.length}/${rules.length} enforced: ${enforced.join('; ')}`,
  };
}

// ---------------------------------------------------------------- H4
/**
 * Verification receipts: of the files the one-command gate measures, how many
 * carry a receipt that is still live for the bytes on disk right now.
 *
 * This is the indicator most easily gamed, so it is defined against the file
 * hash rather than against "did someone run the wrapper". Edit a measured file
 * and its receipt expires, and H4 falls - which is correct, because the number
 * that receipt carries no longer describes the file.
 */
function h4() {
  if (!gateModule) return { value: null, source: 'scripts/gate.mjs', note: 'NO INSTRUMENT: scripts/gate.mjs did not load' };
  const { readReceipts, hashFile } = gateModule;

  /* The question is "can a number in an answer be traced to a measurement",
     so the denominator is every check the one-command gate runs - not just the
     ones that happen to have left a receipt. An earlier version divided live
     receipts by recorded files and returned 1.000 the moment anything was
     recorded, which measured nothing: right after a run, every receipt is fresh
     by construction. */
  const report = read('scripts/accuracy_report.mjs');
  const block = report.split('const checks = [')[1]?.split(/^\];/m)[0] ?? '';
  const total = (block.match(/^ {2}\[/gm) || []).length;
  if (!total) return { value: null, source: 'scripts/accuracy_report.mjs', note: 'NO INSTRUMENT: could not count the checks' };

  const live = new Set();
  for (const r of readReceipts()) {
    if (r.gate !== 'accuracy_report' || !r.targets?.length) continue;
    // A receipt counts only while every file it named still hashes the same.
    if (r.targets.every(t => hashFile(t.path) === t.sha256)) live.add(r.args?.[0]);
  }

  return {
    value: live.size / total,
    source: 'receipts written by scripts/accuracy_report.mjs, verified against the files on disk',
    detail: `${live.size}/${total} check(s) carry a receipt that still matches the bytes measured`,
    note: live.size < total
      ? `${total - live.size} check(s) leave no live receipt: a check that scans a tree by default names no file, and a file edited since is expired`
      : null,
  };
}

function require_gate() {
  // gate.mjs is an ES module; import it lazily so a missing file is a clean error.
  const url = new URL('../scripts/gate.mjs', import.meta.url);
  if (!existsSync(url)) throw new Error('scripts/gate.mjs is missing');
  return gateModule;
}

// ---------------------------------------------------------------- H5
/**
 * Blind first-pass per route: of the three install routes, how many have at
 * least one blind run that passed every gate on its first submission.
 */
function h5() {
  if (!existsSync(R('evals/RESULTS.md'))) {
    return { value: null, source: 'evals/RESULTS.md', note: 'NO INSTRUMENT: RESULTS.md is missing' };
  }
  const md = read('evals/RESULTS.md');
  const ROUTES = {
    init: /scaffolded project|npx .*new|init route/i,
    plugin: /plugin route|local marketplace|installed as a plugin/i,
    'skills-add': /skills[- ]add route/i,
  };
  const blindRows = md.split('\n').filter(l => /\|/.test(l) && /BLIND/i.test(l));
  const passing = Object.entries(ROUTES).filter(([, re]) =>
    blindRows.some(l => re.test(l) && /14\/14|first submission/i.test(l)));
  return {
    value: passing.length / Object.keys(ROUTES).length,
    source: 'evals/RESULTS.md, rows marked BLIND',
    detail: `${passing.length}/3 routes with a passing blind run: ${passing.map(p => p[0]).join(', ') || 'none'}`,
  };
}

// ---------------------------------------------------------------- table
const INDICATORS = [
  ['H1', 'Install-path parity', h1],
  ['H2', 'Invocation correctness', () => fromRecord('H2')],
  ['H3', 'Enforcement coverage', h3],
  ['H4', 'Verification receipts', h4],
  ['H5', 'Blind first-pass, per route', h5],
  ['H6', 'Critic catch rate', () => fromRecord('H6')],
  ['H7', 'Taste applied on page/app work', () => fromRecord('H7')],
];

let gateModule;
const main = async () => {
  try { gateModule = await import('../scripts/gate.mjs'); } catch { gateModule = null; }

  const rows = [];
  for (const [id, name, fn] of INDICATORS) {
    let r;
    try { r = fn(); } catch (e) { r = { value: null, source: '-', note: `NO INSTRUMENT: ${e.message}` }; }
    rows.push({ id, name, ...r });
  }

  const measured = rows.filter(r => typeof r.value === 'number');
  const unmeasured = rows.filter(r => typeof r.value !== 'number');
  /* An unmeasured indicator counts as 0 in the score, exactly as HARNESS.md
     says: "that zero means there was no instrument". It is listed separately so
     the zero can never be read as a result. */
  const score = rows.reduce((s, r) => s + (typeof r.value === 'number' ? r.value : 0), 0) / rows.length;

  if (process.argv.includes('--json')) {
    console.log(JSON.stringify({ head: HEAD, score: Number(score.toFixed(4)), indicators: rows }, null, 2));
    return;
  }

  console.log(`\nHarness Score — computed at ${HEAD}\n`);
  console.log('  ID   indicator                        score   source');
  console.log('  ' + '-'.repeat(84));
  for (const r of rows) {
    const v = typeof r.value === 'number' ? r.value.toFixed(3) : '  -  ';
    console.log(`  ${r.id}   ${r.name.padEnd(32)} ${v}   ${r.source}`);
    if (r.detail) console.log(`       ${r.detail}`);
    if (r.note) console.log(`       ${r.note}`);
  }
  console.log('  ' + '-'.repeat(84));
  console.log(`  Harness Score = ${score.toFixed(4)}   (mean of ${rows.length}; ${unmeasured.length} unmeasured count as 0)\n`);
  if (unmeasured.length) {
    console.log(`  Unmeasured: ${unmeasured.map(r => r.id).join(', ')}.`);
    console.log('  Those zeros mean "no instrument", not "measured and failed". Do not read them as results.\n');
  }
};
main();
