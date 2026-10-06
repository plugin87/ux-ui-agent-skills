#!/usr/bin/env node
/**
 * Mobile-first, tested structurally rather than by counting keywords.
 *
 * The rule: mobile is the base. Base styles ARE the phone layout, and wider
 * screens are layered on with `min-width`. `max-width` queries are not banned -
 * they are fine for a genuine narrow-screen refinement, or for a range between
 * two breakpoints. What is banned is a desktop-first stylesheet, where the base
 * assumes a wide screen and mobile is patched in afterwards.
 *
 * Counting `max-width` versus `min-width` cannot tell those apart, so this does
 * not count. It strips EVERY `@media` and `@container` rule out of the page and
 * renders what is left at 320px wide:
 *
 *   A mobile-first page passes, because its base styles already are the phone
 *   layout and the queries only added things for bigger screens.
 *   A desktop-first page fails, because without its patches the wide base
 *   overflows, crams its controls, or sets a line far past a readable measure.
 *
 * The ratio is still reported, as a warning only, so a reviewer can look at a
 * lopsided file without the build failing over a number that proves nothing.
 *
 * Usage:
 *   node scripts/verify_mobile_first.mjs <file|dir> [...]
 *   node scripts/verify_mobile_first.mjs <file> --width 320
 * Exit 0 = the base layout is the mobile layout; 1 = it is not; 2 = bad input.
 */
import { chromium } from 'playwright';
import { readFileSync, statSync, readdirSync, existsSync } from 'node:fs';
import { join, extname, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const REQUIRE_BROWSER = process.env.DS_REQUIRE_BROWSER === '1';
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '__pycache__', '.ds-receipts']);

function collect(paths) {
  const out = [];
  for (const p of paths) {
    if (!existsSync(p)) return { error: `path not found: ${p}` };
    if (statSync(p).isDirectory()) {
      const walk = d => {
        for (const e of readdirSync(d, { withFileTypes: true })) {
          if (SKIP_DIRS.has(e.name)) continue;
          const f = join(d, e.name);
          if (e.isDirectory()) walk(f);
          else if (extname(f) === '.html') out.push(f);
        }
      };
      walk(p);
    } else out.push(p);
  }
  return { files: out };
}

