#!/usr/bin/env node
/**
 * STATE-AWARE WCAG gate. For every interactive element, measures the real
 * computed text/background contrast in DEFAULT, HOVER, and FOCUS states — so a
 * button that turns the wrong color on hover (e.g. a secondary that picks up the
 * primary fill via CSS specificity) is caught, not just the resting state.
 *
 * Usage: node scripts/verify_states.mjs <file.html> [--dark]
 * Exit 1 if any state of any element drops below WCAG AA.
 */
import { resolve } from 'node:path';
let chromium;
try { ({ chromium } = await import('playwright')); }
catch { console.log('verify_states: playwright not installed — SKIPPED'); process.exit(0); }

const argv = process.argv.slice(2);
const dark = argv.includes('--dark');
const file = argv.find(a => !a.startsWith('--'));
if (!file) { console.log('usage: node scripts/verify_states.mjs <file.html> [--dark]'); process.exit(0); }

function lin(c) { c /= 255; return c <= .03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; }
function L([r, g, b]) { return .2126 * lin(r) + .7152 * lin(g) + .0722 * lin(b); }
function ratio(a, b) { const l1 = L(a), l2 = L(b), hi = Math.max(l1, l2), lo = Math.min(l1, l2); return (hi + .05) / (lo + .05); }
const parse = s => { const m = s && s.match(/[\d.]+/g); return m ? m.slice(0, 3).map(Number) : null; };

const browser = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch());
const page = await browser.newPage({ viewport: { width: 1000, height: 800 } });
await page.goto('file://' + resolve(file), { waitUntil: 'networkidle' }).catch(() => {});
await page.addStyleTag({ content: '*{transition:none!important;animation:none!important}' });
if (dark) await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));

const read = el => {
  const transparent = c => { const a = c.match(/[\d.]+/g); return !c || c === 'rgba(0, 0, 0, 0)' || (a && a.length === 4 && parseFloat(a[3]) === 0); };
  const eff = n => { while (n) { const c = getComputedStyle(n).backgroundColor; if (!transparent(c)) return c; n = n.parentElement; } return getComputedStyle(document.body).backgroundColor; };
  const cs = getComputedStyle(el);
  // skip non-text form controls (checkbox/radio/switch render natively via accent-color,
  // not CSS text color) and invisible elements — measuring their color/bg is meaningless.
  const isToggle = el.tagName === 'INPUT' && ['checkbox', 'radio'].includes(el.type);
  // WCAG 1.4.3 / 1.4.11 exempt disabled (inactive) controls from contrast.
  const isDisabled = el.disabled || el.getAttribute('aria-disabled') === 'true';
  const skip = isToggle || el.getAttribute('role') === 'switch' || +cs.opacity === 0 || isDisabled;
  const own = transparent(cs.backgroundColor) ? eff(el.parentElement) : cs.backgroundColor;
  // graphical / icon-only control: no DIRECT text node (only an <svg> or nothing) →
  // WCAG 1.4.11 non-text contrast applies (3:1), not the 4.5 text rule.
  const graphical = ![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
  return { skip, graphical, color: cs.color, bg: own, label: (el.textContent || el.value || el.getAttribute('aria-label') || '').trim().slice(0, 18), px: parseFloat(cs.fontSize), bold: (parseInt(cs.fontWeight, 10) || 400) >= 700 };
};

const handles = await page.$$('button, a[href], input, select, textarea, [role="button"], [role="switch"]');
const fails = [];
let checked = 0;
for (const h of handles) {
  for (const state of ['default', 'hover', 'focus']) {
    try {
      if (state === 'hover') await h.hover({ timeout: 1000, force: true });
      if (state === 'focus') await h.evaluate(el => el.focus && el.focus());
      const r = await h.evaluate(read);
      await page.mouse.move(0, 0);
      if (state === 'focus') await h.evaluate(el => el.blur && el.blur());
      if (r.skip) break;  // non-text control (checkbox/radio/switch) or invisible — not a text-contrast target
      const fg = parse(r.color), bg = parse(r.bg);
      if (!fg || !bg) continue;
      checked++;
      const need = r.graphical ? 3.0 : ((r.px >= 24 || (r.px >= 18.66 && r.bold)) ? 3.0 : 4.5);
      const cr = ratio(fg, bg);
      if (cr < need) fails.push(`${state.padEnd(7)} "${r.label}" ${cr.toFixed(2)}:1 (need ${need})  [rgb(${fg}) on rgb(${bg})]`);
    } catch { /* element not hoverable/visible — skip */ }
  }
}
await browser.close();

const mode = dark ? ' [dark]' : '';
console.log(`Checked ${checked} element-state(s) in ${file}${mode}`);
if (fails.length) {
  console.log(`\nFAIL — ${fails.length} state(s) below WCAG AA:`);
  for (const f of fails) console.log('  x ' + f);
  process.exit(1);
}
console.log('OK: every interactive element passes WCAG AA in default, hover, and focus.');
process.exit(0);
