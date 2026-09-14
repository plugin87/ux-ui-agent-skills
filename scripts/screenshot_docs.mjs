#!/usr/bin/env node
/**
 * SCREENSHOT DOCS — the README's images, regenerated from the real files.
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
 * --check is what CI runs. It cannot prove a shot is CURRENT (a PNG diff across
 * Chrome versions is noise, not signal), only that the set is complete and that
 * no image sits there unreferenced. Re-run without --check after any visual
 * change, and look at the result.
 */
import { readFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), '..');
const OUT = join(ROOT, '.github', 'images');

/** [source html, output name, theme, viewport, fullPage] */
const SHOTS = [
  ['cover.html',                              'hero.png',                 'light', [1280, 630],  false],
  ['examples/showcase/index.html',            'dashboard-light.png',      'light', [1440, 1400], false],
  ['examples/showcase/index.html',            'dashboard-dark.png',       'dark',  [1440, 1400], false],
  ['examples/sample-app/preview.html',        'reference-app-light.png',  'light', [1280, 1000], true],
  ['examples/sample-app/preview.html',        'reference-app-dark.png',   'dark',  [1280, 1000], true],
  ['examples/component-states/button.html',   'button-states-light.png',  'light', [1280, 520],  false],
  ['examples/component-states/button.html',   'button-states-dark.png',   'dark',  [1280, 520],  false],
  // the before/after pair: the statistical defaults, and the same screen built to the rules
  ['tests/fixtures/bad/slop-screen.html',     'before-slop.png',          'light', [1280, 760],  false],
  ['examples/terminal/index.html',            'terminal-dark.png',        'dark',  [1600, 1750], false],
  // GitHub's social preview: 1280x640, uploaded by hand in Settings -> General.
  // It is never shown inline in the README, so --check exempts it below.
  ['cover.html',                              'social-preview.png',       'light', [1280, 640],  false],
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
];
const THUMB_DIR = join(ROOT, 'examples', 'thumbs');

/** Images that exist for somewhere other than the README body. */
const NOT_INLINE = new Set(['social-preview.png']);

function check() {
  const readme = readFileSync(join(ROOT, 'README.md'), 'utf8');
  const referenced = new Set([...readme.matchAll(/\.github\/images\/([\w.-]+\.png)/g)].map(m => m[1]));
  const onDisk = existsSync(OUT) ? new Set(readdirSync(OUT).filter(f => f.endsWith('.png'))) : new Set();
  const declared = new Set(SHOTS.map(s => s[1]));
  const issues = [];

  for (const name of declared) {
    if (!onDisk.has(name)) issues.push(`missing: ${name} is declared here but not in .github/images/`);
  }
  for (const name of referenced) {
    if (!onDisk.has(name)) issues.push(`dangling: README shows ${name}, which does not exist`);
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

async function shoot() {
  let chromium;
  try { ({ chromium } = await import('playwright')); }
  catch {
    console.error('playwright is not installed. npm i -D playwright && npx playwright install chrome');
    process.exit(1);
  }
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome' });
  for (const [src, name, theme, [width, height], fullPage] of SHOTS) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1.5 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('file://' + join(ROOT, src));
    await page.evaluate(t => document.documentElement.setAttribute('data-theme', t), theme);
    await page.mouse.move(2, 2);                 // no accidental hover state
    await page.waitForTimeout(250);
    await page.screenshot({ path: join(OUT, name), fullPage });
    await page.close();
    console.log(`  ${name}  <- ${src} (${theme})`);
  }
  mkdirSync(THUMB_DIR, { recursive: true });
  for (const [src, name, theme, [width, height]] of THUMBS) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('file://' + join(ROOT, src));
    await page.evaluate(t => document.documentElement.setAttribute('data-theme', t), theme);
    await page.mouse.move(2, 2);
    await page.waitForTimeout(250);
    await page.screenshot({ path: join(THUMB_DIR, name), fullPage: false });
    await page.close();
    console.log(`  thumbs/${name}  <- ${src} (${theme})`);
  }
  await browser.close();
  console.log(`\nWrote ${SHOTS.length} image(s) to .github/images/ and ${THUMBS.length} to examples/thumbs/.`);
  console.log('Now LOOK at them before committing.');
}

if (process.argv.includes('--check')) check();
else await shoot();
