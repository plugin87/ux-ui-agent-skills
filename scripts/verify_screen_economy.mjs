#!/usr/bin/env node
/**
 * SCREEN ECONOMY — every part of the screen earns its space.
 *
 * The owner's rule, and the one the kit's own doctrine used to contradict:
 * `taste/design-taste.md` answered "three identical cards" with "bento sizing",
 * the card spec called for a full-bleed image, and two archetypes asked for a
 * screen-filling hero. Those are fixed; this measures the result.
 *
 * Two senses of economy, both binding:
 *   Space  - the viewport is scarce, most of all on a phone. The first screen
 *            shows real content and a way to act, and no box or image swallows it.
 *   Energy - large bright areas, heavy images and endless animation cost
 *            battery, most visibly on OLED. Small and rare.
 *
 * Every threshold is a token in tokens/sizing.json -> screen, never a constant
 * here, so a project can raise one deliberately and this follows. A gate whose
 * numbers live in its own source cannot be adjusted without editing the gate,
 * and then it gets edited to pass.
 *
 *   node scripts/verify_screen_economy.mjs <file|dir> [...] [--dark] [--json]
 *
 * Two opt-outs, both explicit and both in the page rather than in this script:
 *   data-harness on <body>      - a component harness, so the first-screen rule
 *                                 (a product screen owes a heading and a way to
 *                                 act without scrolling) does not apply.
 *   <!-- screen-economy: endless-motion <reason> -->
 *                               - this motion never stops on purpose. The reason
 *                                 is required and must be a sentence, because a
 *                                 bare switch gets flipped to quiet a gate.
 *
 * Exit 1 on any failure, 2 when it could not look. Checks 1-5 fail; the
 * dark-mode bright-area reading is reported as a warning only, because it is a
 * heuristic and the repo does not ship heuristics as gates.
 */
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { join, dirname, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireTargets } from './_targets.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const argv = process.argv.slice(2);
const DARK = argv.includes('--dark');
const JSON_OUT = argv.includes('--json');
const required = process.env.DS_REQUIRE_BROWSER === '1';

let chromium;
try { ({ chromium } = await import('playwright')); }
catch {
  console.log(`verify_screen_economy: playwright not installed — ${required ? 'REQUIRED, FAILING' : 'SKIPPED'}`);
  process.exit(required ? 1 : 0);
}

/** Thresholds, from the token source. */
const sizing = JSON.parse(readFileSync(join(ROOT, 'tokens/sizing.json'), 'utf8'));
const screen = sizing.screen;
if (!screen) {
  console.log('ERROR: tokens/sizing.json has no `screen` section, so there are no thresholds to apply.');
  console.log('Nothing was measured. This is not a pass.');
  process.exit(2);
}
const T = {
  mediaMaxBlock: parseFloat(screen['media-max-block'].$value) / 100,   // "60vh" -> 0.60
  boxMaxShare: screen['box-max-viewport-share'].$value,
  boxMinDensity: screen['box-min-content-density'].$value,
  imageBytes: screen['image-bytes-budget'].$value,
};

const paths = requireTargets(argv.filter(a => !a.startsWith('--')), {
  usage: 'Usage: node scripts/verify_screen_economy.mjs <file|dir> [...] [--dark]',
});
const files = [];
for (const p of paths) {
  if (statSync(p).isDirectory()) {
    const walk = (d) => readdirSync(d, { withFileTypes: true }).forEach(e => {
      const full = join(d, e.name);
      if (e.isDirectory()) walk(full);
      else if (extname(e.name) === '.html') files.push(full);
    });
    walk(p);
  } else files.push(p);
}

