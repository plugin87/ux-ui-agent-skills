#!/usr/bin/env node
/**
 * REAL-render WCAG gate. Opens HTML in headless Chrome, disables transitions,
 * and measures the contrast of every visible text element against its true
 * (alpha-composited) background. This is ground truth — not hand-typed numbers.
 *
 * Usage:
 *   node scripts/measure_render.mjs examples/apple-demo/index.html
 *   node scripts/measure_render.mjs --dark examples/sample-app/preview.html
 *   node scripts/measure_render.mjs            # defaults to examples/ *.html
 *
 * Requires Playwright (`npm i -D playwright` + a Chrome/Chromium). If it isn't
 * installed the script SKIPS (exit 0) so it never blocks users who don't have it.
 * Exit 1 only when a real rendered text pair is below WCAG 2.2 AA.
 */
import { readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';

let chromium;
try { ({ chromium } = await import('playwright')); }
catch { console.log('measure_render: playwright not installed — SKIPPED (npm i -D playwright to enable)'); process.exit(0); }

const argv = process.argv.slice(2);
const dark = argv.includes('--dark');
let files = argv.filter(a => !a.startsWith('--'));
if (files.length === 0) {
  const root = resolve('examples');
  const walk = d => readdirSync(d).flatMap(n => {
    const p = join(d, n);
    return statSync(p).isDirectory() ? walk(p) : (p.endsWith('.html') ? [p] : []);
  });
  try { files = walk(root); } catch { files = []; }
}
if (files.length === 0) { console.log('measure_render: no HTML files to check.'); process.exit(0); }

function lin(c) { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }
function L([r, g, b]) { return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); }
function ratio(a, b) { const l1 = L(a), l2 = L(b), hi = Math.max(l1, l2), lo = Math.min(l1, l2); return (hi + 0.05) / (lo + 0.05); }

let browser;
try { browser = await chromium.launch({ channel: 'chrome' }); }
catch { try { browser = await chromium.launch(); } catch (e) { console.log('measure_render: no browser available — SKIPPED'); process.exit(0); } }

let totalFail = 0;
for (const f of files) {
  const page = await browser.newPage();
  await page.goto('file://' + resolve(f));
  await page.addStyleTag({ content: '*{transition:none!important;animation:none!important}' });
  if (dark) await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));

  const items = await page.evaluate(() => {
    const toRGBA = s => { const m = s && s.match(/[\d.]+/g); return m ? [+m[0], +m[1], +m[2], m[3] !== undefined ? +m[3] : 1] : null; };
    function bgOf(el) {
      const stack = []; let n = el;
      while (n) { const c = toRGBA(getComputedStyle(n).backgroundColor); if (c && c[3] > 0) { stack.push(c); if (c[3] >= 1) break; } n = n.parentElement; }
      let base = [255, 255, 255];
      for (let i = stack.length - 1; i >= 0; i--) { const [r, g, b, a] = stack[i]; base = [r * a + base[0] * (1 - a), g * a + base[1] * (1 - a), b * a + base[2] * (1 - a)]; }
      return base;
    }
    const out = [];
    for (const el of document.querySelectorAll('body *')) {
      if (['SCRIPT', 'STYLE', 'SVG', 'PATH', 'USE'].includes(el.tagName)) continue;
      const direct = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length);
      if (!direct) continue;
      if (!el.offsetParent && getComputedStyle(el).position !== 'fixed') continue; // not visible
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || +cs.opacity === 0) continue;
      const col = toRGBA(cs.color); if (!col) continue;
      const px = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight, 10) >= 700;
      out.push({ tag: el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : ''),
        text: el.textContent.trim().slice(0, 24), color: [col[0], col[1], col[2]], bg: bgOf(el), px, bold });
    }
    return out;
  });
  await page.close();

  const fails = [];
  for (const it of items) {
    const need = (it.px >= 24 || (it.px >= 18.66 && it.bold)) ? 3.0 : 4.5;
    const r = ratio(it.color, it.bg);
    if (r < need) fails.push({ ...it, r, need });
  }
  const mode = dark ? ' [dark]' : '';
  if (fails.length) {
    totalFail += fails.length;
    console.log(`\nFAIL ${f}${mode} — ${fails.length} text pair(s) below WCAG AA:`);
    for (const x of fails) console.log(`  x <${x.tag}> "${x.text}" ${x.r.toFixed(2)}:1 (need ${x.need})  [rgb(${x.color.map(Math.round)}) on rgb(${x.bg.map(Math.round)})]`);
  } else {
    console.log(`OK   ${f}${mode} — all ${items.length} text element(s) meet WCAG AA`);
  }
}
await browser.close();
if (totalFail) { console.log(`\n${totalFail} real-rendered contrast failure(s).`); process.exit(1); }
console.log('\nOK: every rendered text element meets WCAG 2.2 AA.');
process.exit(0);
