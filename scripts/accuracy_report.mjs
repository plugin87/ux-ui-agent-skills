#!/usr/bin/env node
/**
 * ACCURACY REPORT — one command, all-or-nothing, reproducible.
 *
 * Runs every objective correctness gate the kit can prove and prints a single
 * verdict. "100%" here means: of the checks that CAN be measured objectively,
 * every one passes — nothing partial ships. It does NOT claim subjective visual
 * or brand fidelity (no tool can); it claims token-consistency, theme-resolution,
 * WCAG contrast (real headless-Chrome render, light + dark), and no-emoji.
 *
 * Usage: node scripts/accuracy_report.mjs
 * Exit 0 only if 100% of checks pass.
 */
import { execSync } from 'node:child_process';

const checks = [
  ['Token JSON valid + aliases resolve', 'python3 scripts/validate_tokens.py'],
  ['WCAG contrast — token pairs (light + dark)', 'python3 scripts/validate_contrast.py'],
  ['Component specs complete (anatomy/variants/states/tokens/a11y)', 'python3 scripts/validate_component_spec.py'],
  ['No hardcoded values (hex/px/ms/Tailwind/font) — golden', 'python3 scripts/lint_hardcodes.py examples/golden'],
  ['No hardcoded values — sample-app', 'python3 scripts/lint_hardcodes.py examples/sample-app'],
  ['Every var(--…) resolves to the theme (no floating tokens)', 'python3 scripts/validate_theme_refs.py'],
  ['No emoji in UI output or taste files', 'python3 scripts/check_no_emoji.py'],
  ['REAL-render WCAG — sample-app (light)', 'node scripts/measure_render.mjs examples/sample-app/preview.html'],
  ['REAL-render WCAG — sample-app (dark)', 'node scripts/measure_render.mjs --dark examples/sample-app/preview.html'],
  ['State-aware WCAG — every element, default/hover/focus (light)', 'node scripts/verify_states.mjs examples/sample-app/preview.html'],
  ['State-aware WCAG — every element, default/hover/focus (dark)', 'node scripts/verify_states.mjs --dark examples/sample-app/preview.html'],
  ['axe-core a11y (ARIA/labels/landmarks) — sample-app', 'node scripts/axe_audit.mjs examples/sample-app/preview.html'],
];

console.log('='.repeat(64));
console.log(' ACCURACY REPORT — objective correctness, reproducible');
console.log('='.repeat(64));

let pass = 0;
const fails = [];
for (const [label, cmd] of checks) {
  let ok = true, out = '';
  try { out = execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'] }).toString(); }
  catch (e) { ok = false; out = (e.stdout || '').toString() + (e.stderr || '').toString(); }
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (ok) pass++; else fails.push([label, out.trim().split('\n').slice(-6).join('\n')]);
}

const pct = Math.round((pass / checks.length) * 100);
console.log('-'.repeat(64));
console.log(` RESULT: ${pass}/${checks.length} checks passed  =  ${pct}%`);
if (fails.length) {
  console.log('\n FAILURES:');
  for (const [label, detail] of fails) console.log(`\n  ✗ ${label}\n${detail.split('\n').map(l => '      ' + l).join('\n')}`);
  console.log('\n NOT 100% — fix the above. Nothing partial ships.');
  process.exit(1);
}
console.log('\n 100% — every objective correctness check passes. Re-run anytime to reproduce.');
console.log(' Scope: token-consistency, theme-resolution, WCAG AA (real render, light+dark),');
console.log(' no hardcodes, no emoji. Subjective visual/brand fidelity is NOT claimed here.');
process.exit(0);
