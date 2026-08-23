#!/usr/bin/env node
/**
 * CONTENT-OVERFLOW gate — enforces the handoff rule in CLAUDE.md that nothing
 * else enforced: "Edge cases addressed (long text, empty, overflow, single item,
 * many items)."
 *
 * Every other render gate in the kit runs on well-behaved demo copy, where each
 * label happens to fit. Real products carry a 60-character email, a German
 * compound noun, a pasted API token, a 10-digit figure. This gate measures what
 * that content does to the layout.
 *
 *   A. CLIPPED    text is silently cut off: the element scrolls its own content
 *                 while overflow is hidden/clip and no ellipsis admits it. The
 *                 user simply never sees the rest. An explicit ellipsis is
 *                 deliberate truncation and is NOT flagged.
 *   B. OVERLAP    two interactive controls physically overlap by more than a
 *                 quarter of the smaller one — long content has pushed the
 *                 layout on top of itself, so one control is partly untappable.
 *
 * verify_responsive.mjs covers the third failure (the page itself scrolling
 * sideways); this covers the two that stay inside the page and so look fine in a
 * screenshot of the happy path.
 *
 * Usage: node scripts/verify_overflow.mjs <file.html | dir> [--widths=320,414,1280]
 * Exit 1 on any signal.
 */
import { readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
let chromium;
try { ({ chromium } = await import('playwright')); }
catch { console.log('verify_overflow: playwright not installed — SKIPPED'); process.exit(0); }

const argv = process.argv.slice(2);
const targets = argv.filter(a => !a.startsWith('--'));
if (!targets.length) {
  console.log('usage: node scripts/verify_overflow.mjs <file.html | dir> [--widths=320,414,1280]');
  process.exit(0);
}
const widths = (argv.find(a => a.startsWith('--widths=')) || '--widths=320,414,1280').split('=')[1].split(',').map(Number);

const files = targets.flatMap(t => {
  const abs = resolve(t);
  return statSync(abs).isDirectory()
    ? readdirSync(abs).filter(f => f.endsWith('.html')).map(f => join(abs, f))
    : [abs];
}).sort();

const AUDIT = () => {
  const name = (el) => {
    const id = el.id ? '#' + el.id : (typeof el.className === 'string' && el.className.trim()
      ? '.' + el.className.trim().split(/\s+/)[0] : '');
    const t = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 26);
    return `${el.tagName.toLowerCase()}${id}${t ? ` "${t}"` : ''}`;
  };
  const vis = (el) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  // ---- A. silently clipped text
  const clipped = [];
  for (const el of document.querySelectorAll('body *')) {
    if (!vis(el)) continue;
    // Only judge elements that own text directly — not layout wrappers.
    const ownsText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 2);
    if (!ownsText) continue;
    const cs = getComputedStyle(el);
    const hiddenX = cs.overflowX === 'hidden' || cs.overflowX === 'clip';
    const hiddenY = cs.overflowY === 'hidden' || cs.overflowY === 'clip';
    const ellipsis = cs.textOverflow === 'ellipsis';
    if (hiddenX && !ellipsis && el.scrollWidth > el.clientWidth + 1) {
      clipped.push(`${name(el)} — ${el.scrollWidth - el.clientWidth}px of text cut off horizontally, no ellipsis`);
    } else if (hiddenY && el.scrollHeight > el.clientHeight + 1) {
      clipped.push(`${name(el)} — ${el.scrollHeight - el.clientHeight}px of text cut off vertically`);
    }
  }

  // ---- B. overlapping interactive controls
  const controls = [...document.querySelectorAll('a[href],button,input:not([type="hidden"]),select,textarea,[role="button"],[role="tab"],[role="menuitem"],[role="option"]')]
    .filter(el => vis(el) && !el.disabled)
    .map(el => ({ el, r: el.getBoundingClientRect(), positioned: /absolute|fixed/.test(getComputedStyle(el).position) }));
  const overlaps = [];
  /* A positioned control sitting wholly inside another is a deliberate inline
     affordance — the clear button in a search field, the reveal toggle in a
     password field. Layout collapse produces PARTIAL overlap instead. */
  const layeredAffordance = (a, b) => {
    const [small, big] = a.r.width * a.r.height <= b.r.width * b.r.height ? [a, b] : [b, a];
    const inside = small.r.left >= big.r.left - 1 && small.r.right <= big.r.right + 1
      && small.r.top >= big.r.top - 1 && small.r.bottom <= big.r.bottom + 1;
    return inside && small.positioned;
  };
  for (let i = 0; i < controls.length; i++) {
    for (let j = i + 1; j < controls.length; j++) {
      const a = controls[i], b = controls[j];
      if (a.el.contains(b.el) || b.el.contains(a.el)) continue;   // nesting is not overlap
      if (layeredAffordance(a, b)) continue;
      const w = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
      const h = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
      if (w <= 1 || h <= 1) continue;
      const area = w * h;
      const smaller = Math.min(a.r.width * a.r.height, b.r.width * b.r.height);
      if (smaller > 0 && area / smaller > 0.25) {
        overlaps.push(`${name(a.el)} overlaps ${name(b.el)} by ${Math.round((area / smaller) * 100)}%`);
      }
    }
  }
  return { clipped, overlaps };
};

const browser = await chromium.launch({ channel: 'chrome' });
const problems = [];

for (const w of widths) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  for (const f of files) {
    await page.goto('file://' + f);
    await page.waitForTimeout(120);
    const { clipped, overlaps } = await page.evaluate(AUDIT);
    const fname = f.split('/').pop();
    for (const c of clipped.slice(0, 5)) problems.push(`${fname} @${w}px  [A clipped]  ${c}`);
    for (const o of overlaps.slice(0, 5)) problems.push(`${fname} @${w}px  [B overlap]  ${o}`);
  }
  await page.close();
}
await browser.close();

if (problems.length) {
  console.log('verify_overflow: FAIL — content does not survive its container');
  for (const p of [...new Set(problems)].slice(0, 40)) console.log('  x ' + p);
  console.log('  Fix A: let the text wrap, or truncate on purpose with text-overflow:ellipsis + a title/tooltip.');
  console.log('  Fix B: allow the row to wrap (flex-wrap) or give the control min-width:0 so it can shrink.');
  process.exit(1);
}
console.log(`verify_overflow: OK — ${files.length} file(s) @${widths.join('/')}px: no silently clipped text, no overlapping controls`);
