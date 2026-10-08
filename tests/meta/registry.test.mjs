/**
 * The two gate registries are hand-maintained literals in two files, and the
 * counts they claim are retyped into CI and the docs. That drifted: ci.yml said
 * "12 objective gates" while evals/run.mjs had 14, and nothing noticed.
 *
 * These tests count the real arrays and hold the prose to them.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from '../helpers/run.mjs';

const read = (...p) => readFileSync(join(ROOT, ...p), 'utf8');

/** Count top-level [ ... ] entries in an array literal, ignoring nested brackets. */
function countEntries(src, opener) {
  const body = src.split(opener)[1].split('\n];')[0];
  let depth = 0, n = 0;
  for (const ch of body) {
    if (ch === '[') depth++;
    else if (ch === ']') { depth--; if (depth === 0) n++; }
  }
  return n;
}

const accuracy = countEntries(read('scripts', 'accuracy_report.mjs'), 'const checks = [');
const evals = countEntries(read('evals', 'run.mjs'), 'const GATES = [');

test('the accuracy report still runs the full check list', () => {
  // Not a magic number to bump casually: dropping a check silently shrinks what
  // "100%" means. Adding one is fine — update this line in the same commit.
  assert.equal(accuracy, 52, `accuracy_report.mjs now has ${accuracy} checks`);
});

test('the eval scorer still runs the full gate list', () => {
  assert.equal(evals, 15, `evals/run.mjs now has ${evals} gates`);
});

