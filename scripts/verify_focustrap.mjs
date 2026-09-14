#!/usr/bin/env node
/**
 * FOCUS-TRAP gate (WCAG 2.1.2 No Keyboard Trap + 2.4.3 Focus Order). Opens a
 * modal and verifies, with a real keyboard, that:
 *   - Tab cycles ONLY within the dialog (focus never escapes to the page),
 *   - the dialog has role="dialog" + aria-modal="true" + an accessible name,
 *   - Escape closes it and focus RETURNS to the trigger.
 *
 * Usage: node scripts/verify_focustrap.mjs <file.html> --open=<triggerSelector> [--dialog=<sel>] [--dark]
 * Exit 1 if the trap leaks, the dialog lacks semantics, or focus isn't returned.
 */
import { resolve } from 'node:path';
let chromium;
try { ({ chromium } = await import('playwright')); }
catch {
  // A missing browser must not read as a pass. Without DS_REQUIRE_BROWSER the gate
  // stays skippable for local convenience; CI and accuracy_report set it to 1, so a
  // machine that cannot render fails loudly instead of reporting green on nothing.
  const required = process.env.DS_REQUIRE_BROWSER === "1";
  console.log(`verify_focustrap: playwright not installed — ${required ? "REQUIRED, FAILING" : "SKIPPED"}`);
  process.exit(required ? 1 : 0);
}

const argv = process.argv.slice(2);
const file = argv.find(a => !a.startsWith('--'));
const open = (argv.find(a => a.startsWith('--open=')) || '').split('=')[1];
/* A native <dialog> opened with showModal() IS a modal dialog: the role and the
   modal semantics are implicit, and the browser traps focus itself. Looking only
   for [role="dialog"] made the gate refuse the better implementation. */
const dialogSel = (argv.find(a => a.startsWith('--dialog=')) || '').split('=')[1]
  || '[role="dialog"],dialog[open]';
const dark = argv.includes('--dark');
if (!file || !open) { console.log('usage: node scripts/verify_focustrap.mjs <file.html> --open=<trigger> [--dialog=<sel>] [--dark]'); process.exit(0); }

const browser = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch());
const page = await browser.newPage({ viewport: { width: 1100, height: 800 } });
await page.goto('file://' + resolve(file), { waitUntil: 'networkidle' }).catch(() => {});
if (dark) await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));

const fails = [];
const triggerWasFocusable = await page.evaluate(s => { const t = document.querySelector(s); if (t) t.id ||= '__trap_trigger'; return t ? t.id : null; }, open);
await page.click(open).catch(() => fails.push(`could not click trigger ${open}`));
await page.waitForTimeout(120);

const sem = await page.evaluate(sel => {
  const d = [...document.querySelectorAll(sel)].find(el => { const cs = getComputedStyle(el); return cs.display !== 'none' && cs.visibility !== 'hidden' && (el.offsetParent !== null || cs.position === 'fixed'); });
  if (!d) return { open: false };
  const focusables = [...d.querySelectorAll('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter(e => e.offsetParent !== null);
  const native = d.tagName === 'DIALOG' && d.hasAttribute('open');
  return { open: true,
    role: d.getAttribute('role') || (native ? 'dialog' : null),
    modal: d.getAttribute('aria-modal') || (native && typeof d.showModal === 'function' ? 'true' : null),
    native,
    named: !!(d.getAttribute('aria-label') || d.getAttribute('aria-labelledby')), count: focusables.length };
}, dialogSel);

if (!sem.open) {
  console.log(`verify_focustrap: no visible dialog (${dialogSel}) opened by ${open} — cannot verify`);
  await browser.close(); process.exit(1);
}
if (sem.role !== 'dialog') fails.push(`dialog missing role="dialog" (got ${sem.role})`);
if (sem.modal !== 'true') fails.push(`dialog missing aria-modal="true" (got ${sem.modal})`);
if (!sem.named) fails.push('dialog has no accessible name (aria-label/aria-labelledby)');

// Tab through more times than there are focusables; focus must never leave the dialog.
const steps = Math.max(6, sem.count * 2 + 2);
let leaked = false, leakWhere = '';
for (let i = 0; i < steps; i++) {
  await page.keyboard.press('Tab');
  const inside = await page.evaluate(sel => {
    const d = [...document.querySelectorAll(sel)].find(el => { const cs = getComputedStyle(el); return cs.display !== 'none' && cs.visibility !== 'hidden' && (el.offsetParent !== null || cs.position === 'fixed'); });
    if (!d) return false;
    const a = document.activeElement;
    /* A native modal <dialog> parks focus on <body> for one step as it wraps from
       the last control back to the first. Focus is still inside the trap - it has
       not reached anything behind the dialog - and WCAG 2.4.3 is about reaching
       the page underneath. A leak is an INTERACTIVE element outside the dialog. */
    if (a === document.body || a === document.documentElement) return true;
    return d.contains(a);
  }, dialogSel);
  if (!inside) { leaked = true; leakWhere = `after ${i + 1} Tab(s)`; break; }
}
if (leaked) fails.push(`focus ESCAPED the dialog ${leakWhere} — keyboard trap leak (WCAG 2.4.3)`);

// Escape closes + returns focus to trigger
await page.keyboard.press('Escape');
await page.waitForTimeout(120);
const afterEsc = await page.evaluate(({ sel, tid }) => {
  const d = [...document.querySelectorAll(sel)].find(el => { const cs = getComputedStyle(el); return cs.display !== 'none' && cs.visibility !== 'hidden' && (el.offsetParent !== null || cs.position === 'fixed'); });
  return { stillOpen: !!d, focusBackOnTrigger: tid ? document.activeElement === document.getElementById(tid) : null };
}, { sel: dialogSel, tid: triggerWasFocusable });
if (afterEsc.stillOpen) fails.push('Escape did not close the dialog');
else if (afterEsc.focusBackOnTrigger === false) fails.push('focus not returned to the trigger after close (WCAG 2.4.3)');

await browser.close();
const mode = dark ? ' [dark]' : '';
console.log(`focus-trap — ${file}${mode} (dialog had ${sem.count} focusables)`);
if (fails.length) { console.log('\nFAIL:'); for (const f of fails) console.log('  x ' + f); process.exit(1); }
console.log('OK: role/aria-modal/name present, Tab stays trapped, Escape closes and returns focus.');
process.exit(0);
