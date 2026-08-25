#!/usr/bin/env node
/**
 * EVAL RUNNER — score what an agent actually produced from a cold-start brief.
 *
 * The gates in scripts/ prove the kit's own examples are correct. That is not the
 * same question as "does an agent given only this kit and a brief produce good
 * work?" This runner answers the measurable half of that question: it points every
 * objective gate at a directory of produced HTML and reports one N/N.
 *
 * It deliberately does NOT score taste. The subjective half is a human read, or
 * /critique, and the report says so every time rather than implying a total.
 *
 * Usage:
 *   node evals/run.mjs --list                 the briefs
 *   node evals/run.mjs <brief-id>             score evals/out/<brief-id>/
 *   node evals/run.mjs <brief-id> --dir <p>   score another directory
 *   node evals/run.mjs --self-test            prove the runner works (reference app)
 * Exit 0 only if every objective gate passes.
 */
import { execSync } from 'node:child_process';
import { readdirSync, statSync, existsSync } from 'node:fs';
import { resolve, dirname, join, relative } from 'node:path';

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), '..');
const BRIEFS = join(ROOT, 'evals', 'briefs');
const argv = process.argv.slice(2);
const flag = (n) => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 ? argv[i + 1] : null;
};
const has = (n) => argv.includes(`--${n}`);
const briefId = argv.find(a => !a.startsWith('--') && argv[argv.indexOf(a) - 1] !== '--dir');

const briefFiles = existsSync(BRIEFS) ? readdirSync(BRIEFS).filter(f => f.endsWith('.md')).sort() : [];
const idOf = (f) => f.replace(/^\d+-/, '').replace(/\.md$/, '');

if (has('list') || (!briefId && !has('self-test'))) {
  console.log('\nBriefs (evals/briefs/):\n');
  for (const f of briefFiles) {
    const title = execSync(`head -1 ${JSON.stringify(join(BRIEFS, f))}`).toString().replace(/^#\s*/, '').trim();
    console.log(`  ${idOf(f).padEnd(22)} ${title}`);
  }
  console.log('\n  node evals/run.mjs <brief-id>            score evals/out/<brief-id>/');
  console.log('  node evals/run.mjs <brief-id> --dir <p>  score another directory');
  console.log('  node evals/run.mjs --self-test          prove the runner works\n');
  process.exit(0);
}

const selfTest = has('self-test');
const dir = selfTest
  ? join(ROOT, 'examples', 'sample-app')
  : resolve(flag('dir') || join(ROOT, 'evals', 'out', briefId));

if (!existsSync(dir) || !statSync(dir).isDirectory()) {
  console.error(`\nNothing to score: ${relative(ROOT, dir)} does not exist.`);
  console.error('Run the brief with a cold-start agent first, and put the output there.');
  console.error('See evals/README.md for the protocol.\n');
  process.exit(1);
}

const files = readdirSync(dir).filter(f => f.endsWith('.html')).map(f => join(dir, f)).sort();
if (!files.length) {
  console.error(`\nNo .html files in ${relative(ROOT, dir)} — nothing to measure.\n`);
  process.exit(1);
}
const q = (p) => JSON.stringify(relative(ROOT, p));
const each = (cmd) => files.map(f => cmd(q(f))).join(' && ');
const D = q(dir);

// Objective gates. Every one of these is a real measurement on the real render.
const GATES = [
  ['No hardcoded values (hex/px/ms/font)', `python3 scripts/lint_hardcodes.py ${D}`],
  ['No emoji anywhere in the output', `python3 scripts/check_no_emoji.py ${D}`],
  ['REAL-render WCAG (light + dark)', each(f => `node scripts/measure_render.mjs ${f} && node scripts/measure_render.mjs --dark ${f}`)],
  ['State-aware WCAG, default/hover/focus (light + dark)', each(f => `node scripts/verify_states.mjs ${f} && node scripts/verify_states.mjs --dark ${f}`)],
  ['axe-core a11y: roles, names, landmarks (light + dark)', each(f => `node scripts/axe_audit.mjs ${f} && node scripts/axe_audit.mjs --dark ${f}`)],
  ['Responsive: no overflow at 280/320/414', `node scripts/verify_responsive.mjs ${D}`],
  ['Responsive under wider font metrics (1.25x root)', `node scripts/verify_responsive.mjs ${D} --scale=1.25`],
  ['Target size (WCAG 2.5.8), mobile + desktop', `node scripts/verify_target_size.mjs ${D} && node scripts/verify_target_size.mjs --dark ${D}`],
  ['Keyboard (WCAG 2.1.1): reach and operate', `node scripts/verify_keyboard.mjs ${D}`],
  ['Reduced motion: stopped, and no content lost', `node scripts/verify_reduced_motion.mjs ${D}`],
  ['Content overflow: nothing clipped or overlapping', `node scripts/verify_overflow.mjs ${D}`],
  ['Token by intent: destructive never wears primary', `node scripts/lint_intent.mjs ${D}`],
  ['Interactive truth: a declared state contract is honoured', `node scripts/verify_interactive.mjs ${D}`],
  ['Slop tells: no HIGH tell (light + dark)', `node scripts/slop_tells.mjs --strict ${files.map(q).join(' ')} && node scripts/slop_tells.mjs --strict --dark ${files.map(q).join(' ')}`],
];

const label = selfTest ? 'SELF-TEST (kit reference app)' : `EVAL: ${briefId}`;
console.log('='.repeat(64));
console.log(` ${label}`);
console.log(` source: ${relative(ROOT, dir)}  (${files.length} file(s))`);
console.log('='.repeat(64));

let pass = 0;
const fails = [];
for (const [name, cmd] of GATES) {
  let ok = true, out = '';
  try { out = execSync(cmd, { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] }).toString(); }
  catch (e) { ok = false; out = (e.stdout?.toString() || '') + (e.stderr?.toString() || ''); }
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (ok) pass++;
  else fails.push([name, out.trim().split('\n').filter(l => l.trim()).slice(-6).join('\n      ')]);
}

// Advisory: taste signals. Reported, never scored - taste is not a percentage.
let taste = '';
try {
  taste = execSync(each(f => `node scripts/taste_audit.mjs ${f}`), { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] }).toString();
} catch (e) { taste = (e.stdout?.toString() || ''); }
const signals = (taste.match(/\b(HIGH|MED)\b/g) || []).length;

console.log('-'.repeat(64));
console.log(` OBJECTIVE: ${pass}/${GATES.length} gates passed`);
if (fails.length) {
  console.log('\n Failures:');
  for (const [name, tail] of fails) console.log(`  x ${name}\n      ${tail}`);
}
console.log(`\n ADVISORY: taste_audit raised ${signals} signal(s). Signals are a hint, not a score.`);
console.log(' NOT MEASURED: whether the work is any good. Run /critique and read the');
console.log(' brief\'s Requirements section by hand. No number in this repo covers taste.');

if (!selfTest) {
  const bf = briefFiles.find(f => idOf(f) === briefId);
  if (bf) {
    const text = execSync(`cat ${JSON.stringify(join(BRIEFS, bf))}`).toString();
    const req = text.split('## Requirements')[1]?.split('\n## ')[0] || '';
    const items = req.split('\n').filter(l => l.trim().startsWith('- '));
    if (items.length) {
      console.log(`\n Requirements to check by hand (${items.length}):`);
      for (const i of items) console.log('  ' + i.trim());
    }
  } else {
    console.log(`\n (no brief file matches "${briefId}" - scored the directory only)`);
  }
}
console.log();
process.exit(fails.length ? 1 : 0);
