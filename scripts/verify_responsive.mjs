#!/usr/bin/env node
/**
 * RESPONSIVE gate. Loads each harness at narrow viewports and fails if the
 * document overflows horizontally (a sideways scrollbar = broken responsive
 * layout). Catches the common causes: fixed px widths that don't shrink,
 * unreset <ul>/<ol> list padding, non-wrapping flex rows, and
 * grid minmax(Npx,1fr) minimums larger than the viewport.
 *
 * --scale renders with a larger root font, which is the cheap local proxy for two
 * real situations this gate otherwise misses: another platform's wider fallback
 * font (Linux Chromium measured a label 2px wider than macOS Chrome and tipped a
 * page over at 280px), and a user who has set a larger default text size. A layout
 * that only fits at exactly 16px is fitting by luck.
 *
 * The default widths include the five viewports Safari gives a page on iPhone
 * Duo, as WebKit published them for Safari 27.1: 382 (outer screen, upright),
 * 385 (one of two windows side by side on the inner screen), 594 (outer, on its
 * side), 669 (inner, upright) and 951 (inner, on its side). 594 to 951 is where a
 * layout switches from one column to two, and nothing tested it before.
 *
 * The FOLD. Each page is also rendered at 951x620 with the inner screen half
 * closed, like a book: two viewport segments, 0-455 and 495-951, with the 40px
 * hinge between them (the band a third party measured in Apple's simulator; Apple
 * does not publish it), and `device-posture: folded`. A page that does not react
 * to the fold is left alone there: Safari ships these APIs behind feature flags,
 * so one layout across the hinge is what most visitors get, and it works. A page
 * that DOES react (its layout changes when the fold appears) has said it is
 * fold-aware, and then nothing readable or tappable may sit on the hinge, and the
 * page may not overflow either. --no-fold skips this pass.
 *
 * Usage: node scripts/verify_responsive.mjs <file.html | dir>
 *          [--widths=280,320,382,385,414,594,669,951] [--scale=1.25] [--no-fold] [--advisory]
 * Exit 1 if any file overflows at any tested width, or a fold-aware page puts text
 * or a control on the hinge (0 with --advisory).
 */
import { readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { requireTargets } from './_targets.mjs';
import { launchOrSkip } from './_browser.mjs';
let chromium;
try { ({ chromium } = await import('playwright')); }
catch {
  // A missing browser must not read as a pass. Without DS_REQUIRE_BROWSER the gate
  // stays skippable for local convenience; CI and accuracy_report set it to 1, so a
  // machine that cannot render fails loudly instead of reporting green on nothing.
  const required = process.env.DS_REQUIRE_BROWSER === "1";
  console.log(`verify_responsive: playwright not installed: ${required ? "REQUIRED, FAILING" : "SKIPPED"}`);
  process.exit(required ? 1 : 0);
}

const argv = process.argv.slice(2);
const [target] = requireTargets(argv.filter(a => !a.startsWith('--')));
if (!target) { console.log('usage: node scripts/verify_responsive.mjs <file.html | dir> [--widths=280,320,382,385,414,594,669,951] [--no-fold]'); process.exit(0); }
const widths = (argv.find(a => a.startsWith('--widths=')) || '--widths=280,320,382,385,414,594,669,951').split('=')[1].split(',').map(Number);
const fold = !argv.includes('--no-fold');
const scale = Number((argv.find(a => a.startsWith('--scale=')) || '--scale=1').split('=')[1]) || 1;
const advisory = argv.includes('--advisory');

const abs = resolve(target);
const files = statSync(abs).isDirectory()
  ? readdirSync(abs).filter(f => f.endsWith('.html')).map(f => join(abs, f)).sort()
  : [abs];

const browser = await launchOrSkip(chromium, 'verify_responsive', { fallback: false });
const fails = [];
for (const w of widths) {
  const page = await browser.newPage({ viewport: { width: w, height: 800 } });
  for (const f of files) {
    await page.goto('file://' + f);
    if (scale !== 1) await page.addStyleTag({ content: `html{font-size:${16 * scale}px}` });
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

/* iPhone Duo, inner screen on its side, half closed. */
const DUO = { width: 951, height: 620, hinge: [455, 495] };
let aware = 0;
if (fold) {
  const page = await browser.newPage({ viewport: { width: DUO.width, height: DUO.height }, reducedMotion: 'reduce' });
  const cdp = await page.context().newCDPSession(page);
  // Settled before measuring: a chart drawn after load, or a font swapping in,
  // moves boxes on its own, and would read as the page answering the fold.
  const load = async (f) => {
    await page.goto('file://' + f);
    if (scale !== 1) await page.addStyleTag({ content: `html{font-size:${16 * scale}px}` });
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    await page.waitForTimeout(150);
  };
  // Every element's box, so "the layout changed when the fold appeared" is a
  // measurement rather than a guess at which CSS the page might have used.
  const boxes = () => page.evaluate(() => [...document.querySelectorAll('body *')].map(el => {
    const r = el.getBoundingClientRect();
    return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)].join(',');
  }).join(';'));
  const flat = new Map();
  for (const f of files) {
    await load(f); const once = await boxes();
    await load(f); const twice = await boxes();
    // A layout that differs between two identical loads cannot be compared with
    // the folded one. Saying so beats guessing either way.
    if (once !== twice) fails.push(`${f.split('/').pop()} folded: the flat layout differs between two identical loads, so whether the page answers the fold could not be judged`);
    else flat.set(f, once);
  }

  await cdp.send('Emulation.setDeviceMetricsOverride', { width: DUO.width, height: DUO.height, deviceScaleFactor: 1,
    mobile: false, displayFeature: { orientation: 'vertical', offset: DUO.hinge[0], maskLength: DUO.hinge[1] - DUO.hinge[0] } });
  await cdp.send('Emulation.setDevicePostureOverride', { posture: { type: 'folded' } });
  for (const f of files) {
    if (!flat.has(f)) continue;
    await load(f);
    const segs = await page.evaluate(() => window.viewport?.segments?.length ?? 0);
    if (segs !== 2) { fails.push(`${f.split('/').pop()} folded: the browser reported ${segs} viewport segment(s), not 2, so the fold could not be tested`); continue; }
    if ((await boxes()) === flat.get(f)) continue;  // one layout across the hinge: fine
    aware++;
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (over > 1) fails.push(`${f.split('/').pop()} folded @${DUO.width}px overflow +${over}px`);
    const onHinge = await page.evaluate(([lo, hi]) => {
      // What is scrolled or clipped out of an ancestor's box is not on screen,
      // so a nav that scrolls sideways inside its pane is measured where it is
      // cut, not where its overflowing text would have run.
      const clip = (start, r) => {
        let left = r.left, right = r.right;
        for (let a = start; a && a !== document.documentElement; a = a.parentElement) {
          if (getComputedStyle(a).overflowX === 'visible') continue;
          const b = a.getBoundingClientRect();
          left = Math.max(left, b.left + a.clientLeft);
          right = Math.min(right, b.left + a.clientLeft + a.clientWidth);
        }
        return { left, right, width: right - left, height: r.height };
      };
      const crosses = r => r.width > 0 && r.height > 0 && r.left < hi && r.right > lo;
      const shown = el => { const s = getComputedStyle(el); return s.visibility !== 'hidden' && Number(s.opacity) > 0; };
      const name = el => { const c = (el.getAttribute('class') || '').trim().split(/\s+/)[0]; return el.tagName.toLowerCase() + (el.id ? '#' + el.id : c ? '.' + c : ''); };
      const hits = new Set();
      const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let n; (n = walk.nextNode());) {
        if (!n.textContent.trim() || !shown(n.parentElement)) continue;
        const range = document.createRange(); range.selectNodeContents(n);
        if ([...range.getClientRects()].some(r => crosses(clip(n.parentElement, r)))) hits.add('text in ' + name(n.parentElement));
      }
      const CONTROL = 'a[href],button,input,select,textarea,summary,[role=button],[role=link],[role=tab],[role=menuitem],[tabindex]:not([tabindex="-1"])';
      for (const el of document.querySelectorAll(CONTROL)) {
        if (shown(el) && crosses(clip(el.parentElement, el.getBoundingClientRect()))) hits.add('control ' + name(el));
      }
      return [...hits];
    }, DUO.hinge);
    if (onHinge.length) {
      fails.push(`${f.split('/').pop()} folded: fold-aware, yet ${onHinge.length} thing(s) sit on the hinge (${DUO.hinge[0]}-${DUO.hinge[1]}px): ${onHinge.slice(0, 6).join(', ')}${onHinge.length > 6 ? ', ...' : ''}`);
    }
  }
  await page.close();
}
await browser.close();

const at = `${widths.join('/')}px${scale !== 1 ? ` @ ${scale}x root font` : ''}`;
const folded = fold ? `; folded at ${DUO.width}px (iPhone Duo): ${aware} fold-aware page(s), hinge clear` : '';
if (fails.length) {
  console.log(`verify_responsive: ${advisory ? 'ADVISORY' : 'FAIL'} (${at})`);
  for (const m of fails) console.log('  x ' + m);
  if (!advisory) process.exit(1);
  console.log('  (advisory run: reported, not failed)');
  process.exit(0);
}
console.log(`verify_responsive: OK: ${files.length} file(s), no horizontal overflow at ${at}${folded}`);
