#!/usr/bin/env node
/**
 * SLOP TELLS (render-based). Renders a page in headless Chrome and measures the
 * machine-generated "tells" that taste_audit does NOT cover yet — from REAL
 * computed styles + geometry, not static guesses. Complements taste_audit.mjs
 * (which covers type-scale, uniform blocks, measure, palette sprawl).
 *
 * Tells detected here (see taste/design-taste.md):
 *   1. Single-radius monotony  : every rounded box shares ONE border-radius
 *                                (real systems vary radius by component size)
 *   2. Flat elevation          : shadowed elements all use ONE shadow / the
 *                                generic 0 1px 3px rgba(0,0,0,.1) default stack
 *   3. The default AI gradient : indigo/violet -> blue linear-gradient (the #1
 *                                generated gradient tell)
 *   4. Pure #000 text          : harsh; premium UIs use a tinted near-black
 *   5. Opaque black shadow     : rgb(0,0,0) shadow with no/low transparency
 *   6. Placeholder text left in: lorem ipsum / "Placeholder" shipped as content
 *   7. Flat spacing            : one padding value everywhere (no spatial
 *                                hierarchy: outer should exceed inner)
 *   8. Near-duplicate neutrals : two greys ~1 step apart (theme inconsistency)
 *
 * Heuristic: a strong signal, not proof. Pair with human visual review.
 *
 * Usage: node scripts/slop_tells.mjs <file.html...> [--dark] [--strict]
 *   --strict -> exit 1 on any HIGH finding (use as a gate). Default: report, exit 0.
 */
import { resolve } from 'node:path';
let chromium;
try { ({ chromium } = await import('playwright')); }
catch { console.log('slop_tells: playwright not installed — SKIPPED'); process.exit(0); }

const argv = process.argv.slice(2);
const strict = argv.includes('--strict');
const dark = argv.includes('--dark');
const files = argv.filter(a => !a.startsWith('--'));
if (!files.length) { console.log('usage: node scripts/slop_tells.mjs <file.html...> [--dark] [--strict]'); process.exit(0); }

const browser = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch());
let high = 0;