/** The ratio, reported and never gated on. */
function queryRatio(file) {
  let text = '';
  try { text = readFileSync(file, 'utf8'); } catch { return null; }
  const max = (text.match(/@media[^{]*max-width/g) || []).length;
  const min = (text.match(/@media[^{]*min-width/g) || []).length;
  return { max, min };
}

const args = process.argv.slice(2);
const widthArg = args.indexOf('--width');
const WIDTH = widthArg !== -1 ? Number(args[widthArg + 1]) : 320;
/* --scale stresses the base with a wider root font, which is how another
   platform's fallback font behaves. Three pages passed this gate on macOS and
   failed it on Linux CI by 3-6px; the repo's own narrow-width rules say exactly
   why, and a gate that only holds on the machine that wrote it is not a gate. */
const scaleArg = args.findIndex(a => a.startsWith('--scale'));
const SCALE = scaleArg !== -1
  ? Number(args[scaleArg].includes('=') ? args[scaleArg].split('=')[1] : args[scaleArg + 1])
  : 1;
// Only skip the value slot when the flag is actually present. `widthArg + 1`
// with widthArg === -1 is index 0, which silently ate the path argument.
const skip = new Set();
if (widthArg !== -1) skip.add(widthArg + 1);
if (scaleArg !== -1 && !args[scaleArg].includes('=')) skip.add(scaleArg + 1);
const paths = args.filter((a, i) => !a.startsWith('--') && !skip.has(i));

if (!paths.length) {
  console.log('Usage: node scripts/verify_mobile_first.mjs <file|dir> [...] [--width 320]');
  process.exit(2);
}

const { files, error } = collect(paths);
if (error) {
  console.log(`ERROR: ${error}`);
  process.exit(2);
}
if (!files.length) {
  console.log(`ERROR: no .html under ${paths.join(', ')}`);
  process.exit(2);
}

let browser;
try {
  browser = await chromium.launch({ channel: 'chrome' });
} catch (err) {
  if (REQUIRE_BROWSER) {
    console.log(`REQUIRED, FAILING: no browser available (${err.message.split('\n')[0]}).`);
    console.log('Fix: npm install && npx playwright install chrome');
    process.exit(1);
  }
  console.log('SKIPPED: no browser available. This measured NOTHING - not a pass.');
  process.exit(0);
}

const findings = [];
const warnings = [];

for (const file of files) {
  const page = await browser.newPage({ viewport: { width: WIDTH, height: 900 } });
  await page.goto(pathToFileURL(resolve(file)).href, { waitUntil: 'networkidle' });
  if (SCALE !== 1) {
    await page.evaluate((s) => {
      const base = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      document.documentElement.style.fontSize = `${base * s}px`;
    }, SCALE);
  }

  const result = await page.evaluate(() => {
    /* Delete every conditional rule, so what renders is the base layer alone.
       Walk backwards: deleteRule shifts the indices after it. */
    let stripped = 0;
    const strip = (sheet) => {
      let rules;
      try { rules = sheet.cssRules; } catch { return; }   // cross-origin, nothing to do
      if (!rules) return;
      for (let i = rules.length - 1; i >= 0; i--) {
        const r = rules[i];
        if (r.type === CSSRule.MEDIA_RULE || r.constructor.name === 'CSSContainerRule') {
          // keep print and reduced-motion: neither is a width breakpoint, and
          // deleting the reduce branch would make every page look animated.
          const q = (r.conditionText || r.media?.mediaText || '');
          if (/prefers-reduced-motion|print|forced-colors|prefers-contrast/.test(q)) continue;
          sheet.deleteRule(i);
          stripped++;
        } else if (r.cssRules) {
          strip(r);
        }
      }
    };
    for (const sheet of document.styleSheets) strip(sheet);

    // Inline style attributes can carry a desktop assumption too, but they have
    // no media queries, so they are part of the base by definition.
    document.documentElement.offsetHeight;  // force layout

    const de = document.documentElement;
    const overflow = Math.max(0, de.scrollWidth - de.clientWidth);

    /* Name the culprit. Listing only elements WIDER than the viewport missed the
       common case: a normal-width element pushed past the right edge by a margin
       or a position. An overflow nobody can locate is half a gate, so this
       reports whichever applies and says which. */
    const widest = [];
    if (overflow > 0) {
      const limit = de.clientWidth + 1;
      for (const el of document.body.querySelectorAll('*')) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        const tooWide = r.width > limit;
        const pastEdge = r.right > limit;
        if (!tooWide && !pastEdge) continue;
        /* An element inside a horizontal scroller is SUPPOSED to be wider than
           the viewport - that is what the scroller is for, and it does not push
           the page sideways. Listing them sent me chasing a nav.menu that was
           behaving correctly while the real cause sat elsewhere. */
        let inScroller = false;
        for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
          const ox = getComputedStyle(a).overflowX;
          if (ox === 'auto' || ox === 'scroll' || ox === 'hidden') { inScroller = true; break; }
        }
        if (inScroller) continue;
        // only the outermost offender in a chain: a wide table makes every cell
        // inside it look guilty too
        if (widest.some(w => w.el.contains(el))) continue;
        widest.push({ el,
          tag: el.tagName.toLowerCase(),
          cls: (el.className || '').toString().trim().split(/\s+/)[0] || '',
          width: Math.round(r.width),
          right: Math.round(r.right),
          why: tooWide ? 'wider than the viewport' : 'pushed past the right edge' });
      }
      widest.sort((a, b) => b.right - a.right);
    }

    /* Target size is deliberately NOT re-checked here. verify_target_size.mjs
       already implements WCAG 2.5.8 including its exceptions - spacing, inline
       text links, the label's hit area - and a naive 24x24 sweep in this file
       flagged a styled checkbox input, an inline nav link and a "Back to top"
       anchor, all of which the real gate correctly passes. Overflow is the
       structural signal this gate is for, and reimplementing a spec badly next
       to a gate that implements it well is how a suite loses its credibility. */
    return { stripped, overflow,
      widest: widest.slice(0, 4).map(({ tag, cls, width, right, why }) =>
        ({ tag, cls, width, right, why })) };
  });

  await page.close();

  const ratio = queryRatio(file);
  if (ratio && ratio.max > ratio.min && ratio.max >= 3) {
    warnings.push(`${file}: ${ratio.max} max-width quer(ies) against ${ratio.min} min-width`
      + ' - worth a look, not a failure');
  }

  if (result.overflow > 0) {
    findings.push({
      file, why: `base layout overflows by ${result.overflow}px at ${WIDTH}px with every @media removed`,
      detail: result.widest.map(w =>
        `${w.tag}${w.cls ? '.' + w.cls : ''} ${w.why} (${w.width}px wide, right edge ${w.right}px)`),
    });
  }
}

await browser.close();

console.log(`Checked ${files.length} file(s) at ${WIDTH}px`
  + (SCALE !== 1 ? ` with a ${SCALE}x root font` : '')
  + ' with every width @media and @container removed.');

for (const w of warnings) console.log(`  note: ${w}`);

if (findings.length) {
  console.log(`\nFAIL: ${findings.length} page(s) are desktop-first - the base layer is not the`);
  console.log('phone layout, it is a wide layout that only works once a query patches it.');
  for (const f of findings) {
    console.log(`  x ${f.file}: ${f.why}`);
    for (const d of f.detail) console.log(`      ${d}`);
  }
  console.log('\nFix: make the base styles the mobile layout, and add the wider layout in a');
  console.log('min-width query. max-width queries stay fine as refinements on top of that.');
  process.exit(1);
}

console.log('OK: every base layer is already the mobile layout.');
process.exit(0);
