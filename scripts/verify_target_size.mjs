#!/usr/bin/env node
/**
 * TARGET SIZE gate — WCAG 2.2 SC 2.5.8 Target Size (Minimum), Level AA.
 *
 * Every pointer target must be at least 24x24 CSS px, measured on the REAL
 * rendered page (not asserted from source). CLAUDE.md mandates this ("Target
 * size: >= 24x24px minimum, 44x44px recommended") but nothing enforced it.
 *
 * The three exceptions the success criterion actually allows are implemented,
 * so this gate does not fire on legitimate patterns:
 *
 *  - Spacing    an undersized target passes if the distance from its centre to
 *               every other target's centre is >= 24px (equivalently: 24px
 *               circles centred on each target do not intersect).
 *  - Inline     the target sits inline inside a run of text (a link in a
 *               sentence), where enlarging it would break the line box.
 *  - Effective  a control associated with a <label> is measured as the union of
 *    hit area  control + label, because the label is part of the hit target.
 *
 * Disabled controls are skipped: they are not operable, so they are not targets
 * (same exemption verify_states.mjs applies for contrast).
 *
 * Usage: node scripts/verify_target_size.mjs <file.html | dir> [--widths=414,1280]
 *                                            [--min=24] [--dark] [--advisory]
 * Exit 1 if any operable target is under the minimum with no exception.
 * --advisory reports findings but exits 0 — use it for the 44px AAA/recommended
 * sweep (SC 2.5.5), which is a goal rather than a merge blocker.
 */
import { readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
let chromium;
try { ({ chromium } = await import('playwright')); }
catch { console.log('verify_target_size: playwright not installed — SKIPPED'); process.exit(0); }

const argv = process.argv.slice(2);
const targets = argv.filter(a => !a.startsWith('--'));
if (!targets.length) {
  console.log('usage: node scripts/verify_target_size.mjs <file.html | dir> [--widths=414,1280] [--min=24] [--dark]');
  process.exit(0);
}
const arg = (name, dflt) => (argv.find(a => a.startsWith(`--${name}=`)) || `--${name}=${dflt}`).split('=')[1];
const widths = arg('widths', '414,1280').split(',').map(Number);
const MIN = Number(arg('min', 24));
const dark = argv.includes('--dark');
const advisory = argv.includes('--advisory');

const files = targets.flatMap(t => {
  const abs = resolve(t);
  return statSync(abs).isDirectory()
    ? readdirSync(abs).filter(f => f.endsWith('.html')).map(f => join(abs, f))
    : [abs];
}).sort();

// Runs in the page. Returns every undersized target that no exception covers.
const AUDIT = (MIN) => {
  const SEL = [
    'a[href]', 'button', 'input:not([type="hidden"])', 'select', 'textarea', 'summary',
    '[role="button"]', '[role="link"]', '[role="tab"]', '[role="checkbox"]', '[role="radio"]',
    '[role="switch"]', '[role="menuitem"]', '[role="menuitemcheckbox"]', '[role="menuitemradio"]',
    '[role="option"]', '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  const label = (el) => {
    const parts = [el.getAttribute('aria-label'), el.title, (el.textContent || '').trim()].filter(Boolean);
    const name = (parts[0] || '').replace(/\s+/g, ' ').slice(0, 40);
    const id = el.id ? '#' + el.id : (el.className && typeof el.className === 'string' && el.className.trim()
      ? '.' + el.className.trim().split(/\s+/)[0] : '');
    return `${el.tagName.toLowerCase()}${id}${name ? ` "${name}"` : ''}`;
  };

  // The clickable area of a control includes its associated <label>.
  const effectiveRect = (el) => {
    let r = el.getBoundingClientRect();
    let lab = el.closest('label');
    if (!lab && el.id) lab = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
    if (lab) {
      const lr = lab.getBoundingClientRect();
      if (lr.width > 0 && lr.height > 0) {
        const left = Math.min(r.left, lr.left), top = Math.min(r.top, lr.top);
        const right = Math.max(r.right, lr.right), bottom = Math.max(r.bottom, lr.bottom);
        r = { left, top, right, bottom, width: right - left, height: bottom - top };
      }
    }
    return r;
  };

  // SC 2.5.8 "Inline" exception: the target is in a sentence of text.
  const isInline = (el) => {
    const d = getComputedStyle(el).display;
    if (d !== 'inline' && d !== 'inline-block') return false;
    const p = el.parentElement;
    if (!p) return false;
    // Parent holds real text outside this element -> the target sits in a text run.
    const own = (el.textContent || '').trim();
    const around = (p.textContent || '').trim().replace(own, '').trim();
    return around.length > 0;
  };

  const all = [...document.querySelectorAll(SEL)].filter((el) => {
    if (el.disabled || el.getAttribute('aria-disabled') === 'true') return false;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) === 0) return false;
    if (cs.pointerEvents === 'none') return false;
    if (typeof el.checkVisibility === 'function' && !el.checkVisibility()) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  });

  const measured = all.map((el) => {
    const r = effectiveRect(el);
    return { el, r, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
  });

  const bad = [];
  for (const t of measured) {
    if (t.r.width >= MIN && t.r.height >= MIN) continue;
    if (isInline(t.el)) continue;
    // Spacing exception: no other target's centre within MIN px.
    const crowded = measured.some(o => o !== t && Math.hypot(o.cx - t.cx, o.cy - t.cy) < MIN);
    if (!crowded) continue;
    bad.push({
      name: label(t.el),
      w: Math.round(t.r.width * 10) / 10,
      h: Math.round(t.r.height * 10) / 10,
    });
  }
  return { total: measured.length, bad };
};

const browser = await chromium.launch({ channel: 'chrome' });
const fails = [];
let totalTargets = 0;

for (const w of widths) {
  const page = await browser.newPage({
    viewport: { width: w, height: 900 },
    colorScheme: dark ? 'dark' : 'light',
  });
  for (const f of files) {
    await page.goto('file://' + f);
    if (dark) await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    const { total, bad } = await page.evaluate(AUDIT, MIN);
    totalTargets += total;
    for (const b of bad) fails.push(`${f.split('/').pop()} @${w}px  ${b.name} is ${b.w}x${b.h} (min ${MIN}x${MIN})`);
  }
  await page.close();
}
await browser.close();

if (fails.length) {
  const uniq = [...new Set(fails)];
  const head = advisory ? 'ADVISORY' : 'FAIL';
  console.log(`verify_target_size: ${head} — target size under ${MIN}px${dark ? ' [dark]' : ''}`);
  for (const m of uniq.slice(0, 30)) console.log(`  ${advisory ? '!' : 'x'} ` + m);
  if (uniq.length > 30) console.log(`  ... and ${uniq.length - 30} more`);
  console.log(`  Fix: give the control >= ${MIN}x${MIN} CSS px, or space it >= ${MIN}px from its neighbours.`);
  process.exit(advisory ? 0 : 1);
}
console.log(`verify_target_size: OK — ${files.length} file(s), ${totalTargets} targets @${widths.join('/')}px, all >= ${MIN}x${MIN} or exception-covered${dark ? ' [dark]' : ''}`);
