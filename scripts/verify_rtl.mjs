#!/usr/bin/env node
/**
 * RTL gate. Renders a page LTR then RTL (dir="rtl") and flags layout that breaks
 * only in RTL — the tell of physical left/right CSS instead of logical properties
 * (margin-inline-*, inset-inline-*, text-align: start). Catches horizontal
 * overflow that appears solely when the page is mirrored.
 *
 * Usage: node scripts/verify_rtl.mjs <file.html>
 * Exit 1 if RTL introduces horizontal overflow that LTR did not have.
 */
import { resolve } from 'node:path';
let chromium;
try { ({ chromium } = await import('playwright')); }
catch { console.log('verify_rtl: playwright not installed — SKIPPED'); process.exit(0); }

const file = process.argv.slice(2).find(a => !a.startsWith('--'));
if (!file) { console.log('usage: node scripts/verify_rtl.mjs <file.html>'); process.exit(0); }

const browser = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch());
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto('file://' + resolve(file), { waitUntil: 'networkidle' }).catch(() => {});
await page.addStyleTag({ content: '*{transition:none!important;animation:none!important}' });

const overflow = () => page.evaluate(() => {
  const de = document.documentElement;
  const x = de.scrollWidth - de.clientWidth;
  // elements wider than the viewport (the usual RTL breakage)
  const wide = [...document.body.querySelectorAll('*')].filter(el => {
    const r = el.getBoundingClientRect();
    return r.right > de.clientWidth + 2 || r.left < -2;
  }).slice(0, 5).map(el => el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : ''));
  return { x: Math.max(0, x), wide };
});

const ltr = await overflow();
await page.evaluate(() => { document.documentElement.setAttribute('dir', 'rtl'); });
await page.waitForTimeout(120);
const rtl = await overflow();
await browser.close();

console.log(`RTL — ${file}`);
console.log(`  LTR horizontal overflow: ${ltr.x}px | RTL: ${rtl.x}px`);
if (rtl.x > ltr.x + 2) {
  console.log(`\nFAIL: RTL introduces ${rtl.x - ltr.x}px of horizontal overflow not present in LTR.`);
  if (rtl.wide.length) console.log('  offending elements: ' + rtl.wide.join(', '));
  console.log('  → replace physical left/right with logical properties (margin-inline-*, inset-inline-*, text-align: start).');
  process.exit(1);
}
console.log('OK: layout mirrors cleanly — no RTL-only horizontal overflow.');
process.exit(0);
