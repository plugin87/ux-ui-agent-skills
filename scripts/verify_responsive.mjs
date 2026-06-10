#!/usr/bin/env node
/**
 * RESPONSIVE gate. Loads each harness at narrow viewports and fails if the
 * document overflows horizontally (a sideways scrollbar = broken responsive
 * layout). Catches the common causes: fixed px widths that don't shrink,
 * unreset <ul>/<ol> list padding, non-wrapping flex rows, and
 * grid minmax(Npx,1fr) minimums larger than the viewport.
 *
 * Usage: node scripts/verify_responsive.mjs <file.html | dir> [--widths=280,320,414]
 * Exit 1 if any file overflows at any tested width.
 */
import { readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
let chromium;
try { ({ chromium } = await import('playwright')); }
catch { console.log('verify_responsive: playwright not installed — SKIPPED'); process.exit(0); }

const argv = process.argv.slice(2);
const target = argv.find(a => !a.startsWith('--'));
if (!target) { console.log('usage: node scripts/verify_responsive.mjs <file.html | dir> [--widths=280,320,414]'); process.exit(0); }
const widths = (argv.find(a => a.startsWith('--widths=')) || '--widths=280,320,414').split('=')[1].split(',').map(Number);

const abs = resolve(target);
const files = statSync(abs).isDirectory()
  ? readdirSync(abs).filter(f => f.endsWith('.html')).map(f => join(abs, f)).sort()
  : [abs];

const browser = await chromium.launch({ channel: 'chrome' });
const fails = [];
for (const w of widths) {
  const page = await browser.newPage({ viewport: { width: w, height: 800 } });
  for (const f of files) {
    await page.goto('file://' + f);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (over > 1) {
      const culprit = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        for (const el of document.querySelectorAll('*')) {
          const r = el.getBoundingClientRect();
          if (r.right > vw + 1 && r.width <= vw + 40) return el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : '');
        }
        return '?';
      });
      fails.push(`${f.split('/').pop()} @${w}px overflow +${over}px (widest: ${culprit})`);
    }
  }
  await page.close();
}
await browser.close();

if (fails.length) {
  console.log('verify_responsive: FAIL');
  for (const m of fails) console.log('  x ' + m);
  process.exit(1);
}
console.log(`verify_responsive: OK — ${files.length} file(s), no horizontal overflow at ${widths.join('/')}px`);
