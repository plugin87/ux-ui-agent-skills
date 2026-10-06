#!/usr/bin/env node
/**
 * Render the framework source, so the render gates can see it.
 *
 * Every other render gate in this repo points at hand-written HTML. The React
 * source in examples/ was only ever read as text by the file-reading gates, so
 * anything that depends on what the components actually PRODUCE was unmeasured:
 * a class the stylesheet never defines, a spread that overwrites the base class,
 * a composition rule the HTML twin follows and the source does not.
 *
 * This compiles each entry with esbuild, renders it with react-dom/server, and
 * writes a real HTML document that links the real stylesheets. The output is an
 * ordinary page, so every existing gate - contrast, axe, target size, intent,
 * taste, responsive, overflow - runs against it unchanged.
 *
 * It also runs the one check that only makes sense here: every class the render
 * emits must be defined in the stylesheets the page links. That is the check
 * that catches an unstyled element, which renders as plain text and is invisible
 * to contrast and axe alike because an unstyled element is usually still legible.
 *
 * HONEST SCOPE: this is server rendering. There is no useEffect, no state and no
 * event handler in the output, so it proves what the components produce, never
 * what they do on a click. Interactivity stays the HTML harnesses' job -
 * verify_interactive, verify_keyboard and verify_focustrap run there.
 *
 * Usage:
 *   node scripts/render_framework_source.mjs            # render, then check classes
 *   node scripts/render_framework_source.mjs --out DIR  # write somewhere else
 *   node scripts/render_framework_source.mjs --list     # print the output paths
 *   node scripts/render_framework_source.mjs --root DIR # render a copy, not this repo
 * Exit 0 = every entry rendered and every emitted class resolves; 1 = it does not.
 */
import { build } from 'esbuild';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement, Fragment } from 'react';
import { mkdir, writeFile, rm, readFile } from 'node:fs/promises';
import { join, dirname, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SELF = fileURLToPath(new URL('..', import.meta.url));

/**
 * Where the source being rendered lives. Defaults to this repo; `--root <dir>`
 * points the gate at a copy, which is the only way to show it REFUSING broken
 * source rather than only accepting good source. esbuild and react still resolve
 * from this repo, so a copy needs no node_modules of its own.
 */
function rootFrom(argv) {
  const i = argv.indexOf('--root');
  return i !== -1 && argv[i + 1] ? resolve(argv[i + 1]) : SELF;
}

/**
 * What to render.
 *
 * `props` is what the component needs to produce its interesting state - a Modal
 * that defaults to closed renders null, and a page that proves nothing is worse
 * than no page at all. `css` is the stylesheets the real app would import, in
 * the real import order: theme first, then components.
 */
const ENTRIES = [
  {
    name: 'dashboard',
    file: 'examples/sample-app/Dashboard.tsx',
    export: 'Dashboard',
    title: 'Dashboard.tsx, server-rendered',
    css: ['examples/golden/theme.css', 'examples/golden/components.css', 'examples/sample-app/styles.css'],
  },
  {
    name: 'settings',
    file: 'examples/sample-app/Settings.tsx',
    export: 'Settings',
    title: 'Settings.tsx, server-rendered',
    css: ['examples/golden/theme.css', 'examples/golden/components.css', 'examples/sample-app/styles.css'],
  },
  {
    name: 'button-variants',
    file: 'examples/golden/Button.tsx',
    export: 'Button',
    title: 'Button.tsx, every variant and state, server-rendered',
    css: ['examples/golden/theme.css', 'examples/golden/components.css',
          'examples/golden/render-harness.css'],
    // The component is one button; the page has to show the variants side by
    // side or the gates only ever measure the default.
    gallery: (Button) => [
      ['Primary', { children: 'Save changes' }],
      ['Primary, disabled', { children: 'Save changes', disabled: true }],
      ['Primary, loading', { children: 'Saving', loading: true }],
      ['Secondary', { children: 'Cancel', variant: 'secondary' }],
      ['Destructive', { children: 'Delete account', variant: 'destructive' }],
      ['Selected', { children: 'Bold', selected: true }],
    ].map(([label, props], i) =>
      createElement('div', { key: i, className: 'ds-gallery__item' },
        createElement('p', { className: 'ds-gallery__label' }, label),
        createElement(Button, props))),
  },
  {
    name: 'modal',
    file: 'examples/golden/Modal.tsx',
    export: 'Modal',
    title: 'Modal.tsx, open over the page it belongs to, server-rendered',
    css: ['examples/golden/theme.css', 'examples/golden/components.css',
          'examples/sample-app/styles.css'],
    props: {
      open: true,
      onClose: () => {},
      titleId: 'confirm-title',
      children: [
        createElement('h2', { key: 't', id: 'confirm-title', className: 'ds-modal__title' }, 'Delete account?'),
        createElement('p', { key: 'b', className: 'ds-modal__body' }, 'This is permanent and cannot be undone.'),
      ],
    },
    // A dialog floating on a blank page is not how a dialog ever renders, and it
    // makes every page-level measurement meaningless - the scrim has nothing to
    // dim and the largest text on the page is the dialog's own title. The page
    // underneath is the same markup Settings.tsx puts there.
    behind: createElement('div', { className: 'app' },
      createElement('main', { className: 'container' },
        createElement('h1', { className: 'page-title' }, 'Settings'),
        createElement('p', { className: 'subtle' }, 'Account, notifications and data.'))),
  },
];

/** `class="a b"` in the rendered markup. React emits class, not className. */
const CLASS_ATTR = /\sclass="([^"]*)"/g;
/** A class selector in a stylesheet, with block comments already stripped. */
const CLASS_SELECTOR = /\.(-?[_a-zA-Z][\w-]*)/g;

