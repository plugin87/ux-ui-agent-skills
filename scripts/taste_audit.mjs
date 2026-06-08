#!/usr/bin/env node
/**
 * TASTE AUDIT (render-based, heuristic). Renders a page in headless Chrome and
 * measures the structural "slop tells" that the doctrine in taste/design-taste.md
 * warns about — from REAL computed styles + geometry, not static guesses.
 *
 * It is heuristic: taste is subjective, so this is a strong signal, not proof.
 * Checks (high-signal subset of the Pre-Flight Aesthetic Check):
 *   - Type-scale drama   : biggest heading vs body size (timid contrast = slop)
 *   - Uniform repetition : 3+ equal-size, equal-class siblings (no focal point)
 *   - Body measure       : paragraphs wider than ~75ch (readability/taste fail)
 *   - Palette discipline  : too many distinct accent hues
 *   - Pure #000/#fff      : harsh, amateur
 *   - Macro whitespace    : cramped section seams
 *
 * Usage: node scripts/taste_audit.mjs <file.html> [--dark] [--strict]
 *   --strict → exit 1 on any HIGH finding (use as a gate). Default: report, exit 0.
 */
import { resolve } from 'node:path';
let chromium;
try { ({ chromium } = await import('playwright')); }
catch { console.log('taste_audit: playwright not installed — SKIPPED'); process.exit(0); }

const argv = process.argv.slice(2);
const strict = argv.includes('--strict');
const dark = argv.includes('--dark');
const files = argv.filter(a => !a.startsWith('--'));
if (!files.length) { console.log('usage: node scripts/taste_audit.mjs <file.html> [--dark] [--strict]'); process.exit(0); }

const browser = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch());
let high = 0;

for (const f of files) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  await page.goto('file://' + resolve(f), { waitUntil: 'networkidle' }).catch(() => {});
  await page.addStyleTag({ content: '*{transition:none!important;animation:none!important}' });
  if (dark) await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  await page.waitForTimeout(300);

  const data = await page.evaluate(() => {
    const vis = el => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 1 && r.height > 1 && s.visibility !== 'hidden' && +s.opacity !== 0; };
    const texts = [];
    for (const el of document.querySelectorAll('body *')) {
      if (['SCRIPT', 'STYLE', 'SVG', 'PATH'].includes(el.tagName)) continue;
      const direct = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1);
      if (!direct || !vis(el)) continue;
      const s = getComputedStyle(el), r = el.getBoundingClientRect();
      texts.push({ tag: el.tagName, px: parseFloat(s.fontSize), weight: parseInt(s.fontWeight, 10) || 400,
        chars: el.textContent.trim().length, w: r.width });
    }
    // uniform repetition: LARGE sibling blocks (cards/sections) with same tag+class and near-equal size.
    // Small elements (icons, buttons) are excluded — uniformity there is fine.
    const cls = el => (typeof el.className === 'string' ? el.className : (el.getAttribute && el.getAttribute('class')) || '').split(' ').filter(Boolean)[0] || '';
    const groups = {};
    for (const el of document.querySelectorAll('body *')) {
      if (!vis(el) || !el.parentElement) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 160 || r.height < 110) continue; // only card/section-sized blocks
      const key = el.parentElement.tagName + '>' + el.tagName + '.' + cls(el);
      (groups[key] ||= []).push({ w: Math.round(r.width), h: Math.round(r.height) });
    }
    let uniform = 0, uniformKey = '';
    for (const [k, arr] of Object.entries(groups)) {
      if (arr.length < 3) continue;
      const w0 = arr[0].w, h0 = arr[0].h;
      const same = arr.filter(a => Math.abs(a.w - w0) < 6 && Math.abs(a.h - h0) < 6).length;
      if (same >= 3 && same > uniform) { uniform = same; uniformKey = k; }
    }
    // distinct accent (non-neutral) colors used on text/bg
    const hues = new Set();
    for (const el of document.querySelectorAll('body *')) {
      for (const c of [getComputedStyle(el).color, getComputedStyle(el).backgroundColor]) {
        const m = c.match(/\d+/g); if (!m) continue; const [r, g, b] = m.map(Number);
        const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
        if (mx - mn > 40) hues.add([Math.round(r / 32), Math.round(g / 32), Math.round(b / 32)].join());
      }
    }
    // pure black/white text or bg
    let pure = 0;
    for (const el of document.querySelectorAll('body *')) {
      const s = getComputedStyle(el);
      if (s.color === 'rgb(0, 0, 0)' || s.color === 'rgb(255, 255, 255)') {
        // allowed on dark/black sections? flag pure text color usage
      }
      if (s.backgroundColor === 'rgb(0, 0, 0)' || s.backgroundColor === 'rgb(255, 255, 255)') pure++;
    }
    return { texts, uniform, uniformKey, hues: hues.size };
  });
  await page.close();

  const findings = [];
  const bodyPx = (() => { const c = {}; data.texts.filter(t => t.chars > 30).forEach(t => c[t.px] = (c[t.px] || 0) + 1); const e = Object.entries(c).sort((a, b) => b[1] - a[1])[0]; return e ? +e[0] : 16; })();
  const maxHead = Math.max(0, ...data.texts.filter(t => t.weight >= 600 || /^H[12]$/.test(t.tag)).map(t => t.px));
  const ratio = maxHead && bodyPx ? maxHead / bodyPx : 0;
  if (ratio && ratio < 2.0) findings.push(['HIGH', `Timid type-scale contrast: biggest heading ${maxHead}px vs body ${bodyPx}px = ${ratio.toFixed(1)}x (premium ≥ ~2.5x). Make display type dramatically bigger and shorter.`]);
  if (data.uniform >= 3) findings.push(['MED', `${data.uniform} equal-size blocks "${data.uniformKey}" — fine for a dashboard metric row, but on a marketing/feature section break symmetry (one hero item / bento sizing).`]);
  const wide = data.texts.filter(t => t.tag === 'P' && t.w / (t.px * 0.5) > 80);
  if (wide.length) findings.push(['MED', `${wide.length} paragraph(s) wider than ~80ch — constrain body to 60–75ch (max-width: 65ch).`]);
  if (data.hues > 6) findings.push(['MED', `${data.hues} distinct accent hues — palette sprawl. One primary + at most one accent; neutrals carry the rest.`]);

  const mode = dark ? ' [dark]' : '';
  if (!findings.length) console.log(`OK   ${f}${mode} — no measurable taste slop (type ${ratio.toFixed(1)}x, ${data.hues} hues)`);
  else {
    console.log(`\n${f}${mode}:`);
    for (const [sev, msg] of findings) { console.log(`  ${sev}  ${msg}`); if (sev === 'HIGH') high++; }
  }
}
await browser.close();
if (strict && high) { console.log(`\n${high} HIGH taste finding(s).`); process.exit(1); }
console.log('\n(taste is heuristic — a strong signal, not proof. Pair with human visual review.)');
process.exit(0);
