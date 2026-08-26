/**
 * Meta-gate: the Python gates must still REJECT a broken fixture.
 *
 * Every gate in this kit is pointed at examples/ that already pass, which proves
 * only that a gate says yes to good work. These tests point each one at input
 * built to be wrong and require a real exit 1 — so a regex that stops matching,
 * or a check that quietly turns into a no-op, fails the build instead of
 * reporting a cheerful 37/37.
 */
import { test } from 'node:test';
import { py, rejects, accepts, F } from '../helpers/run.mjs';

test('check_no_emoji rejects a pictograph in UI output', () => {
  rejects(py('check_no_emoji.py', [F('bad/emoji.html')]), /emoji\/pictograph/);
});

test('check_no_emoji accepts arrows and box-drawing (allowed notation)', () => {
  accepts(py('check_no_emoji.py', [F('good/clean.html')]), /no emoji/i);
});

test('lint_hardcodes rejects raw hex, px, ms and a font stack', () => {
  const r = rejects(py('lint_hardcodes.py', [F('bad/hardcoded.css')]), /hardcoded/i);
  // All four categories, not just whichever pattern happens to still work.
  for (const want of [/#1d1d1f/, /17px/, /240ms/, /font-family/]) {
    if (!want.test(r.out)) throw new Error(`missed ${want}\n${r.out}`);
  }
});

test('lint_hardcodes accepts a token-only stylesheet', () => {
  accepts(py('lint_hardcodes.py', [F('good/tokens-only.css')]), /no hardcoded/i);
});

test('lint_hardcodes honours the ds-allow-hardcode escape hatches', () => {
  // Inline and block form both matter: adapter theme-config is unlintable without them.
  accepts(py('lint_hardcodes.py', [F('good/allowed-hardcode.css')]), /no hardcoded/i);
});

test('validate_tokens rejects an alias that resolves to nothing', () => {
  rejects(py('validate_tokens.py', [F('bad/unresolved-alias.json')]), /unresolved/i);
});

test('validate_tokens accepts a resolvable alias chain', () => {
  accepts(py('validate_tokens.py', [F('good/resolved-alias.json')]), /valid JSON/i);
});

test('validate_contrast rejects a required pair below WCAG AA', () => {
  rejects(py('validate_contrast.py', [F('bad/low-contrast-tokens.json')]), /body text on page .* < 4\.5/);
});

test('validate_contrast accepts a theme that passes light AND dark', () => {
  accepts(py('validate_contrast.py', [F('good/contrast-tokens.json')]), /all required contrast pairs pass/i);
});

test('validate_theme_refs rejects a var() the theme never defines', () => {
  rejects(
    py('validate_theme_refs.py', [F('bad/theme-refs/theme.css'), F('bad/theme-refs')]),
    /--color-text-tertiary.*NOT defined/);
});

test('validate_theme_refs accepts a theme that defines everything referenced', () => {
  accepts(
    py('validate_theme_refs.py', [F('good/theme-refs/theme.css'), F('good/theme-refs')]),
    /every component token reference resolves/i);
});
