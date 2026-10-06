/**
 * The two rules the maintainer set, checked against work built to break them.
 *
 * These are taste decisions, not suggestions, which is why they live in the
 * doctrine and in a gate rather than in the model's judgement:
 *
 *   A. Never ship a native `<select>`. It draws its own chevron pressed against
 *      the control edge, and `appearance: none` plus a custom chevron fights the
 *      platform instead of matching the system.
 *   B. Never a colored border on one side only of a card, alert, toast or
 *      callout - in ANY direction, not just the left.
 *
 * Rule B is measured on the render, not in source. It was briefly a source check
 * and the first run flagged a tab underline, a spinner ring and a list divider:
 * the spelling cannot tell an accent bar from those, and computed style can.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { py, gate, ROOT, F } from '../helpers/run.mjs';

// ------------------------------------------------------------------ Rule A

test('no native select survives anywhere in the examples', () => {
  const r = py('lint_native_select.py', ['examples']);
  assert.equal(r.status, 0, r.out);
  assert.match(r.stdout, /no native <select> in generated UI/);
});

test('it REJECTS a native select, and says what to use instead', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ds-sel-'));
  try {
    const f = join(dir, 'page.html');
    writeFileSync(f, '<!doctype html><label for="c">Country</label>\n'
      + '<select id="c"><option>Thailand</option></select>\n');
    const r = py('lint_native_select.py', [f]);
    assert.equal(r.status, 1, `expected a finding, got ${r.status}:\n${r.out}`);
    assert.match(r.stdout, /native <select>/);
    assert.match(r.stdout, /Listbox or Combobox/, 'a ban with no alternative is not guidance');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('it does not flag the word <select inside a comment', () => {
  // The first run of this gate reported two findings inside the very comment
  // explaining why native select is banned.
  const dir = mkdtempSync(join(tmpdir(), 'ds-sel-c-'));
  try {
    const f = join(dir, 'page.html');
    writeFileSync(f, '<!doctype html>\n<!-- never use a native <select> here -->\n'
      + '<script>/* a <select> in a block comment */</script>\n<p>ok</p>\n');
    const r = py('lint_native_select.py', [f]);
    assert.equal(r.status, 0, `a comment is not markup:\n${r.out}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('a deliberate exception is honoured, written the way the repo writes one', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ds-sel-a-'));
  try {
    const f = join(dir, 'page.html');
    writeFileSync(f, '<!doctype html>\n<!-- ds-allow-native-select: printing a legacy form -->\n'
      + '<select id="c"><option>Thailand</option></select>\n');
    const r = py('lint_native_select.py', [f]);
    assert.equal(r.status, 0, `the documented exception was ignored:\n${r.out}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('the replacement trigger really opens, and shows that it is open', () => {
  // A ban is only as good as what replaces it. The native control rotates its
  // chevron; a replacement that changes nothing visible is worse than what it
  // replaced, and verify_interactive is what caught that here.
  const r = gate('verify_interactive.mjs', [join(ROOT, 'examples/component-states/select.html')]);
  assert.equal(r.status, 0, r.out);
  const html = readFileSync(join(ROOT, 'examples/component-states/select.html'), 'utf8');
  assert.match(html, /aria-haspopup="listbox"/, 'the trigger must declare what it opens');
  assert.match(html, /\.control\[aria-expanded="true"\]/,
    'open must be visible on the control itself, not only in the ARIA state');
});

// ------------------------------------------------------------------ Rule B

test('the one-sided accent border is caught on every side, and by colour', () => {
  const r = gate('slop_tells.mjs', ['--strict', F('bad/one-sided-border.html')]);
  assert.equal(r.status, 1, `expected a HIGH finding, got ${r.status}:\n${r.out}`);
  assert.match(r.stdout, /ONE side only/);
  // four bars, one per side, plus the same cliche spelled as a colour change
  const m = r.stdout.match(/(\d+) element\(s\) wear a colored border/);
  assert.ok(m, 'the finding must say how many');
  assert.equal(Number(m[1]), 5, `expected all five, saw ${m && m[1]}`);
  for (const side of ['left', 'right', 'top']) {
    assert.ok(r.stdout.includes(side), `${side} was not named in the finding`);
  }
});

test('it leaves alone the things that are not accent bars', () => {
  // The fixture also contains a tab underline, a spinner ring and the correct
  // fix (a full hairline border). A tell that flags those is noise, and noise is
  // how a HIGH finding stops being read.
  const r = gate('slop_tells.mjs', ['--strict', F('bad/one-sided-border.html')]);
  assert.ok(!/\.tab|\.spinner|\.ok\b/.test(r.stdout),
    `the tell flagged a non-surface or the fix itself:\n${r.stdout}`);
});

test('every real page in the kit is clean under the tell', () => {
  for (const f of ['examples/sample-app/preview.html', 'examples/index.html',
                   'examples/showcase/index.html', 'examples/component-states/tabs.html',
                   'examples/templates/banking.html']) {
    const r = gate('slop_tells.mjs', ['--strict', join(ROOT, f)]);
    assert.equal(r.status, 0, `${f} now trips a slop tell:\n${r.stdout}`);
  }
});

// ------------------------------------------------------------- the surface

test('both rules are stated where the agent will actually read them', () => {
  const claude = readFileSync(join(ROOT, 'CLAUDE.md'), 'utf8');
  const doctrine = readFileSync(join(ROOT, '.claude/skills/design-doctrine/SKILL.md'), 'utf8');
  for (const [name, src] of [['CLAUDE.md', claude], ['design-doctrine', doctrine]]) {
    assert.match(src, /native `?<select>?`?/, `${name} does not state the native-select rule`);
    assert.match(src, /one side only/, `${name} does not state the one-sided border rule`);
  }
  // and the doc that used to say the opposite
  const forms = readFileSync(join(ROOT, 'components/forms-advanced.md'), 'utf8');
  assert.ok(!/Prefer native `<select>`/.test(forms),
    'forms-advanced.md still recommends the native select the doctrine bans');
});