for (const f of files) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  await page.goto('file://' + resolve(f), { waitUntil: 'networkidle' }).catch(() => {});
  await page.addStyleTag({ content: '*{transition:none!important;animation:none!important}' });
  if (dark) await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  await page.waitForTimeout(300);

  const data = await page.evaluate(() => {
    const vis = el => {
      const r = el.getBoundingClientRect(); const s = getComputedStyle(el);
      return r.width > 1 && r.height > 1 && s.visibility !== 'hidden' && +s.opacity !== 0;
    };
    const box = el => { const r = el.getBoundingClientRect(); return r.width > 40 && r.height > 20; };
    const rgb = c => { const m = (c || '').match(/-?\d+\.?\d*/g); return m ? m.slice(0, 4).map(Number) : null; };
    const hue = (r, g, b) => {
      r /= 255; g /= 255; b /= 255;
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
      if (d < 0.04) return -1; // neutral, no meaningful hue
      let h;
      if (mx === r) h = ((g - b) / d) % 6;
      else if (mx === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60; if (h < 0) h += 360;
      return Math.round(h);
    };

    // 1. radius monotony — among card/button/input-sized rounded boxes
    const radii = {}; let roundedBoxes = 0;
    // 7. padding distribution
    const pads = {}; let padBoxes = 0;
    // 2/5. shadows
    const shadows = {}; let genericShadow = 0, blackShadow = 0;
    // 4. pure black text
    let blackText = 0;
    // 8. near-duplicate neutrals
    const neutrals = new Set();

    for (const el of document.querySelectorAll('body *')) {
      if (['SCRIPT', 'STYLE'].includes(el.tagName) || !vis(el)) continue;
      const s = getComputedStyle(el);

      if (box(el)) {
        const rad = Math.round(parseFloat(s.borderTopLeftRadius) || 0);
        if (rad > 0.5) { radii[rad] = (radii[rad] || 0) + 1; roundedBoxes++; }
        const p = Math.round(parseFloat(s.paddingTop) || 0);
        if (p > 0) { pads[p] = (pads[p] || 0) + 1; padBoxes++; }
      }

      const bs = s.boxShadow;
      if (bs && bs !== 'none') {
        shadows[bs] = (shadows[bs] || 0) + 1;
        // generic default stack: small offsets + 10%-black
        if (/rgba\(0,\s*0,\s*0,\s*0\.1\d?\)/.test(bs) && /(^|\s)0px\s+1px\s+(2|3)px/.test(bs)) genericShadow++;
        // opaque / heavy black shadow
        const sc = bs.match(/rgba?\([^)]*\)/);
        if (sc) { const a = rgb(sc[0]); if (a && a[0] === 0 && a[1] === 0 && a[2] === 0 && (a[3] === undefined || a[3] >= 0.4)) blackShadow++; }
      }

      // pure black text on an element that directly renders text
      const directText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1);
      if (directText && s.color === 'rgb(0, 0, 0)') blackText++;

      const bg = rgb(s.backgroundColor);
      if (bg && (bg[3] === undefined || bg[3] > 0.9)) {
        const [r, g, b] = bg;
        if (Math.max(r, g, b) - Math.min(r, g, b) < 16) neutrals.add(`${r},${g},${b}`);
      }
    }

    // 3. default AI gradient — scan AUTHORED css (inline + stylesheets), flag only
    // HARDCODED indigo/violet -> blue. Token gradients (var(--…)) are intentional
    // and themeable; hardcoded hex/rgb is the generated-UI tell.
    const hexRgb = h => {
      h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join('');
      const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    };
    const decls = [];
    document.querySelectorAll('[style*="gradient"]').forEach(el => decls.push(el.getAttribute('style') || ''));
    for (const sheet of document.styleSheets) {
      let rs; try { rs = sheet.cssRules; } catch { continue; }
      for (const r of rs) if (r.cssText && r.cssText.includes('linear-gradient')) decls.push(r.cssText);
    }
    let aiGradient = null;
    for (const d of decls) {
      const grads = d.match(/linear-gradient\((?:[^()]|\([^()]*\))*\)/gi) || [];
      for (const g of grads) {
        if (/var\(/.test(g)) continue; // token-driven -> intentional, skip
        const cols = [];
        (g.match(/#[0-9a-f]{3,6}\b/gi) || []).forEach(h => cols.push(hexRgb(h)));
        (g.match(/rgba?\([^)]*\)/gi) || []).forEach(c => { const a = rgb(c); if (a) cols.push(a); });
        const hues = cols.map(([r, gg, b]) => hue(r, gg, b)).filter(h => h >= 0);
        if (hues.some(h => h >= 235 && h <= 290) && hues.some(h => h >= 200 && h <= 250)) {
          const angle = (g.match(/(\d+)deg/) || [])[1];
          aiGradient = { angle: angle ? +angle : null }; break;
        }
      }
      if (aiGradient) break;
    }

    return {
      radii, roundedBoxes, pads, padBoxes,
      shadows: Object.keys(shadows).length, genericShadow, blackShadow,
      aiGradient, blackText, neutrals: [...neutrals],
      lorem: /lorem ipsum|\bplaceholder text\b/i.test(document.body.innerText || ''),
    };
  });
  await page.close();

  const findings = [];

  // 1. radius monotony
  const radiusVals = Object.keys(data.radii).map(Number);
  if (data.roundedBoxes >= 10 && radiusVals.length === 1)
    findings.push(['HIGH', `Single border-radius (${radiusVals[0]}px) on all ${data.roundedBoxes} rounded boxes — vary radius by component size (card > button > input/tag).`]);

  // 2. flat elevation
  if (data.genericShadow >= 1)
    findings.push(['MED', `Generic default shadow stack (0 1px 3px rgba(0,0,0,.1)) x${data.genericShadow} — the boilerplate AI shadow. Use the token elevation scale.`]);
  else if (data.shadows === 1)
    findings.push(['MED', `Only one distinct shadow across the page — no elevation hierarchy. Resting vs hover vs overlay should differ.`]);

  // 5. opaque black shadow
  if (data.blackShadow >= 1)
    findings.push(['LOW', `${data.blackShadow} opaque/heavy black shadow(s) — premium shadows are soft and slightly tinted, never solid #000.`]);

  // 3. default AI gradient (hardcoded only)
  if (data.aiGradient)
    findings.push(['HIGH', `Hardcoded indigo/violet -> blue gradient${data.aiGradient.angle ? ` (${data.aiGradient.angle}deg)` : ''} — the single most common generated-UI tell. Tokenize it (gradients.json) or use a flat surface.`]);

  // 4. pure black text
  if (data.blackText >= 1)
    findings.push(['MED', `${data.blackText} element(s) use pure #000 text — switch to a tinted near-black (e.g. text.primary token) for less eye strain.`]);

  // 6. placeholder text
  if (data.lorem)
    findings.push(['MED', `Placeholder/lorem-ipsum text shipped as content — replace with real copy; prototypes break on real strings.`]);

  // 7. flat spacing
  const padVals = Object.keys(data.pads).map(Number);
  if (data.padBoxes >= 10 && padVals.length === 1)
    findings.push(['LOW', `One padding value (${padVals[0]}px) everywhere — no spatial hierarchy. Outer/container padding should exceed inner element padding.`]);

  // 8. near-duplicate neutrals
  const ns = data.neutrals.map(s => s.split(',').map(Number));
  let dupPair = null;
  for (let i = 0; i < ns.length && !dupPair; i++)
    for (let j = i + 1; j < ns.length; j++) {
      const d = Math.abs(ns[i][0] - ns[j][0]) + Math.abs(ns[i][1] - ns[j][1]) + Math.abs(ns[i][2] - ns[j][2]);
      if (d > 0 && d <= 9) { dupPair = [ns[i], ns[j]]; break; }
    }
  if (dupPair)
    findings.push(['LOW', `Near-duplicate neutrals rgb(${dupPair[0].join(',')}) vs rgb(${dupPair[1].join(',')}) — collapse to one token; ~1-step greys read as inconsistency.`]);

  const mode = dark ? ' [dark]' : '';
  if (!findings.length) console.log(`OK   ${f}${mode} — no measurable slop tells`);
  else {
    console.log(`\n${f}${mode}:`);
    for (const [sev, msg] of findings) { console.log(`  ${sev}  ${msg}`); if (sev === 'HIGH') high++; }
  }
}
await browser.close();
if (strict && high) { console.log(`\n${high} HIGH slop tell(s).`); process.exit(1); }
console.log('\n(slop tells are heuristic — a strong signal, not proof. Pair with human visual review.)');
process.exit(0);