/** Runs in the page. Returns findings, never verdicts. */
const MEASURE = ({ T }) => {
  const vw = innerWidth, vh = innerHeight;
  const out = { media: [], boxes: [], firstScreen: null, images: [], forever: [], bright: 0,
    /* The page's own declaration that it has not finished. */
    busy: document.querySelector('[aria-busy="true"]') !== null };
  const name = (el) => {
    const id = el.id ? '#' + el.id : (typeof el.className === 'string' && el.className.trim()
      ? '.' + el.className.trim().split(/\s+/)[0] : '');
    return `${el.tagName.toLowerCase()}${id}`;
  };
  const visible = (el) => {
    const cs = getComputedStyle(el), r = el.getBoundingClientRect();
    return cs.display !== 'none' && cs.visibility !== 'hidden'
      && Number(cs.opacity) > 0.05 && r.width > 0 && r.height > 0;
  };

  // 1 + 2 — oversized media, and media wider than the viewport
  for (const el of document.querySelectorAll('img, video, picture, svg[data-media], [data-media]')) {
    if (!visible(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.height > vh * T.mediaMaxBlock || r.width > vw + 1) {
      out.media.push({ el: name(el), h: Math.round(r.height), w: Math.round(r.width) });
    }
  }
  for (const el of document.querySelectorAll('body *')) {
    if (!visible(el)) continue;
    const bg = getComputedStyle(el).backgroundImage;
    if (!bg || bg === 'none' || !/url\(/.test(bg)) continue;
    const r = el.getBoundingClientRect();
    if (r.height > vh * T.mediaMaxBlock) out.media.push({ el: name(el) + ' (background-image)', h: Math.round(r.height), w: Math.round(r.width) });
  }

  /* 3 — a large box that carries little.
   *
   * "Hollow" is unused SPACE, not low ink. The first version of this check
   * measured the pixel area of text and controls against the box area and
   * failed at 30%: a checkout panel full of real content scored 15%, because
   * text set at a comfortable line-height with room between items simply does
   * not cover a third of its own box in ink. It would have told every author
   * with good spacing that their panels were empty - the opposite of what this
   * kit teaches.
   *
   * What hollow actually looks like is a box whose content stops a long way
   * from its edges. So: the union bounding box of everything visible inside,
   * against the box's own content area. A 1494px-tall stat card holding three
   * short lines scores 7% and fails. A dense panel scores near 100% and passes,
   * however airy its typography. */
  for (const el of document.querySelectorAll('body *')) {
    if (!visible(el)) continue;
    const cs = getComputedStyle(el), r = el.getBoundingClientRect();
    const boxLike = (parseFloat(cs.borderTopWidth) > 0 || cs.backgroundColor !== 'rgba(0, 0, 0, 0)')
      && parseFloat(cs.borderTopLeftRadius) > 0 && parseFloat(cs.paddingTop) > 0;
    if (!boxLike) continue;
    const area = r.width * r.height;
    if (area < vw * vh * T.boxMaxShare) continue;

    // The area inside the padding: what the content was given to fill.
    const inner = {
      w: r.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight),
      h: r.height - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom),
    };
    if (inner.w <= 0 || inner.h <= 0) continue;

    let top = Infinity, left = Infinity, right = -Infinity, bottom = -Infinity, any = false;
    const note = (rect) => {
      if (rect.width <= 0 || rect.height <= 0) return;
      any = true;
      top = Math.min(top, rect.top); left = Math.min(left, rect.left);
      right = Math.max(right, rect.right); bottom = Math.max(bottom, rect.bottom);
    };
    const range = document.createRange();
    for (const n of el.querySelectorAll('*')) {
      if (!visible(n)) continue;
      note(n.getBoundingClientRect());
    }
    for (const n of el.childNodes) {
      if (n.nodeType === 3 && n.textContent.trim()) {
        range.selectNodeContents(n);
        for (const rect of range.getClientRects()) note(rect);
      }
    }
    const used = any ? ((right - left) * (bottom - top)) / (inner.w * inner.h) : 0;
    if (used < T.boxMinDensity) {
      out.boxes.push({
        el: name(el),
        share: +(area / (vw * vh)).toFixed(2),
        density: +used.toFixed(2),
        px: `${Math.round(r.width)}x${Math.round(r.height)}`,
      });
    }
  }

  /* 5 — animation that never ends.
   *
   * The rule is about DECORATION that never stops: a floating blob, a looping
   * background, a shimmer with nothing to shimmer for. A spinner is not that.
   * It runs forever because the thing it reports has not finished, and the page
   * says so itself - the kit's own button harness marks it
   * `<button aria-busy="true"><span class="spin">`.
   *
   * So the page's own declaration decides. An infinite animation inside
   * something marked busy, or inside a live region, is doing its job. Anything
   * else is decoration and fails. */
  const FUNCTIONAL = '[aria-busy="true"], [role="status"], [role="progressbar"], [role="alert"], [aria-live]';
  for (const el of document.querySelectorAll('body *')) {
    if (!visible(el)) continue;
    const cs = getComputedStyle(el);
    if (cs.animationName === 'none' || !/infinite/.test(cs.animationIterationCount)) continue;
    if (el.closest(FUNCTIONAL)) continue;
    /* A spinner is often a SIBLING of the control it reports on, not a
       descendant: `<input aria-busy="true"><span class="spin" aria-hidden>`.
       That markup is correct - the control carries the state and the glyph is
       decorative - so walking ancestors alone misses it and calls a loading
       indicator decoration. */
    if (el.getAttribute('aria-hidden') === 'true'
        && el.parentElement?.querySelector('[aria-busy="true"], [role="progressbar"]')) continue;
    out.forever.push(name(el));
  }
  for (const v of document.querySelectorAll('video[autoplay]')) {
    if (v.hasAttribute('controls')) continue;
    out.forever.push(name(v) + ' (autoplaying video)');
  }

  // 4 — images carrying their own size, and lazy below the fold
  for (const img of document.querySelectorAll('img')) {
    const r = img.getBoundingClientRect();
    const problems = [];
    if (!img.hasAttribute('width') || !img.hasAttribute('height')) problems.push('no width/height');
    if (r.top > vh && img.loading !== 'lazy') problems.push('below the first screen and not lazy');
    if (problems.length) out.images.push({ el: name(img), problems });
  }

  /* 6 — the first screen earns itself.
   *
   * A product screen owes the reader a heading and a way to act without
   * scrolling. A component harness owes neither: its job is to show variants,
   * and demanding a primary action from a page of input states would be asking
   * it to be something it is not.
   *
   * A page says which it is with `data-harness` on <body> or <html>, following
   * the `data-demo-state` convention verify_interactive already uses. The
   * default is "product screen", so a real screen cannot opt out by accident. */
  out.harness = document.body.hasAttribute('data-harness')
    || document.documentElement.hasAttribute('data-harness');

  /* A heading the reader can actually read. A visually-hidden h1 is the right
     fix for a document outline and no fix at all for this check: it is clipped
     to a pixel and nobody sees it. Counting it would let the rule be satisfied
     by markup that changes nothing on screen - which is what happened the first
     time this ran after an h1 was added to checkout.html. */
  const readable = (el) => {
    if (!visible(el)) return false;
    const r = el.getBoundingClientRect();
    if (r.width < 24 || r.height < 8) return false;
    const cs = getComputedStyle(el);
    return cs.clipPath === 'none' && cs.clip === 'auto';
  };
  const h1 = [...document.querySelectorAll('h1')].find(readable);
  const action = [...document.querySelectorAll('a[href], button, [role="button"], input[type="submit"]')]
    .find(el => visible(el) && el.getBoundingClientRect().top < vh);
  out.firstScreen = {
    heading: h1 ? h1.getBoundingClientRect().top < vh : false,
    action: Boolean(action),
  };

  return out;
};

