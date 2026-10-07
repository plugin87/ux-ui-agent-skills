#!/usr/bin/env node
/**
 * H6 — the critic catch rate, scored against seeded defects.
 *
 *   node evals/score_critic.mjs <critique-output.md> [--fixture <name>] [--json]
 *
 * Fourteen defects are seeded across four pages in `tests/fixtures/critic/`.
 * Every one of them passes every gate this repo has - that is the point. A
 * defect a gate can catch would measure the gate, and the whole reason H6 exists
 * is that nothing has ever scored the half no script can score.
 *
 * ## What this number is, and is not
 *
 * Matching is by keyword, against the `signals` list each defect carries. That
 * makes the result a **floor**, in both directions:
 *
 *   - It UNDER-counts. A critic can name a defect in words no signal anticipated.
 *     Every miss is printed with its signals so you can read the critique and
 *     correct the count by hand.
 *   - It can OVER-count. A passing mention of the word "debug" scores D9 without
 *     the critic having understood that scaffolding shipped. Every hit is
 *     printed with the matching excerpt for exactly this reason.
 *
 * So this script does not print a score and stop. It prints the evidence for
 * every line of the score, and says in its own output that the number is a floor
 * until someone has read them. Quoting the percentage without reading the
 * excerpts is the failure mode this repo is named after.
 *
 * Exit code is 0 unless the input could not be read: it is an instrument, not a
 * gate. There is no threshold a critic must clear, because nobody has yet
 * established what a good catch rate is - the first real run sets the baseline.
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const KEY = join(ROOT, 'evals', 'critic-answer-key.json');

const argv = process.argv.slice(2);
const flag = (n) => { const i = argv.indexOf(`--${n}`); return i === -1 ? null : argv[i + 1]; };
const asJson = argv.includes('--json');
const onlyFixture = flag('fixture');
const targets = argv.filter((a, i) => !a.startsWith('--') && argv[i - 1] !== '--fixture');

if (!targets.length) {
  console.log('Usage: node evals/score_critic.mjs <critique-output.md> [--fixture <name>] [--json]');
  console.log('');
  console.log('Pass the critic\'s written verdict. Run /critique on each page in');
  console.log('tests/fixtures/critic/ first, save what it wrote, and score that.');
  console.log('ERROR: no critique given. Scoring nothing is not a zero, it is a non-run.');
  process.exit(2);
}

const missing = targets.filter(p => !existsSync(p));
if (missing.length) {
  console.log(`ERROR: not found: ${missing.join(', ')}`);
  console.log('Nothing was scored. This is not a 0% catch rate - it is a run that did not happen.');
  process.exit(2);
}

const key = JSON.parse(readFileSync(KEY, 'utf8'));
const FIXTURES = [...new Set(key.defects.map(d => d.fixture))];

/* Each defect is matched ONLY against the critique of its own page.
 *
 * The first version joined every critique into one blob, and immediately
 * over-counted in a way that proves why: D14 ("three equal plan tiles") matched
 * the signal /equal-weight/ in a sentence about a different fixture's four stat
 * cards. A critic that never opened async-lies.html scored a point on it.
 *
 * So a critique file is bound to a fixture - by `--fixture`, or by the fixture
 * name appearing in the file's own name - and a file bound to nothing is
 * refused rather than scored against everything. */
function bind(path) {
  if (onlyFixture) return onlyFixture;
  const name = basename(path).toLowerCase();
  const hits = FIXTURES.filter(f => name.includes(f.replace(/\.html$/, '').toLowerCase()));
  if (hits.length === 1) return hits[0];
  return null;
}

const bound = targets.map(t => ({ path: t, fixture: bind(t), text: readFileSync(t, 'utf8') }));
const unbound = bound.filter(b => !b.fixture);
if (unbound.length) {
  console.log('ERROR: could not tell which page these critiques are about:');
  for (const u of unbound) console.log(`  ${u.path}`);
  console.log('');
  console.log('Name each file after the fixture it critiques, for example');
  console.log('  critique-dashboard-no-lead.md');
  console.log('or score one file at a time with --fixture <name>.');
  console.log('');
  console.log('A critique scored against every page at once credits the critic for');
  console.log('defects on pages it never opened. Known fixtures:');
  for (const f of FIXTURES) console.log(`  ${f}`);
  process.exit(2);
}

const seen = new Set(bound.map(b => b.fixture));
const defects = key.defects.filter(d => seen.has(d.fixture));

if (!defects.length) {
  console.log(`ERROR: the key has no defects for ${[...seen].join(', ')}.`);
  console.log(`Known fixtures: ${FIXTURES.join(', ')}`);
  process.exit(2);
}

/** The critique text for one fixture, lower-cased alongside the original. */
const textFor = (fixture) => {
  const raw = bound.filter(b => b.fixture === fixture).map(b => b.text).join('\n\n');
  return { raw, hay: raw.toLowerCase() };
};

/** First signal that matches within that page's own critique, with context. */
function evidence(defect) {
  const { raw, hay } = textFor(defect.fixture);
  for (const sig of defect.signals) {
    const m = hay.match(new RegExp(sig, 'i'));
    if (!m) continue;
    const from = Math.max(0, m.index - 40);
    const excerpt = raw.slice(from, Math.min(raw.length, m.index + m[0].length + 50))
      .replace(/\s+/g, ' ').trim();
    return { signal: sig, excerpt: `${from > 0 ? '...' : ''}${excerpt}...` };
  }
  return null;
}

const scored = defects.map(d => ({ ...d, hit: evidence(d) }));
const caught = scored.filter(d => d.hit);
const missed = scored.filter(d => !d.hit);
const rate = caught.length / scored.length;

if (asJson) {
  console.log(JSON.stringify({
    h6: Number(rate.toFixed(4)),
    caught: caught.length,
    total: scored.length,
    scored_files: bound.map(b => ({ file: basename(b.path), fixture: b.fixture })),
    hits: caught.map(d => ({ id: d.id, signal: d.hit.signal, excerpt: d.hit.excerpt })),
    misses: missed.map(d => ({ id: d.id, fixture: d.fixture, defect: d.defect })),
    caveat: 'Keyword match. Read every excerpt before quoting h6 - it both under- and over-counts.',
  }, null, 2));
  process.exit(0);
}

console.log(`\nH6 — critic catch rate, against ${scored.length} seeded defect(s)`);
console.log('Scored, each critique against its own page only:');
for (const b of bound) console.log(`  ${basename(b.path)}  ->  ${b.fixture}`);
console.log('='.repeat(72));

for (const d of scored) {
  if (d.hit) {
    console.log(`\n  CAUGHT   ${d.id}`);
    console.log(`    matched /${d.hit.signal}/`);
    console.log(`    "${d.hit.excerpt}"`);
  } else {
    console.log(`\n  MISSED   ${d.id}   (${d.fixture})`);
    console.log(`    ${d.defect}`);
    console.log(`    rule: ${d.rule}`);
    console.log(`    looked for: ${d.signals.slice(0, 4).map(s => `/${s}/`).join('  ')}${d.signals.length > 4 ? '  ...' : ''}`);
  }
}

console.log('\n' + '='.repeat(72));
console.log(` H6 = ${caught.length}/${scored.length} = ${(rate * 100).toFixed(1)}%`);
console.log('');
console.log(' This is a FLOOR until you have read the excerpts above. Keyword matching');
console.log(' under-counts a defect named in words no signal anticipated, and over-counts');
console.log(' a passing mention. Correct the count by hand and say that you did.');
console.log('');
