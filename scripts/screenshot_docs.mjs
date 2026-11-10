#!/usr/bin/env node
/**
 * SCREENSHOT DOCS: the README's images, regenerated from the real files.
 *
 * A design kit whose README shows no output asks the reader to take its word.
 * These shots are rendered from the same HTML the gates measure, so what the
 * README shows is what `accuracy_report.mjs` just passed - not a mockup, and
 * not a screenshot taken once and left to rot.
 *
 * Deterministic on purpose: fixed viewport, reduced motion, pointer parked off
 * the UI, explicit data-theme. Two runs of the same commit look the same.
 *
 * Usage:
 *   node scripts/screenshot_docs.mjs              # write .github/images/*.png
 *   node scripts/screenshot_docs.mjs --check      # no writing: every image the
 *                                                 # README references exists, and
 *                                                 # nothing in the folder is orphaned
 *
 *   node scripts/screenshot_docs.mjs --only=a.png,b.png   # just these images;
 *                                                 # the rest stay byte for byte
 *
 * --check is what CI runs. It cannot prove a shot is CURRENT (a PNG diff across
 * Chrome versions is noise, not signal), only that the set is complete and that
 * no image sits there unreferenced. Re-run without --check after any visual
 * change, and look at the result.
 */
import { readFileSync, readdirSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), '..');
const OUT = join(ROOT, '.github', 'images');

/** [source html, output name, theme, viewport, fullPage] */
const SHOTS = [
  ['examples/showcase/index.html',            'dashboard-light.png',      'light', [1440, 1400], false],
  ['examples/showcase/index.html',            'dashboard-dark.png',       'dark',  [1440, 1400], false],
  ['examples/sample-app/preview.html',        'reference-app-light.png',  'light', [1280, 1000], true],
  ['examples/sample-app/preview.html',        'reference-app-dark.png',   'dark',  [1280, 1000], true],
  ['examples/component-states/button.html',   'button-states-light.png',  'light', [1280, 520],  false],
  ['examples/component-states/button.html',   'button-states-dark.png',   'dark',  [1280, 520],  false],
  // the before/after pair: the statistical defaults, and the same screen built to the rules
  ['tests/fixtures/bad/slop-screen.html',     'before-slop.png',          'light', [1280, 760],  false],
  ['examples/terminal/index.html',            'terminal-dark.png',        'dark',  [1600, 1750], false],
  // GitHub's social preview: 2:1, uploaded by hand in Settings -> General.
  // It is never shown inline in the README, so --check exempts it below. Its
  // source is a real card built from the token theme and three screens that
  // actually passed the gate, so the counts on it regenerate with the repo
  // instead of drifting into a claim nothing checks.
  ['.github/social/card.html',                'social-preview.png',       'dark',  [1280, 640],  false],
];

/* Thumbnails for the demo's own front door. They live under examples/ because
   GitHub Pages publishes that directory, and they are cropped to the top of each
   page rather than full-page so a card shows the screen, not a postage stamp. */
