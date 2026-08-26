/**
 * Guards: the ways a gate can report green without having looked.
 *
 * Every case here is a real trap in this repo, not a hypothetical. A meta-gate
 * suite is only worth its runtime if it also refuses the shapes that make a
 * negative fixture pass by accident.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, copyFileSync, readdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { run, py, node, ROOT, F } from '../helpers/run.mjs';

/** Gates that open a browser, and therefore can pretend to pass without one. */
const BROWSER_GATES = readdirSync(join(ROOT, 'scripts'))
  .filter(f => f.endsWith('.mjs'))
  .filter(f => readFileSync(join(ROOT, 'scripts', f), 'utf8').includes('playwright not installed'))
  .sort();

test('every browser gate is accounted for', () => {
  // If a new render gate lands, it must be covered by the guard below.
  assert.equal(BROWSER_GATES.length, 14, `browser gates changed: ${BROWSER_GATES.join(', ')}`);
});

test('a missing browser fails loudly under DS_REQUIRE_BROWSER, and only skips without it', () => {
  // Copied outside the repo so Node's upward node_modules lookup cannot find
  // playwright — the state a clean CI runner or a fresh npx install is in.
  const dir = mkdtempSync(join(tmpdir(), 'ds-nobrowser-'));
  try {
    for (const g of BROWSER_GATES) {
      copyFileSync(join(ROOT, 'scripts', g), join(dir, g));
      const target = join(ROOT, 'examples', 'sample-app', 'preview.html');

      const required = run('node', [join(dir, g), target, '--open=#delBtn'],
        { env: { DS_REQUIRE_BROWSER: '1' } });
      assert.equal(required.status, 1, `${g} exited ${required.status} with no browser and DS_REQUIRE_BROWSER=1`);
      assert.match(required.out, /REQUIRED, FAILING/, `${g} did not say why it failed`);

      const optional = run('node', [join(dir, g), target, '--open=#delBtn'],
        { env: { DS_REQUIRE_BROWSER: '' } });
      assert.equal(optional.status, 0, `${g} should stay skippable when the browser is not required`);
      assert.match(optional.out, /SKIPPED/);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('validate_theme_refs needs TWO paths — one silently scans examples/golden instead', () => {
  // The trap: `validate_theme_refs.py <dir>` ignores the argument and validates
  // the repo's own golden example, so a broken fixture reports OK.
  const oneArg = py('validate_theme_refs.py', [F('bad/theme-refs')]);
  assert.equal(oneArg.status, 0);
  assert.doesNotMatch(oneArg.out, /theme-refs/, 'a single argument should be reaching the fixture but does not');

  const twoArgs = py('validate_theme_refs.py', [F('bad/theme-refs/theme.css'), F('bad/theme-refs')]);
  assert.equal(twoArgs.status, 1);
});

test('a path that does not exist never exits 0', () => {
  for (const [cmd, args] of [
    ['check_no_emoji.py', ['tests/fixtures/nope.html']],
    ['lint_hardcodes.py', ['tests/fixtures/nope.css']],
    ['validate_tokens.py', ['tests/fixtures/nope.json']],
    ['validate_contrast.py', ['tests/fixtures/nope.json']],
  ]) {
    assert.notEqual(py(cmd, args).status, 0, `${cmd} accepted a missing path`);
  }
  assert.notEqual(node('verify_states.mjs', ['tests/fixtures/nope.html'],
    { env: { DS_REQUIRE_BROWSER: '1' } }).status, 0);
});

test('the deliberately broken fixtures stay out of the repo-wide default scans', () => {
  // tests/fixtures/bad holds an emoji and raw hex on purpose. If a default scan
  // ever reaches in here, CI turns red for the wrong reason.
  const emoji = py('check_no_emoji.py');
  assert.equal(emoji.status, 0);
  assert.doesNotMatch(emoji.out, /tests\/fixtures/);

  const golden = py('lint_hardcodes.py', ['examples/golden']);
  assert.equal(golden.status, 0);
  assert.doesNotMatch(golden.out, /tests\/fixtures/);
});

test('a usage message is never mistaken for a pass', async () => {
  // Nine gates print usage and exit 0 when handed nothing. The helper has to
  // reject that, or a typo'd fixture path would read as a clean run.
  const { accepts } = await import('../helpers/run.mjs');
  const usage = node('verify_states.mjs', [], { env: { DS_REQUIRE_BROWSER: '1' } });
  assert.equal(usage.status, 0);
  assert.throws(() => accepts(usage), /printed usage/);
});

test('a SKIPPED run is never mistaken for a pass', async () => {
  const { accepts } = await import('../helpers/run.mjs');
  const fake = { status: 0, out: 'verify_states: playwright not installed — SKIPPED', signal: null };
  assert.throws(() => accepts(fake), /SKIPPED/);
});

test('exit 1 for the wrong reason is not counted as a detection', async () => {
  const { rejects } = await import('../helpers/run.mjs');
  const crash = { status: 1, out: 'Error: ENOENT: no such file or directory', signal: null };
  assert.throws(() => rejects(crash, /below WCAG AA/), /not for the expected reason/);
});
