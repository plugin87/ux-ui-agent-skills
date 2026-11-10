#!/usr/bin/env node
/**
 * Count what the kit ships, from the filesystem, and hold every surface that
 * states one of those counts to it.
 *
 *   node scripts/stats.mjs            print the counts
 *   node scripts/stats.mjs --write    write them to stats.json
 *   node scripts/stats.mjs --check    exit 1 if stats.json is stale, or if any
 *                                     README, doc, manifest or skill states a
 *                                     count the filesystem does not have
 *
 * Why it exists. An outside review (SkillCritic, 2026-10-29) read the kit and
 * came back with 50 vs 52 gates, 138 vs 2,144 design systems and 27 skills.
 * The repo said 52, 2,144 and 26 on its front page, but a comment in
 * bin/cli.js still said 50 gates and CONTRIBUTING.md said "35 of the 51
 * gates". Each figure was right somewhere and wrong somewhere else, which is
 * what a number nobody derives turns into. Every count below is computed, and
 * --check reads the prose for the same counts instead of trusting markers
 * someone has to remember to add.
 *
 * What each count means, so two different numbers are never read as one:
 *   skills                folders under .claude/skills/ holding a SKILL.md.
 *                         A SKILL.md under tests/fixtures/ is a deliberately
 *                         broken test input, not a skill, and is not counted.
 *   gates.total           checks in scripts/accuracy_report.mjs (the N in N/N)
 *   gates.browser         of those, the ones that run a gate importing Playwright
 *   gates.files           the rest: they read files and need no browser
 *   evals.gates           objective gates evals/run.mjs points at a cold-start run
 *   evals.briefs          cold-start briefs in evals/briefs/
 *   evals.files           every file under evals/, outputs included
 *   designSystems.indexed systems in design-systems/library.json (what ships)
 *   designSystems.measured
 *                         of those, specs measured from the live site (they
 *                         carry YAML frontmatter). Needs the specs on disk, so
 *                         it is null in an npm install, which ships the index only.
 *   skillMd.avgKB         mean SKILL.md size in KB (1 KB = 1024 bytes), 1 decimal
 *
 * Exit codes follow the gates: 0 clean, 1 drift found, 2 could not look.
 */
import { readFileSync, readdirSync, existsSync, writeFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const read = (...p) => readFileSync(join(ROOT, ...p), 'utf8');
const STATS = join(ROOT, 'stats.json');

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]);
}

/** Top-level entries of an array literal: lines indented two spaces opening `[`. */
function arrayEntries(src, startRe) {
  const lines = src.split('\n');
  const start = lines.findIndex(l => startRe.test(l));
  if (start < 0) return null;
  const out = [];
  for (const l of lines.slice(start + 1)) {
    if (/^\];/.test(l)) return out;
    if (/^ {2}\[/.test(l)) out.push(l); else if (out.length) out[out.length - 1] += l;
  }
  return null;
}

/* Same rule as tests/meta/counts.test.mjs: a gate needs a browser if and only
   if it imports Playwright, statically or through the guarded dynamic import. */
function browserGates() {
  const dir = join(ROOT, 'scripts');
  return readdirSync(dir).filter(f => f.endsWith('.mjs'))
    .filter(f => /(^import[^;]*from '|await import\(')(playwright|playwright-core)'/m
      .test(readFileSync(join(dir, f), 'utf8')));
}