test('every count claimed in prose matches the array it describes', () => {
  // Scoped per claim: README talks about both registries on different lines, so
  // a blanket regex would match the wrong number.
  const ci = read('.github', 'workflows', 'ci.yml');
  const ciClaim = ci.match(/(\d+) objective gates/);
  assert.ok(ciClaim, 'ci.yml no longer states a gate count');
  assert.equal(Number(ciClaim[1]), evals, 'ci.yml disagrees with evals/run.mjs');

  const rep = read('scripts', 'accuracy_report.mjs').match(/(\d+)-gate cold-start scorer/);
  assert.ok(rep, 'accuracy_report.mjs no longer names the eval gate count');
  assert.equal(Number(rep[1]), evals, 'accuracy_report.mjs disagrees with evals/run.mjs');

  const readme = read('README.md');
  const shipped = readme.match(/\*\*(\d+) objective gates\*\*/);
  assert.ok(shipped, 'README no longer states how many gates ship');
  assert.equal(Number(shipped[1]), accuracy, 'README disagrees with accuracy_report.mjs');

  // The same number is retyped in the command block under it, and drifted to 35
  // while the array held 37 - nothing was checking that one.
  const runLine = readme.match(/accuracy_report\.mjs\s+#\s*(\d+)\/(\d+) or it fails/);
  assert.ok(runLine, 'README no longer shows the all-or-nothing run line');
  assert.equal(Number(runLine[1]), accuracy, 'the README run line disagrees with accuracy_report.mjs');
  assert.equal(Number(runLine[2]), accuracy, 'the README run line disagrees with itself');

  for (const line of readme.split('\n').filter(l => l.includes('evals/run.mjs'))) {
    const n = line.match(/(\d+) objective gates/);
    if (n) assert.equal(Number(n[1]), evals, `README line disagrees with evals/run.mjs: ${line.trim()}`);
  }

  // Two more retypings of the same number that nothing was holding: the README's
  // prose summary and CONTRIBUTING's one-line bar. Both had drifted to 38 while
  // the array held 40 - the exact failure this file was written to stop, one
  // section further down the page than its regexes reached.
  for (const [file, src] of [['README.md', readme], ['CONTRIBUTING.md', read('CONTRIBUTING.md')]]) {
    for (const m of src.matchAll(/accuracy_report\.mjs`?\s*(?:#\s*)?\(?(\d+)\/(\d+)/g)) {
      assert.equal(Number(m[1]), accuracy, `${file} claims ${m[1]}/${m[2]} but accuracy_report.mjs has ${accuracy}`);
      assert.equal(Number(m[2]), accuracy, `${file} claims ${m[1]}/${m[2]}, which disagrees with itself`);
    }
  }
});

test('the plugin manifests state the same gate count as the registry', () => {
  // These two were the furthest adrift of anything in the repo: both said 41
  // while accuracy_report.mjs held 44 and the GitHub description said 43. Nothing
  // read them, so nothing noticed. A marketplace listing is the first number many
  // people ever see, which makes it the worst one to leave stale.
  for (const f of ['.claude-plugin/plugin.json', '.claude-plugin/marketplace.json']) {
    const src = read(...f.split('/'));
    const claims = [...src.matchAll(/(\d+) objective quality gates/g)].map(m => Number(m[1]));
    assert.ok(claims.length > 0, `${f} no longer states a gate count`);
    for (const n of claims) assert.equal(n, accuracy, `${f} claims ${n} gates, the registry has ${accuracy}`);
  }
});

test('the skill count is derived from the folders, never retyped', () => {
  // bin/cli.js described the skills area as "10 runnable Claude skills" while 19
  // were installed. A typed count is a claim; the folder listing is the fact.
  const dirs = readdirSync(join(ROOT, '.claude/skills'), { withFileTypes: true })
    .filter(d => d.isDirectory()).length;
  const readme = read('README.md');
  const badge = readme.match(/runnable_skills-(\d+)-/);
  assert.ok(badge, 'README no longer carries a runnable-skills badge');
  assert.equal(Number(badge[1]), dirs, `README badge says ${badge[1]} skills, ${dirs} folders exist`);

  const cli = read('bin', 'cli.js');
  const typed = cli.match(/skills:\s*'(\d+) runnable/);
  assert.equal(typed, null,
    `bin/cli.js still types a skill count (${typed && typed[1]}); derive it from the folder instead`);
});

test('every counted thing matches what the surfaces claim', () => {
  // Found by counting on 2026-10-06: package.json said 19 runnable skills with 25
  // installed, four surfaces said 50 components with 52 documented, the GitHub
  // description said 48 gates with 50 registered, and bin/cli.js said 13 token
  // files and 42 component specs against 14 and 52. None of it was load-bearing,
  // which is exactly why it rotted - a number nothing reads is a number nothing
  // corrects.
  const countDir = (d, ext) =>
    readdirSync(join(ROOT, d)).filter(f => f.endsWith(ext)).length;
  const components = readdirSync(join(ROOT, 'components'))
    .filter(f => f.endsWith('.md'))
    .reduce((n, f) => n + (readFileSync(join(ROOT, 'components', f), 'utf8')
      .match(/^## \d+\. /gm) || []).length, 0);
  const skills = readdirSync(join(ROOT, '.claude/skills'), { withFileTypes: true })
    .filter(d => d.isDirectory()).length;
  const systems = readdirSync(join(ROOT, 'design-systems/library'), { withFileTypes: true })
    .filter(d => d.isDirectory()).length;
  const adapters = countDir('frameworks/adapters', '.md');
  const pages = (function walk(d) {
    return readdirSync(d, { withFileTypes: true }).reduce((n, e) =>
      n + (e.isDirectory() ? walk(join(d, e.name)) : (e.name.endsWith('.html') ? 1 : 0)), 0);
  })(join(ROOT, 'examples'));

  const truth = { components, skills, systems, adapters, pages };

  // package.json and both plugin manifests describe the kit to a marketplace.
  for (const f of ['package.json', '.claude-plugin/plugin.json', '.claude-plugin/marketplace.json']) {
    const src = read(...f.split('/'));
    for (const [, n] of src.matchAll(/(\d+) components/g)) {
      assert.equal(Number(n), truth.components, `${f} claims ${n} components, ${truth.components} are documented`);
    }
    for (const [, n] of src.matchAll(/(\d+) runnable skills/g)) {
      assert.equal(Number(n), truth.skills, `${f} claims ${n} runnable skills, ${truth.skills} exist`);
    }
    for (const [, n] of src.matchAll(/(\d+) (?:brand-grade )?design systems/g)) {
      assert.equal(Number(n), truth.systems, `${f} claims ${n} design systems, ${truth.systems} exist`);
    }
  }

  // The front door states four of them as counters a visitor reads first.
  const front = read('examples', 'index.html');
  const counter = (label) => {
    const m = front.match(new RegExp(`<b[^>]*>(\\d+)</b><span>${label}</span>`));
    assert.ok(m, `the front door no longer shows a "${label}" counter`);
    return Number(m[1]);
  };
  assert.equal(counter('runnable skills'), truth.skills);
  assert.equal(counter('design systems'), truth.systems);
  assert.equal(counter('pages rendered here'), truth.pages);

  // README badges
  const readme = read('README.md');
  for (const [badge, want] of [['design_systems', truth.systems], ['framework_adapters', truth.adapters]]) {
    const m = readme.match(new RegExp(`${badge}-(\\d+)-`));
    assert.ok(m, `README lost its ${badge} badge`);
    assert.equal(Number(m[1]), want, `README ${badge} badge says ${m[1]}, counted ${want}`);
  }

  // bin/cli.js must derive, never type.
  const cli = read('bin', 'cli.js');
  for (const typed of [/'\d+ DTCG token files/, /'\d+ component specs/, /'\d+ runnable/]) {
    assert.ok(!typed.test(cli), `bin/cli.js types a count (${typed}); derive it from the folder`);
  }
});

test('evals/README spells the same number it scores with', () => {
  const WORDS = { 12: 'Twelve', 13: 'Thirteen', 14: 'Fourteen', 15: 'Fifteen', 16: 'Sixteen' };
  const src = read('evals', 'README.md');
  const written = new RegExp(WORDS[evals], 'i');
  assert.match(src, written, `evals/README.md does not say "${WORDS[evals]}" but run.mjs has ${evals} gates`);
});
