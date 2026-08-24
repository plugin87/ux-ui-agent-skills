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
  ['Slop tells — no HIGH anti-slop tell (hardcoded AI gradient, single-radius) across every harness (light + dark)',
   'node scripts/slop_tells.mjs --strict examples/component-states/*.html examples/sample-app/preview.html && node scripts/slop_tells.mjs --strict --dark examples/component-states/*.html examples/sample-app/preview.html'],
  ['Target size (WCAG 2.5.8) — every target >= 24x24 or spacing/inline-exempt, mobile + desktop (light + dark)',
   'node scripts/verify_target_size.mjs examples/component-states && node scripts/verify_target_size.mjs --dark examples/component-states'],
  ['Reduced motion — policy present, motion stopped under reduce, no content lost across every harness',
   'node scripts/verify_reduced_motion.mjs examples/component-states'],
  ['Keyboard (WCAG 2.1.1) — Tab reaches every control, Enter/Space and arrow keys operate the widgets',
   'node scripts/verify_keyboard.mjs examples/component-states'],
  ['Token by intent — destructive never wears action.primary, affirmative never wears danger (light + dark)',
   'node scripts/lint_intent.mjs examples/component-states && node scripts/lint_intent.mjs --dark examples/component-states'],
  ['Content overflow — no silently clipped text, no overlapping controls, incl. the hostile-content harness',
   'node scripts/verify_overflow.mjs examples/component-states'],
  ['Instruction surface — always-on rules stay in CLAUDE.md, every rule file routed, brief within budget',
   'python3 scripts/validate_instruction_surface.py'],
  ['Starter template — reference layout complete, tokens resolve, seeded theme passes WCAG (light + dark)',
   'python3 scripts/validate_template.py'],
  ['Edge cases — hostile content harness (long unbroken strings, empty, single, missing, extremes, many items)',
   'node scripts/verify_states.mjs examples/component-states/edge-cases.html && node scripts/verify_states.mjs --dark examples/component-states/edge-cases.html && node scripts/axe_audit.mjs examples/component-states/edge-cases.html && node scripts/axe_audit.mjs --dark examples/component-states/edge-cases.html'],
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
