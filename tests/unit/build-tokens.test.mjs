/**
 * build_tokens.mjs is a generator, not a gate: it never exits non-zero and it
 * drops a reference it cannot resolve without saying so. Nothing else in the
 * repo would notice, so its OUTPUT is the assertion.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { run, ROOT } from '../helpers/run.mjs';

function build(tokens) {
  const dir = mkdtempSync(join(tmpdir(), 'ds-tokens-'));
  const inDir = join(dir, 'in');
  mkdirSync(inDir);
  writeFileSync(join(inDir, 'colors.json'), JSON.stringify(tokens, null, 2));
  const out = join(dir, 'theme.css');
  const r = run('node', ['scripts/build_tokens.mjs', '--in', inDir, '--out', out]);
  const css = r.status === 0 ? readFileSync(out, 'utf8') : '';
  rmSync(dir, { recursive: true, force: true });
  return { ...r, css };
}

test('a resolvable alias chain reaches the emitted CSS as a final value', () => {
  const { status, css } = build({
    primitive: { blue: { 600: { $type: 'color', $value: '#2563EB' } } },
    semantic: { action: { primary: { $type: 'color', $value: '{primitive.blue.600}' } } },
  });
  assert.equal(status, 0);
  assert.match(css, /--color-action-primary:\s*#2563EB/i);
});

test('an unresolvable alias is dropped, not emitted as a broken var', () => {
  // The generator has no failure mode, so the contract is: never emit a value
  // that still contains {…}. A page referencing the missing token then fails
  // validate_theme_refs, which is the gate that does have teeth.
  const { status, css } = build({
    primitive: { blue: { 600: { $type: 'color', $value: '#2563EB' } } },
    semantic: { action: { primary: { $type: 'color', $value: '{primitive.blue.500}' } } },
  });
  assert.equal(status, 0);
  assert.doesNotMatch(css, /\{primitive\.blue\.500\}/, 'a raw alias leaked into the CSS');
  assert.doesNotMatch(css, /--color-action-primary:/, 'an unresolvable token should not be emitted');
});

test('a DIRECTORY build emits the whole system, not only colour', () => {
  // The bug this catches shipped: GROUPS were looked up inside colors.json only,
  // so a multi-file tokens/ dir (space in spacing.json, radius in borders.json)
  // emitted 85 colour vars and left every var(--space-*) undefined - the exact
  // failure the generator's own comment says it exists to prevent.
  const out = join(mkdtempSync(join(tmpdir(), 'ds-theme-')), 'theme.css');
  const r = run('node', ['scripts/build_tokens.mjs', '--out', out]);
  assert.equal(r.status, 0, r.stderr);
  const css = readFileSync(out, 'utf8');

  for (const v of ['--space-4', '--text-sm', '--font-sans', '--leading-tight',
                   '--radius-button', '--shadow-md', '--shadow-focus-ring',
                   '--duration-fast', '--ease-out', '--transition-micro',
                   '--size-control-md', '--opacity-disabled', '--z-modal', '--bp-sm']) {
    assert.match(css, new RegExp(`${v}:`), `the built theme defines no ${v}`);
  }
  assert.ok(css.split('\n').filter(l => l.includes('--')).length > 150,
    'a full build is not 85 colour vars');
});

test('no composite token reaches the CSS as [object Object] or a stray brace', () => {
  // Every array was treated as a cubicBezier: the font stack came out as
  // `cubic-bezier(Inter, system-ui, ...)` and every shadow as
  // `cubic-bezier([object Object])`. A ref resolving to an array (easing) left
  // its brace behind and the token was dropped instead.
  const out = join(mkdtempSync(join(tmpdir(), 'ds-theme-')), 'theme.css');
  assert.equal(run('node', ['scripts/build_tokens.mjs', '--out', out]).status, 0);
  const css = readFileSync(out, 'utf8');
  assert.doesNotMatch(css, /\[object Object\]/, 'a composite token was stringified');
  assert.doesNotMatch(css, /cubic-bezier\([^)]*[A-Za-z]/, 'a non-bezier was emitted as a bezier');
  for (const line of css.split('\n').filter(l => l.trim().startsWith('--'))) {
    assert.doesNotMatch(line, /\{[^}]+\}/, `an unresolved reference shipped: ${line.trim()}`);
  }
});
