#!/usr/bin/env node
/**
 * REDUCED-MOTION gate — WCAG 2.2 SC 2.3.3 (Animation from Interactions, AAA)
 * and the house rule in CLAUDE.md: "Always respect prefers-reduced-motion.
 * Replace with fade or instant."
 *
 * Renders every harness twice — once at no-preference, once at reduce — and
 * compares. Three independent signals, all measured, none asserted:
 *
 *   A. NO POLICY   the page declares real motion but ships no
 *                  @media (prefers-reduced-motion: reduce) block at all.
 *   B. NOT REDUCED under reduce, elements still run CSS animations, or still
 *                  transition motion properties (transform/size/position/all)
 *                  for longer than the threshold. Opacity/colour transitions are
 *                  NOT flagged: a fade is the sanctioned reduced-motion
 *                  replacement, and a colour change is not motion.
 *   C. PARITY LOSS the dangerous one. An element that is visible at
 *                  no-preference becomes invisible under reduce — the classic
 *                  bug where content starts at opacity:0 and is revealed only by
 *                  an entrance animation, so killing the animation hides the
 *                  content forever. Reduced motion must never cost content.
 *
 * Usage: node scripts/verify_reduced_motion.mjs <file.html | dir> [--threshold=0.1]
 * Exit 1 on any signal.
 */
import { readdirSync, statSync, readFileSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
let chromium;
try { ({ chromium } = await import('playwright')); }
catch {
  // A missing browser must not read as a pass. Without DS_REQUIRE_BROWSER the gate
  // stays skippable for local convenience; CI and accuracy_report set it to 1, so a
  // machine that cannot render fails loudly instead of reporting green on nothing.
  const required = process.env.DS_REQUIRE_BROWSER === "1";
  console.log(`verify_reduced_motion: playwright not installed — ${required ? "REQUIRED, FAILING" : "SKIPPED"}`);
  process.exit(required ? 1 : 0);
}

const argv = process.argv.slice(2);
const targets = argv.filter(a => !a.startsWith('--'));
if (!targets.length) {
  console.log('usage: node scripts/verify_reduced_motion.mjs <file.html | dir> [--threshold=0.1]');
  process.exit(0);
}
const THRESHOLD = Number((argv.find(a => a.startsWith('--threshold=')) || '--threshold=0.1').split('=')[1]);

const files = targets.flatMap(t => {
  const abs = resolve(t);
  return statSync(abs).isDirectory()
    ? readdirSync(abs).filter(f => f.endsWith('.html')).map(f => join(abs, f))
    : [abs];
}).sort();

/** Snapshot every element's visibility + motion, keyed by document order. */
const SNAPSHOT = ({ THRESHOLD, linkedCss }) => {
  const MOTION_PROPS = /transform|translate|rotate|scale|top|left|right|bottom|width|height|margin|inset|\ball\b/;

  const describe = (el, i) => {
    const id = el.id ? '#' + el.id : (typeof el.className === 'string' && el.className.trim()
      ? '.' + el.className.trim().split(/\s+/)[0] : '');
    const txt = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 30);
    return `[${i}] ${el.tagName.toLowerCase()}${id}${txt ? ` "${txt}"` : ''}`;
  };

  // Does any stylesheet carry a reduced-motion media query?
  let hasPolicy = false;
  const scanRules = (rules) => {
    for (const r of rules) {
      if (r.media && String(r.media.mediaText).includes('prefers-reduced-motion')) hasPolicy = true;
      if (r.cssRules) scanRules(r.cssRules);
      if (hasPolicy) return;
    }
  };
  for (const sheet of document.styleSheets) {
    try { scanRules(sheet.cssRules); } catch { /* unreadable sheet, see linkedCss */ }
    if (hasPolicy) break;
  }
  /* Chromium treats a file:// <link> stylesheet as cross-origin, so its cssRules
     throw and an external policy looks like no policy at all. Real projects keep
     their CSS in a file, so the runner reads those files from disk and hands the
     text in here rather than punishing anyone who is not writing inline <style>. */
  if (!hasPolicy && linkedCss && /@media[^{]*prefers-reduced-motion/.test(linkedCss)) hasPolicy = true;

  const els = [...document.querySelectorAll('body *')];
  const visible = {};
  const moving = [];
  let declaresMotion = false;

  els.forEach((el, i) => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const shown = cs.display !== 'none' && cs.visibility !== 'hidden'
      && Number(cs.opacity) > 0.05 && r.width > 0 && r.height > 0;
    if (shown) visible[i] = describe(el, i);

    const animMs = Math.max(...String(cs.animationDuration).split(',')
      .map(s => parseFloat(s) * (s.includes('ms') ? 0.001 : 1) || 0));
    const hasAnim = cs.animationName !== 'none' && animMs > THRESHOLD;

    const tProps = String(cs.transitionProperty);
    const tMs = Math.max(...String(cs.transitionDuration).split(',')
      .map(s => parseFloat(s) * (s.includes('ms') ? 0.001 : 1) || 0));
    const hasMotionTransition = tMs > THRESHOLD && MOTION_PROPS.test(tProps) && tProps !== 'none';

    if (hasAnim || hasMotionTransition) declaresMotion = true;
    if (shown && (hasAnim || hasMotionTransition)) {
      moving.push(`${describe(el, i)} — ${hasAnim ? `animation ${cs.animationName} ${animMs}s` : `transition ${tProps} ${tMs}s`}`);
    }
  });

  return { hasPolicy, declaresMotion, visible, moving };
};