const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');

async function definedClasses(cssPaths, ROOT) {
  const defined = new Set();
  for (const p of cssPaths) {
    const css = stripComments(await readFile(join(ROOT, p), 'utf8'));
    for (const m of css.matchAll(CLASS_SELECTOR)) defined.add(m[1]);
  }
  return defined;
}

function usedClasses(html) {
  const used = new Map(); // class -> first snippet it appeared in
  for (const m of html.matchAll(CLASS_ATTR)) {
    const at = Math.max(0, m.index - 40);
    for (const c of m[1].split(/\s+/).filter(Boolean)) {
      if (!used.has(c)) used.set(c, html.slice(at, m.index + m[0].length + 20).replace(/\s+/g, ' '));
    }
  }
  return used;
}

/** Compile one entry to ESM that node can import, then hand back its exports. */
async function load(entry, tmpDir, ROOT) {
  const outfile = join(tmpDir, `${entry.name}.mjs`);
  await build({
    entryPoints: [join(ROOT, entry.file)],
    outfile,
    bundle: true,
    format: 'esm',
    platform: 'node',
    jsx: 'automatic',
    // react and react-dom resolve from this repo's node_modules at run time;
    // bundling them would give the entry its own copy of React and break the
    // single-instance rule that renderToStaticMarkup depends on.
    external: ['react', 'react-dom', 'react/jsx-runtime', 'react-dom/server'],
    logLevel: 'silent',
  });
  return import(pathToFileURL(outfile).href);
}

function document({ title, css, body }) {
  const links = css.map(href => `<link rel="stylesheet" href="${href}" />`).join('\n  ');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<!-- Generated by scripts/render_framework_source.mjs. Do not edit: edit the
     component, then re-run the script. -->
  ${links}
</head>
<body>
${body}
</body>
</html>
`;
}

async function main(argv) {
  const ROOT = rootFrom(argv);
  const outArg = argv.indexOf('--out');
  const outDir = outArg !== -1 && argv[outArg + 1]
    ? resolve(argv[outArg + 1])
    : join(ROOT, 'dist', 'framework-render');
  const listOnly = argv.includes('--list');

  if (listOnly) {
    for (const e of ENTRIES) console.log(join(outDir, `${e.name}.html`));
    return 0;
  }

  // The compiled modules must sit inside THIS repo, whatever --root points at:
  // they import react, and node resolves that by walking up from the file. A
  // build dir next to a copied source tree would have no node_modules above it.
  const tmpDir = join(SELF, 'dist', '.framework-build');
  await rm(outDir, { recursive: true, force: true });
  await rm(tmpDir, { recursive: true, force: true });
  await mkdir(tmpDir, { recursive: true });
  await mkdir(outDir, { recursive: true });

  const problems = [];
  const written = [];

  for (const entry of ENTRIES) {
    let mod;
    try {
      mod = await load(entry, tmpDir, ROOT);
    } catch (err) {
      problems.push(`${entry.file}: did not compile - ${err.message.split('\n')[0]}`);
      continue;
    }
    const Component = mod[entry.export];
    if (typeof Component !== 'function' && typeof Component !== 'object') {
      problems.push(`${entry.file}: exports no ${entry.export}`);
      continue;
    }

    let body;
    try {
      const self = entry.gallery
        ? createElement('main', { className: 'ds-gallery' }, entry.gallery(Component))
        : createElement(Component, entry.props || {});
      const tree = entry.behind
        ? createElement(Fragment, null, entry.behind, self)
        : self;
      body = renderToStaticMarkup(tree);
    } catch (err) {
      problems.push(`${entry.file}: threw while rendering - ${err.message.split('\n')[0]}`);
      continue;
    }
    if (!body.trim()) {
      // A component that renders nothing passes every gate by having no pixels.
      problems.push(`${entry.file}: rendered empty markup (check the props in ENTRIES)`);
      continue;
    }

    const outFile = join(outDir, `${entry.name}.html`);
    const hrefs = entry.css.map(p => relative(dirname(outFile), join(ROOT, p)));
    await writeFile(outFile, document({ title: entry.title, css: hrefs, body }));
    written.push(outFile);

    const defined = await definedClasses(entry.css, ROOT);
    for (const [cls, where] of usedClasses(body)) {
      if (defined.has(cls)) continue;
      problems.push(`${entry.file}: class "${cls}" is emitted but no linked stylesheet defines it\n      ...${where}...`);
    }
  }

  console.log(`Rendered ${written.length} of ${ENTRIES.length} entry point(s) to ${relative(ROOT, outDir) || outDir}`);
  for (const f of written) console.log(`  ${relative(ROOT, f)}`);

  if (problems.length) {
    console.log(`\nFAIL: ${problems.length} problem(s) in the framework source:`);
    for (const p of problems) console.log(`  x ${p}`);
    console.log('\nThese render wrong in any app that imports these components.');
    return 1;
  }
  console.log('\nOK: every entry rendered, and every class it emits resolves in a linked stylesheet.');
  console.log('Scope: server rendering only - what the components produce, not what they do on a click.');
  return 0;
}

main(process.argv.slice(2)).then(c => process.exit(c)).catch(err => {
  console.error(`render_framework_source: ${err.stack || err.message}`);
  process.exit(2);
});