const THUMBS = [
  ['examples/showcase/index.html', 'atlas-light.png',    'light', [1200, 720]],
  ['examples/showcase/index.html', 'atlas-dark.png',     'dark',  [1200, 720]],
  ['examples/terminal/index.html', 'terminal-light.png', 'light', [1200, 720]],
  ['examples/terminal/index.html', 'terminal-thumb.png', 'dark',  [1200, 720]],
  ['examples/sample-app/preview.html', 'reference-light.png', 'light', [1100, 700]],
  ['examples/sample-app/preview.html', 'reference-dark.png',  'dark',  [1100, 700]],
  ['examples/apple-demo/index.html',   'apple-light.png',     'light', [1100, 700]],
  ['examples/apple-demo/index.html',   'apple-dark.png',      'dark',  [1100, 700]],
  ['examples/brandkit-demo/index.html','brandkit-light.png',  'light', [1100, 700]],
  ['examples/brandkit-demo/index.html','brandkit-dark.png',   'dark',  [1100, 700]],
  ['examples/templates/checkout.html', 'tpl-checkout.png',    'light', [1200, 760]],
  ['examples/templates/crm.html',      'tpl-crm.png',         'light', [1200, 760]],
  ['examples/templates/emr.html',      'tpl-emr.png',         'light', [1200, 760]],
  ['examples/templates/banking.html',  'tpl-banking.png',     'dark',  [1200, 760]],
  ['examples/templates/logistics.html','tpl-logistics.png',   'light', [1200, 760]],
  ['examples/templates/orbital.html',  'tpl-orbital.png',     'dark',  [1200, 760]],
  ['examples/templates/tracing.html',  'tpl-tracing.png',     'dark',  [1200, 760]],
  ['examples/templates/daw.html',      'tpl-daw.png',         'dark',  [1200, 760]],
  ['examples/templates/atc.html',      'tpl-atc.png',         'dark',  [1200, 760]],
  ['examples/templates/grid.html',     'tpl-grid.png',        'dark',  [1200, 760]],
  ['examples/templates/genomics.html', 'tpl-genomics.png',    'dark',  [1200, 760]],
  ['examples/templates/editor.html',   'tpl-editor.png',      'dark',  [1200, 760]],
  ['examples/templates/soc.html',      'tpl-soc.png',         'dark',  [1200, 760]],
  ['examples/templates/warehouse.html','tpl-warehouse.png',   'dark',  [1200, 760]],
  ['examples/templates/mes.html',      'tpl-mes.png',         'dark',  [1200, 760]],
  ['examples/templates/dispatch.html', 'tpl-dispatch.png',    'dark',  [1200, 760]],
  ['examples/templates/rail.html',     'tpl-rail.png',        'dark',  [1200, 760]],
  ['examples/templates/trial.html',    'tpl-trial.png',       'light', [1200, 760]],
  ['examples/templates/training.html', 'tpl-training.png',    'dark',  [1200, 760]],
  ['examples/templates/weather.html',  'tpl-weather.png',     'dark',  [1200, 760]],
  // The five websites, so the front door shows more than dashboards.
  ['examples/sites/launch/index.html',  'site-launch.png',     'light', [1200, 760]],
  ['examples/sites/store/index.html',   'site-store.png',      'light', [1200, 760]],
  ['examples/sites/journal/index.html', 'site-journal.png',    'light', [1200, 760]],
  ['examples/sites/local/index.html',   'site-local.png',      'light', [1200, 760]],
  ['examples/sites/gov/index.html',     'site-gov.png',        'light', [1200, 760]],
  // The before/after pair on the front door. Same viewport, same theme, no
  // fullPage. A comparison slider is a lie if the two halves are not the same
  // frame, and these two were 1280x1140 against 1280x1500. Matching them is only
  // half of it: at 1280 the slop fixture's content ends at 516px and the
  // reference app's at 889, so a frame tall enough for both left the slop side a
  // third blank white. 500 is the tallest frame where BOTH reach the bottom edge.
  ['tests/fixtures/bad/slop-screen.html', 'compare-slop.png', 'light', [1280, 500]],
  ['examples/sample-app/preview.html',    'compare-kit.png',  'light', [1280, 500]],
];
const THUMB_DIR = join(ROOT, 'examples', 'thumbs');

/* Not rendered here. The README header is a <picture> of the two brand covers,
   which are rendered from their SVGs (.github/brand/README.md), and hero.png is
   only its <img> fallback, so it has to be the dark cover byte for byte. This
   used to render an older cover page into hero.png instead, so a run of this
   script would have replaced the cover with a page the README no longer shows. */
const COPIES = [
  ['.github/brand/xias-cover-dark.png', 'hero.png'],
];

/** Images that exist for somewhere other than the README body. */
const NOT_INLINE = new Set(['social-preview.png']);

