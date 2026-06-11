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
  ['No emoji in UI output, taste docs, or the agent instruction surface', 'python3 scripts/check_no_emoji.py'],
  ['REAL-render WCAG — sample-app (light)', 'node scripts/measure_render.mjs examples/sample-app/preview.html'],
  ['REAL-render WCAG — sample-app (dark)', 'node scripts/measure_render.mjs --dark examples/sample-app/preview.html'],
  ['State-aware WCAG — every element, default/hover/focus (light)', 'node scripts/verify_states.mjs examples/sample-app/preview.html'],
  ['State-aware WCAG — every element, default/hover/focus (dark)', 'node scripts/verify_states.mjs --dark examples/sample-app/preview.html'],
  ['axe-core a11y (ARIA/labels/landmarks) — sample-app', 'node scripts/axe_audit.mjs examples/sample-app/preview.html'],
  ['Focus-trap (WCAG 2.1.2/2.4.3) — sample-app modal', 'node scripts/verify_focustrap.mjs examples/sample-app/preview.html --open="#delBtn"'],
  ['RTL layout (logical properties, no mirror overflow) — sample-app', 'node scripts/verify_rtl.mjs examples/sample-app/preview.html'],
  ['Token build resolves all aliases + emits CSS', 'node scripts/build_tokens.mjs --out dist/tokens.css'],
  ['Component states harness — Button, every variant × state (states + axe, light + dark)',
   'node scripts/verify_states.mjs examples/component-states/button.html && node scripts/verify_states.mjs --dark examples/component-states/button.html && node scripts/axe_audit.mjs examples/component-states/button.html'],
  ['Component states harness — Input, every state incl error/disabled/loading (states + axe + contrast, light + dark)',
   'node scripts/verify_states.mjs examples/component-states/input.html && node scripts/verify_states.mjs --dark examples/component-states/input.html && node scripts/axe_audit.mjs examples/component-states/input.html && node scripts/measure_render.mjs --dark examples/component-states/input.html'],
  ['Component states harness — Modal (focus trap + states + axe, light + dark)',
   'node scripts/verify_focustrap.mjs examples/component-states/modal.html --open="#openBtn" && node scripts/verify_focustrap.mjs examples/component-states/modal.html --open="#openBtn" --dark && node scripts/verify_states.mjs examples/component-states/modal.html && node scripts/axe_audit.mjs examples/component-states/modal.html'],
  ['Component harnesses — Tabs / Select / Checkbox-Radio-Switch / Toast (states + axe + render, light + dark)',
   ['tabs', 'select', 'form-controls', 'toast'].map(c =>
     `node scripts/verify_states.mjs examples/component-states/${c}.html && node scripts/verify_states.mjs --dark examples/component-states/${c}.html && node scripts/axe_audit.mjs examples/component-states/${c}.html && node scripts/measure_render.mjs --dark examples/component-states/${c}.html`).join(' && ')],
  ['Component harnesses — Feedback / Navigation / Overlays / Misc (states + axe + render, light + dark)',
   ['feedback', 'navigation', 'overlays', 'misc'].map(c =>
     `node scripts/verify_states.mjs examples/component-states/${c}.html && node scripts/verify_states.mjs --dark examples/component-states/${c}.html && node scripts/axe_audit.mjs examples/component-states/${c}.html && node scripts/axe_audit.mjs --dark examples/component-states/${c}.html && node scripts/measure_render.mjs --dark examples/component-states/${c}.html`).join(' && ')],
  ['Component harnesses — Card / Data Table / Date Picker / File Upload / Search-Field (states + axe, light + dark)',
   ['card', 'data-table', 'datepicker', 'fileupload', 'search'].map(c =>
     `node scripts/verify_states.mjs examples/component-states/${c}.html && node scripts/verify_states.mjs --dark examples/component-states/${c}.html && node scripts/axe_audit.mjs examples/component-states/${c}.html && node scripts/axe_audit.mjs --dark examples/component-states/${c}.html`).join(' && ')],
  ['Component harness — Drawer (focus trap + Escape + states + axe, light + dark)',
   'node scripts/verify_focustrap.mjs examples/component-states/drawer.html --open="#openBtn" && node scripts/verify_focustrap.mjs examples/component-states/drawer.html --open="#openBtn" --dark && node scripts/verify_states.mjs examples/component-states/drawer.html && node scripts/axe_audit.mjs examples/component-states/drawer.html'],
  ['Component harnesses — Charts / Tree-Carousel-Gallery / App Shell / Context Menu (states + axe, light + dark)',
   ['charts', 'data-display', 'app-shell', 'context-menu'].map(c =>
     `node scripts/verify_states.mjs examples/component-states/${c}.html && node scripts/verify_states.mjs --dark examples/component-states/${c}.html && node scripts/axe_audit.mjs examples/component-states/${c}.html && node scripts/axe_audit.mjs --dark examples/component-states/${c}.html`).join(' && ')],
  ['Component harness — Command Palette (focus trap + combobox/listbox + states + axe, light + dark)',
   'node scripts/verify_focustrap.mjs examples/component-states/command-palette.html --open="#openBtn" && node scripts/verify_states.mjs examples/component-states/command-palette.html && node scripts/verify_states.mjs --dark examples/component-states/command-palette.html && node scripts/axe_audit.mjs examples/component-states/command-palette.html && node scripts/axe_audit.mjs --dark examples/component-states/command-palette.html'],
  ['Responsive — no horizontal overflow at 280/320/414px across every component harness',
   'node scripts/verify_responsive.mjs examples/component-states'],
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
  for (const [label, detail] of fails) console.log(`\n  x ${label}\n${detail.split('\n').map(l => '      ' + l).join('\n')}`);
  console.log('\n NOT 100% — fix the above. Nothing partial ships.');
  process.exit(1);
}
console.log('\n 100% — every objective correctness check passes. Re-run anytime to reproduce.');
console.log(' Scope: token-consistency, theme-resolution, WCAG AA (real render, light+dark),');
console.log(' no hardcodes, no emoji. Subjective visual/brand fidelity is NOT claimed here.');
process.exit(0);