export function collect() {
  const skillDirs = readdirSync(join(ROOT, '.claude/skills'), { withFileTypes: true })
    .filter(d => d.isDirectory() && existsSync(join(ROOT, '.claude/skills', d.name, 'SKILL.md')))
    .map(d => d.name);
  const bytes = skillDirs.map(s => statSync(join(ROOT, '.claude/skills', s, 'SKILL.md')).size);

  const checks = arrayEntries(read('scripts', 'accuracy_report.mjs'), /^const checks = \[/);
  if (!checks || checks.length === 0) throw new Error('could not read the checks array in scripts/accuracy_report.mjs');
  const bg = browserGates();
  if (bg.length < 10) throw new Error(`only ${bg.length} browser gates found; the import check is wrong`);
  const re = new RegExp(bg.map(f => f.replace('.', '\\.')).join('|'));
  const browser = checks.filter(e => re.test(e)).length;

  const evalGates = arrayEntries(read('evals', 'run.mjs'), /^const GATES = \[/);
  if (!evalGates) throw new Error('could not read the GATES array in evals/run.mjs');

  const index = JSON.parse(read('design-systems', 'library.json'));
  const lib = join(ROOT, 'design-systems', 'library');
  const measured = existsSync(lib)
    ? readdirSync(lib).filter(d => {
        const f = join(lib, d, 'DESIGN.md');
        return existsSync(f) && readFileSync(f, 'utf8').startsWith('---');
      }).length
    : null;

  return {
    skills: skillDirs.length,
    gates: { total: checks.length, browser, files: checks.length - browser },
    evals: {
      gates: evalGates.length,
      briefs: readdirSync(join(ROOT, 'evals', 'briefs')).filter(f => f.endsWith('.md')).length,
      files: walk(join(ROOT, 'evals')).length,
    },
    designSystems: { indexed: Object.keys(index.systems).length, measured },
    skillMd: {
      count: bytes.length,
      avgKB: Math.round(bytes.reduce((a, b) => a + b, 0) / bytes.length / 1024 * 10) / 10,
    },
  };
}

/* ---------------------------------------------------------------- the check */

/* Files that describe the kit as it is now. CHANGELOG.md is history (it says
   138 because that was true in 2.x) and docs/restructure-plan.md is a dated
   plan, so neither is held to today's counts. */
function surfaces() {
  const md = d => existsSync(join(ROOT, d))
    ? readdirSync(join(ROOT, d)).filter(f => f.endsWith('.md')).map(f => `${d}/${f}`) : [];
  return [
    'README.md', 'AGENTS.md', 'CLAUDE.md', 'CONTRIBUTING.md', 'SECURITY.md', 'CONTEXT.md',
    'package.json', '.claude-plugin/plugin.json', '.claude-plugin/marketplace.json',
    'bin/cli.js', 'examples/index.html', 'evals/README.md',
    ...md('docs').filter(f => f !== 'docs/restructure-plan.md'),
    ...md('taste'), ...md('.claude/rules'),
    ...readdirSync(join(ROOT, '.claude/skills')).map(s => `.claude/skills/${s}/SKILL.md`),
  ].filter(f => existsSync(join(ROOT, f)));
}

const num = s => Number(String(s).replace(/,/g, ''));

/**
 * Each rule: a pattern, which count it states, and which capture holds it.
 * A line that mentions evals is about evals/run.mjs, whose gate count is a
 * different number from the accuracy report's, so the gate rules split on it.
 */
function rules(s) {
  const N = '(?<![\\w.,])(\\d[\\d,]*)';
  return [
    { what: 'gates (accuracy report)', want: s.gates.total, re: new RegExp(`${N} (?:objective |accuracy )?(?:gates|checks)\\b`, 'g'), evals: false },
    { what: 'gates (accuracy report)', want: s.gates.total, re: /of the (\d+) (?:gates|checks)\b/g, evals: false },
    { what: 'gates (evals/run.mjs)', want: s.evals.gates, re: new RegExp(`${N} (?:objective )?gates\\b`, 'g'), evals: true },
    { what: 'browser gates', want: s.gates.browser, re: new RegExp(`${N} (?:of them |of the \\d+ (?:gates|checks) )?open a real`, 'g') },
    /* "34 of the 52 gates" only ever names the browser subset in these docs. */
    { what: 'browser gates', want: s.gates.browser, re: /(?<![\w.,])(\d+) of the \d+ (?:gates|checks)\b/g },
    { what: 'browser gates', want: s.gates.browser, re: /those (\d+) report/g },
    { what: 'file-reading gates', want: s.gates.files, re: new RegExp(`${N} read\\s+files`, 'g') },
    { what: 'skills', want: s.skills, re: new RegExp(`${N} (?:runnable )?skills\\b`, 'g') },
    { what: 'design systems', want: s.designSystems.indexed,
      re: new RegExp(`${N}(?: (?:named |brand-grade |concrete, named |measured )?design systems| named systems|-system library| design-system specs)`, 'g') },
    ...(s.designSystems.measured == null ? [] : [
      { what: 'measured design systems', want: s.designSystems.measured,
        re: /(\d[\d,]*) of them (?:were )?measured|\*\*Measured\*\* \((\d[\d,]*)\)/g },
    ]),
  ];
}

export function check(s) {
  const found = [];
  let seen = 0;
  for (const f of surfaces()) {
    const lines = read(...f.split('/')).split('\n');
    lines.forEach((line, i) => {
      const aboutEvals = /\beval/i.test(line);
      for (const r of rules(s)) {
        if (r.evals !== undefined && r.evals !== aboutEvals) continue;
        for (const m of line.matchAll(r.re)) {
          const stated = num(m.slice(1).find(Boolean));
          seen++;
          if (stated !== r.want) found.push(`${f}:${i + 1}: says "${m[0].trim()}", ${r.what} is ${r.want}`);
        }
      }
    });
  }
  return { found, seen };
}

/* ----------------------------------------------------------------- the CLI */

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  let s;
  try { s = collect(); }
  catch (e) { console.error(`stats: could not count: ${e.message}`); process.exit(2); }
  const json = JSON.stringify(s, null, 2) + '\n';
  const mode = process.argv[2];

  if (mode === '--write') {
    writeFileSync(STATS, json);
    console.log(`stats: wrote ${relative(process.cwd(), STATS) || 'stats.json'}`);
  } else if (mode === '--check') {
    const problems = [];
    if (!existsSync(STATS)) problems.push('stats.json is missing: node scripts/stats.mjs --write');
    else if (readFileSync(STATS, 'utf8') !== json) problems.push('stats.json is stale: node scripts/stats.mjs --write');
    const { found, seen } = check(s);
    problems.push(...found);
    if (seen === 0) { console.error('stats: read no stated counts at all; the patterns are wrong'); process.exit(2); }
    if (problems.length) {
      console.log(`stats: ${problems.length} stated count(s) disagree with the filesystem`);
      for (const p of problems) console.log(`  ${p}`);
      process.exit(1);
    }
    console.log(`stats: ${seen} stated counts read across the docs, all match`);
  } else if (mode && mode !== '--json') {
    console.error(`stats: unknown option ${mode} (use --write or --check)`); process.exit(2);
  } else {
    process.stdout.write(json);
  }
}