function check() {
  const readme = readFileSync(join(ROOT, 'README.md'), 'utf8');
  const referenced = new Set([...readme.matchAll(/\.github\/images\/([\w.-]+\.png)/g)].map(m => m[1]));
  const onDisk = existsSync(OUT) ? new Set(readdirSync(OUT).filter(f => f.endsWith('.png'))) : new Set();
  const declared = new Set([...SHOTS.map(s => s[1]), ...COPIES.map(c => c[1])]);
  const issues = [];

  for (const name of declared) {
    if (!onDisk.has(name)) issues.push(`missing: ${name} is declared here but not in .github/images/`);
  }
  for (const name of referenced) {
    if (!onDisk.has(name)) issues.push(`dangling: README shows ${name}, which does not exist`);
  }
  for (const [src, name] of COPIES) {
    if (onDisk.has(name) && !readFileSync(join(ROOT, src)).equals(readFileSync(join(OUT, name)))) {
      issues.push(`stale: ${name} is meant to be a copy of ${src}, and is not`);
    }
  }
  for (const name of onDisk) {
    if (NOT_INLINE.has(name)) continue;
    if (!referenced.has(name)) issues.push(`orphan: .github/images/${name} is in the repo but no README line shows it`);
  }

  console.log(`screenshot_docs --check: ${declared.size} declared (${NOT_INLINE.size} not inline), ${onDisk.size} on disk, ${referenced.size} referenced by README.`);
  if (issues.length) {
    console.log(`\nFAIL: ${issues.length} problem(s):`);
    for (const i of issues) console.log('  x ' + i);
    process.exit(1);
  }
  console.log('OK: every declared shot exists, every README image resolves, nothing orphaned.');
}

/* Re-rendering every image to add one rewrites them all: Chrome versions move
   antialiasing, and a commit fills with binary noise nobody asked for. */
const ONLY = (process.argv.find(a => a.startsWith('--only=')) || '').slice('--only='.length).split(',').filter(Boolean);
const wanted = (name) => !ONLY.length || ONLY.includes(name);

async function shoot() {
  let docs = 0, thumbs = 0;
  let chromium;
  try { ({ chromium } = await import('playwright')); }
  catch {
    console.error('playwright is not installed. npm i -D playwright@1.63.0 && npx playwright install chrome');
    process.exit(1);
  }
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome' });
  for (const [src, name, theme, [width, height], fullPage] of SHOTS) {
    if (!wanted(name)) continue;
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1.5 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('file://' + join(ROOT, src));
    await page.evaluate(t => document.documentElement.setAttribute('data-theme', t), theme);
    await page.mouse.move(2, 2);                 // no accidental hover state
    await page.waitForTimeout(250);
    await page.screenshot({ path: join(OUT, name), fullPage });
    await page.close();
    docs++;
    console.log(`  ${name}  <- ${src} (${theme})`);
  }
  mkdirSync(THUMB_DIR, { recursive: true });
  for (const [src, name, theme, [width, height]] of THUMBS) {
    if (!wanted(name)) continue;
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('file://' + join(ROOT, src));
    await page.evaluate(t => document.documentElement.setAttribute('data-theme', t), theme);
    await page.mouse.move(2, 2);
    await page.waitForTimeout(250);
    await page.screenshot({ path: join(THUMB_DIR, name), fullPage: false });
    await page.close();
    thumbs++;
    console.log(`  thumbs/${name}  <- ${src} (${theme})`);
  }
  await browser.close();
  for (const [src, name] of COPIES) {
    if (!wanted(name)) continue;
    copyFileSync(join(ROOT, src), join(OUT, name));
    docs++;
    console.log(`  ${name}  <- ${src} (copied)`);
  }
  console.log(`\nWrote ${docs} image(s) to .github/images/ and ${thumbs} to examples/thumbs/.`);
  console.log('Now LOOK at them before committing.');
}

if (process.argv.includes('--check')) check();
else await shoot();