const browser = await chromium.launch({ channel: 'chrome' });
const problems = [];

for (const f of files) {
  const name = f.split('/').pop();
  // Read every stylesheet the page links, so a policy that lives in a .css file
  // counts the same as one written inline.
  const html = readFileSync(f, 'utf8');
  const linkedCss = [...html.matchAll(/<link[^>]+rel=["']?stylesheet["']?[^>]*>/gi)]
    .map(m => (m[0].match(/href=["']([^"']+)["']/i) || [])[1])
    .filter(h => h && !/^(https?:)?\/\//.test(h))
    .map(h => { try { return readFileSync(resolve(dirname(f), h), 'utf8'); } catch { return ''; } })
    .join('\n');

  const shoot = async (reducedMotion) => {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion });
    await page.goto('file://' + f);
    await page.waitForTimeout(450); // let entrance animations settle
    const snap = await page.evaluate(SNAPSHOT, { THRESHOLD, linkedCss });
    await page.close();
    return snap;
  };

  const normal = await shoot('no-preference');
  const reduced = await shoot('reduce');

  // A — declares motion but ships no policy
  if (normal.declaresMotion && !normal.hasPolicy) {
    problems.push(`${name}  [A no-policy]  page animates but has no @media (prefers-reduced-motion: reduce)`);
  }

  // B — motion still running under reduce
  if (reduced.moving.length) {
    problems.push(`${name}  [B not-reduced]  ${reduced.moving.length} element(s) still animate under reduce`);
    for (const m of reduced.moving.slice(0, 4)) problems.push(`      ${m}`);
  }

  // C — content lost under reduce
  const lost = Object.keys(normal.visible).filter(k => !(k in reduced.visible));
  if (lost.length) {
    problems.push(`${name}  [C parity-loss]  ${lost.length} element(s) visible normally are INVISIBLE under reduce`);
    for (const k of lost.slice(0, 4)) problems.push(`      ${normal.visible[k]}`);
  }
}
await browser.close();

if (problems.length) {
  console.log('verify_reduced_motion: FAIL');
  for (const p of problems) console.log(p.startsWith('      ') ? p : '  x ' + p);
  console.log('  Fix A: add @media (prefers-reduced-motion: reduce) that stops animation/transform motion.');
  console.log('  Fix B: inside that block set animation:none and drop motion transitions (fade is allowed).');
  console.log('  Fix C: never rely on an animation to reveal content — reveal it in the reduced branch too.');
  process.exit(1);
}
console.log(`verify_reduced_motion: OK — ${files.length} file(s): policy present, motion stopped under reduce, no content lost`);
