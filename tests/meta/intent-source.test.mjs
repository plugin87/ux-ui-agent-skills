/**
 * lint_intent.mjs on a folder of framework source (#11). Before 2026-11-18 a
 * folder meant its .html only, so a folder of React components "passed" with
 * nothing looked at. These run the source pass, which needs no browser: the
 * folders hold no .html, so the gate never launches one.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, cpSync, readFileSync, writeFileSync, rmSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { node, F, ROOT } from '../helpers/run.mjs';

const lint = (dir) => node('lint_intent.mjs', [dir]);

test('a TSX Delete that asks for the primary variant fails, and so does one that sets no variant on a primary-default Button', () => {
  const r = lint(F('bad/intent-tsx-primary'));
  assert.equal(r.status, 1, r.out);
  assert.match(r.stdout, /"Delete account" is destructive but asks for variant="primary"/);
  assert.match(r.stdout, /"Delete" is destructive and sets no variant.*\("primary", Button\.tsx\)/);
});

test('variant="destructive" wired to a blue class in the variant map fails', () => {
  const r = lint(F('bad/intent-tsx-wiring'));
  assert.equal(r.status, 1, r.out);
  assert.match(r.stdout, /the destructive variant is styled "bg-blue-600/);
});

test('variant="destructive" wired to the primary token in the stylesheet fails', () => {
  const r = lint(F('bad/intent-css-wiring'));
  assert.equal(r.status, 1, r.out);
  assert.match(r.stdout, /data-variant="destructive"\] sets background: var\(--color-action-primary\)/);
});

test('danger in both places, a neutral Remove and a primary Save pass, and the controls were read', () => {
  const r = lint(F('good/intent-tsx'));
  assert.equal(r.status, 0, r.out);
  assert.match(r.stdout, /3 source file\(s\) read \(3 destructive control\(s\) in them\)/);
});

test('the sample app fails the moment its Delete buttons lose variant="destructive" (#11)', () => {
  const dir = mkdtempSync(join(tmpdir(), 'intent-'));
  try {
    for (const f of readdirSync(join(ROOT, 'examples/sample-app')).filter(f => /\.(tsx|css)$/.test(f))) {
      cpSync(join(ROOT, 'examples/sample-app', f), join(dir, f));
    }
    for (const f of ['Button.tsx', 'Modal.tsx', 'components.css']) cpSync(join(ROOT, 'examples/golden', f), join(dir, f));
    assert.equal(lint(dir).status, 0, 'setup: the copy should pass as it is');
    const p = join(dir, 'Settings.tsx');
    const src = readFileSync(p, 'utf8');
    assert.equal(src.match(/ variant="destructive"/g)?.length, 2, 'setup: Settings.tsx no longer has two destructive buttons');
    writeFileSync(p, src.replaceAll(' variant="destructive"', ''));
    const r = lint(dir);
    assert.equal(r.status, 1, r.out);
    assert.equal(r.stdout.match(/sets no variant/g)?.length, 2, r.out);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