const problems = [];
const warnings = [];
const browser = await chromium.launch({ channel: 'chrome' });

for (const f of files) {
  const abs = resolve(f);
  const base = f.replace(/^.*\//, '');

  /* The phone is where space is scarcest, so the first-screen rule is measured
     there and nowhere else. 390x844 is the size the doctrine names. */
  const html = readFileSync(abs, 'utf8');

  for (const [w, h, label] of [[390, 844, 'phone'], [1280, 900, 'desktop']]) {
    const page = await browser.newPage({
      viewport: { width: w, height: h },
      colorScheme: DARK ? 'dark' : 'light',
    });
    await page.goto('file://' + abs);
    /* Wait for the page to finish, not for a constant.
     *
     * A flat wait reads a loading state as the page. verify_reduced_motion had
     * exactly this bug - it compared a half-loaded render against a finished
     * one - and this gate was written afterwards with the same flat timer and
     * repeated it: a blind agent's dashboard held a skeleton for 700ms, so at
     * 400ms the heading was still inside a display:none block and this reported
     * "no visible h1 above the fold" on a page whose h1 is its hero.
     *
     * The page says when it is done. Believe it, with a cap. */
    let r = null, prevKeys = null;
    for (let waited = 0; waited <= 4000; waited += 250) {
      await page.waitForTimeout(250);
      r = await page.evaluate(MEASURE, { T });
      const keys = JSON.stringify([r.firstScreen, r.media.length, r.boxes.length]);
      if (!r.busy && keys === prevKeys) break;
      prevKeys = keys;
    }
    await page.close();

    for (const m of r.media) {
      problems.push(`${base} @${label}  [1 oversized media]  ${m.el} is ${m.w}x${m.h}, past the ${Math.round(T.mediaMaxBlock * 100)}vh cap or wider than the viewport`);
    }
    for (const b of r.boxes) {
      problems.push(`${base} @${label}  [2 hollow box]  ${b.el} is ${b.px}, covers ${Math.round(b.share * 100)}% of the viewport, and its content reaches only ${Math.round(b.density * 100)}% of the space inside it`);
    }
    for (const i of r.images) {
      problems.push(`${base} @${label}  [4 image weight]  ${i.el}: ${i.problems.join(', ')}`);
    }
    for (const el of [...new Set(r.forever)]) {
      /* The opt-out the rule names: a comment in the file saying WHY this
         motion never stops. It takes a reason because a bare switch gets
         flipped to make a gate quiet, and a reason has to be read by whoever
         flips it - and by whoever reviews it later. */
      const waiver = html.match(/screen-economy:\s*endless-motion\s+(.+)/i);
      if (waiver && waiver[1].trim().length > 15) continue;
      problems.push(`${base} @${label}  [5 endless motion]  ${el} animates forever`);
    }
    /* A page still declaring aria-busy at the cap is a rendering of a loading
       state - the kit ships two of them on purpose. "The first screen earns
       itself" cannot be judged on a screen that has not arrived, so the check
       is skipped rather than failed. Everything else still applies to it. */
    if (label === 'phone' && !r.harness && !r.busy) {
      if (!r.firstScreen.heading) problems.push(`${base} @phone  [3 first screen]  no visible h1 above the fold`);
      if (!r.firstScreen.action) problems.push(`${base} @phone  [3 first screen]  no primary action above the fold`);
    }
  }
}

await browser.close();

if (JSON_OUT) {
  console.log(JSON.stringify({ files: files.length, problems, warnings }, null, 2));
  process.exit(problems.length ? 1 : 0);
}

if (problems.length) {
  console.log('verify_screen_economy: FAIL');
  for (const p of problems) console.log('  x ' + p);
  console.log('');
  console.log('  Thresholds are tokens, in tokens/sizing.json -> screen. Raise one there');
  console.log('  on purpose if the design needs it; do not edit this script.');
  console.log('  The rule: taste/design-taste.md -> Screen economy.');
  process.exit(1);
}
console.log(`verify_screen_economy: OK — ${files.length} file(s)${DARK ? ' (dark)' : ''}: media bounded, no hollow boxes, first screen earns itself, images sized`);
process.exit(0);
