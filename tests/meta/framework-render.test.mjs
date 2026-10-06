/**
 * render_framework_source.mjs, checked against framework source built to be wrong.
 *
 * This gate exists because the React source in examples/ was only ever read as
 * text. The first run of it found four defects that had sat in the repo for
 * months: Button.tsx did not compile at all - it carried its CSS in a block
 * comment, and a comment nested inside that one closed it early, so the rest of
 * the file parsed as TypeScript. It also rendered a .ds-spinner no stylesheet
 * defined, let a caller's className replace the base class outright, and
 * Dashboard.tsx still used the four-equal-cards layout the README holds up as
 * the generated-looking "before".
 *
 * Each of those is something the gate must still catch, so each gets a fixture.
 * A gate that only ever sees the fixed source proves nothing.
 */
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { node, ROOT } from '../helpers/run.mjs';

const render = (args = []) => node('render_framework_source.mjs', args);

/** The gate needs esbuild + react. Skip loudly rather than passing silently. */
let available = false;
before(() => { available = render(['--list']).status === 0; });

/**
 * Copy examples/ into a scratch dir, apply one mutation, and point the gate at it
 * with --root. Mutating the repo in place would leave it broken if a test threw,
 * and the copy needs no node_modules: the gate compiles into its own repo.
 */
function onMutatedCopy(mutate) {
  const dir = mkdtempSync(join(tmpdir(), 'ds-fw-'));
  try {
    cpSync(join(ROOT, 'examples'), join(dir, 'examples'), { recursive: true });
    mutate((p) => join(dir, p));
    return render(['--root', dir, '--out', join(dir, 'out')]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** Render the real source once into a scratch dir and hand back a page. */
function renderedPage(name) {
  const dir = mkdtempSync(join(tmpdir(), 'ds-fw-out-'));
  try {
    const r = render(['--out', dir]);
    assert.equal(r.status, 0, r.out);
    return readFileSync(join(dir, name), 'utf8');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test('the real framework source renders, and every class it emits resolves', (t) => {
  if (!available) return t.skip('esbuild/react not installed');
  const r = render();
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /every class it emits resolves/);
});

test('it REJECTS a component that emits a class no stylesheet defines', (t) => {
  if (!available) return t.skip('esbuild/react not installed');
  const r = onMutatedCopy((at) => {
    const f = at('examples/sample-app/StatCard.tsx');
    writeFileSync(f, readFileSync(f, 'utf8').replace('className="card__label"', 'className="card__labell"'));
  });
  assert.equal(r.status, 1, `expected a finding, got ${r.status}:\n${r.out}`);
  assert.match(r.out, /card__labell/);
  assert.match(r.out, /no linked stylesheet defines it/);
});

test('it REJECTS source that does not compile, instead of skipping that entry', (t) => {
  if (!available) return t.skip('esbuild/react not installed');
  // The exact shape that hid in Button.tsx for months.
  const r = onMutatedCopy((at) => {
    const f = at('examples/golden/Button.tsx');
    writeFileSync(f, readFileSync(f, 'utf8') + '\n/*\n.x { color: red; } /* Hover */\n*/\n');
  });
  assert.equal(r.status, 1, `expected a finding, got ${r.status}:\n${r.out}`);
  assert.match(r.out, /did not compile/);
});

test('it REJECTS a component that renders nothing at all', (t) => {
  if (!available) return t.skip('esbuild/react not installed');
  // Returning null passes every downstream gate by having no pixels - the
  // quietest way for a render gate to report green on nothing.
  const r = onMutatedCopy((at) => {
    writeFileSync(at('examples/sample-app/Dashboard.tsx'),
      'export function Dashboard() { return null; }\n');
  });
  assert.equal(r.status, 1, `expected a finding, got ${r.status}:\n${r.out}`);
  assert.match(r.out, /rendered empty markup/);
});

test('it REJECTS a file whose expected export is gone', (t) => {
  if (!available) return t.skip('esbuild/react not installed');
  const r = onMutatedCopy((at) => {
    writeFileSync(at('examples/sample-app/Settings.tsx'),
      'export function NotSettings() { return null; }\n');
  });
  assert.equal(r.status, 1, `expected a finding, got ${r.status}:\n${r.out}`);
  assert.match(r.out, /exports no Settings/);
});

test('every rendered button keeps ds-btn - a caller className is merged, not swapped', (t) => {
  if (!available) return t.skip('esbuild/react not installed');
  // Settings.tsx used <Button className="btn--secondary"> while {...rest} sat
  // AFTER className in Button.tsx, so the rendered Cancel button carried
  // btn--secondary and not ds-btn: every button style silently gone. Pinned here
  // at the level that matters, which is the rendered output.
  const html = renderedPage('button-variants.html');
  const classes = [...html.matchAll(/<button[^>]*class="([^"]*)"/g)].map(m => m[1]);
  assert.ok(classes.length >= 6, `expected the variant gallery, saw ${classes.length} button(s)`);
  for (const c of classes) {
    assert.ok(c.split(/\s+/).includes('ds-btn'), `a rendered button lost ds-btn: class="${c}"`);
  }
});

test('the loading state renders a spinner element, not an empty box', (t) => {
  if (!available) return t.skip('esbuild/react not installed');
  const html = renderedPage('button-variants.html');
  assert.match(html, /aria-busy="true"/, 'the loading variant must declare aria-busy');
  assert.match(html, /class="ds-spinner"/, 'the loading variant must render the spinner');
});

test('the destructive variant is declared on the element, so lint_intent can see it', (t) => {
  if (!available) return t.skip('esbuild/react not installed');
  const html = renderedPage('button-variants.html');
  assert.match(html, /data-variant="destructive"[^>]*>(?:<[^>]*>)*\s*Delete account/,
    'the Delete button must carry the destructive variant, not a primary fill');
});

test('the dashboard leads with one figure instead of four equal cards', (t) => {
  if (!available) return t.skip('esbuild/react not installed');
  // Non-negotiable 4. The React source mapped four identical StatCards until
  // 2026-10-05 while its hand-written twin had already been fixed.
  const html = renderedPage('dashboard.html');
  const hero = (html.match(/class="card card--hero"/g) || []).length;
  const plain = (html.match(/class="card"/g) || []).length;
  assert.equal(hero, 1, 'exactly one card leads');
  assert.equal(plain, 3, 'the other three stay quiet');
});
