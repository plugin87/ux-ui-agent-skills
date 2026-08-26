/**
 * build_tokens.mjs is a generator, not a gate: it never exits non-zero and it
 * drops a reference it cannot resolve without saying so. Nothing else in the
 * repo would notice, so its OUTPUT is the assertion.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { run, ROOT } from '../helpers/run.mjs';

function build(tokens) {
  const dir = mkdtempSync(join(tmpdir(), 'ds-tokens-'));
  const inDir = join(dir, 'in');
  mkdirSync(inDir);
  writeFileSync(join(inDir, 'colors.json'), JSON.stringify(tokens, null, 2));
  const out = join(dir, 'theme.css');
  const r = run('node', ['scripts/build_tokens.mjs', '--in', inDir, '--out', out]);
  const css = r.status === 0 ? readFileSync(out, 'utf8') : '';
  rmSync(dir, { recursive: true, force: true });
  return { ...r, css };
}

test('a resolvable alias chain reaches the emitted CSS as a final value', () => {
  const { status, css } = build({
    primitive: { blue: { 600: { $type: 'color', $value: '#2563EB' } } },
    semantic: { action: { primary: { $type: 'color', $value: '{primitive.blue.600}' } } },
  });
  assert.equal(status, 0);
  assert.match(css, /--color-action-primary:\s*#2563EB/i);
});

test('an unresolvable alias is dropped, not emitted as a broken var', () => {
  // The generator has no failure mode, so the contract is: never emit a value
  // that still contains {…}. A page referencing the missing token then fails
  // validate_theme_refs, which is the gate that does have teeth.
  const { status, css } = build({
    primitive: { blue: { 600: { $type: 'color', $value: '#2563EB' } } },
    semantic: { action: { primary: { $type: 'color', $value: '{primitive.blue.500}' } } },
  });
  assert.equal(status, 0);
  assert.doesNotMatch(css, /\{primitive\.blue\.500\}/, 'a raw alias leaked into the CSS');
  assert.doesNotMatch(css, /--color-action-primary:/, 'an unresolvable token should not be emitted');
});
