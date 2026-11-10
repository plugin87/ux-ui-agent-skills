/**
 * Every render gate must FAIL when a browser cannot launch and
 * DS_REQUIRE_BROWSER=1 is set.
 *
 * guards.test.mjs covers the case where `playwright` itself will not import.
 * This covers the one after it: the package imports, and launch() throws.
 * measure_render.mjs exited 0 with SKIPPED here (#25), and through gate.mjs
 * that left a receipt the Stop hook accepted - a pass for a run that measured
 * nothing.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from '../helpers/run.mjs';

const register = join(ROOT, 'tests/fixtures/no-browser/register.mjs');
const page = join(ROOT, 'examples/sample-app/preview.html');
const gates = readdirSync(join(ROOT, 'scripts'))
  .filter(f => f.endsWith('.mjs'))
  .filter(f => /from ['"]playwright['"]|import\(['"]playwright['"]\)/.test(readFileSync(join(ROOT, 'scripts', f), 'utf8')));

test('the stub finds the render gates', () => {
  assert.ok(gates.length >= 10, `only ${gates.length} gate(s) import playwright - is the filter wrong?`);
});

for (const gate of gates) {
  test(`${gate} fails, not skips, when no browser launches`, () => {
    const args = gate === 'verify_focustrap.mjs' ? [page, '--open=button'] : [page];
    const r = spawnSync('node', ['--import', register, join(ROOT, 'scripts', gate), ...args], {
      cwd: ROOT, encoding: 'utf8', timeout: 60000,
      env: { ...process.env, DS_REQUIRE_BROWSER: '1' },
    });
    const out = (r.stdout || '') + (r.stderr || '');
    assert.notEqual(r.status, 0, `${gate} exited 0 with no browser:\n${out}`);
  });
}

/* screenshot_docs.mjs writes the README images; it is a docs tool, not a gate,
   and has nothing to skip to. counts.test.mjs exempts it the same way. */
for (const gate of gates.filter(g => g !== 'screenshot_docs.mjs')) {
  test(`${gate} says SKIPPED (no browser), not a stack trace, when it is not required`, () => {
    /* Run on its own, a gate on a machine without a browser is allowed to
       skip, as the README states. It must say which: the browser, in those
       words, and that nothing was measured. Sixteen gates used to die on a
       Playwright stack trace here instead. */
    const args = gate === 'verify_focustrap.mjs' ? [page, '--open=button'] : [page];
    const env = { ...process.env };
    delete env.DS_REQUIRE_BROWSER;
    const r = spawnSync('node', ['--import', register, join(ROOT, 'scripts', gate), ...args], {
      cwd: ROOT, encoding: 'utf8', timeout: 60000, env,
    });
    const out = (r.stdout || '') + (r.stderr || '');
    assert.equal(r.status, 0, `${gate} exited ${r.status}:\n${out}`);
    assert.match(out, /SKIPPED \(no browser\)/, `${gate} did not name the missing browser:\n${out}`);
    assert.match(out, /not a pass/, `${gate} did not say nothing was measured`);
    assert.doesNotMatch(out, /\n\s+at /, `${gate} printed a stack trace`);
  });
}
