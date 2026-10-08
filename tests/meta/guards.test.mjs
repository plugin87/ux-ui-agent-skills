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
  assert.equal(BROWSER_GATES.length, 15, `browser gates changed: ${BROWSER_GATES.join(', ')}`);
});

test('a missing browser fails loudly under DS_REQUIRE_BROWSER, and only skips without it', () => {
  // Copied outside the repo so Node's upward node_modules lookup cannot find
  // playwright — the state a clean CI runner or a fresh npx install is in.
  const dir = mkdtempSync(join(tmpdir(), 'ds-nobrowser-'));
  try {
    // _targets.mjs travels with them: the gates import it, and a missing import
    // would fail for the wrong reason and still look like the right answer.
    copyFileSync(join(ROOT, 'scripts', '_targets.mjs'), join(dir, '_targets.mjs'));
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

test('validate_theme_refs refuses one path rather than silently scanning golden', () => {
  // It used to ignore a single argument and validate the repo's own golden
  // example instead, so a broken fixture handed to it reported OK. Now a lone
  // path is an error, because guessing which half the caller meant is how a
  // gate ends up measuring something nobody asked about.
  const oneArg = py('validate_theme_refs.py', [F('bad/theme-refs')]);
  assert.equal(oneArg.status, 1, oneArg.out);
  assert.match(oneArg.out, /at least one --theme/);

  const twoArgs = py('validate_theme_refs.py', [F('bad/theme-refs/theme.css'), F('bad/theme-refs')]);
  assert.equal(twoArgs.status, 1);
  assert.match(twoArgs.out, /resolves to nothing/);
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
});

test('every render gate REFUSES a missing path, rather than crashing into one', () => {
  // Thirteen of these went straight to the browser with whatever path they were
  // handed. A missing file threw somewhere inside Playwright, which happened to
  // exit 1 on macOS and exited 0 on Linux CI - so a typo in a filename read as a
  // clean pass on the machine that matters. scripts/_targets.mjs checks first.
  //
  // Exit 2, not 1, and the distinction is the point: 1 means "I looked and found
  // something wrong", 2 means "I could not look".
  const RENDER_GATES = [
    'verify_states.mjs', 'measure_render.mjs', 'axe_audit.mjs', 'verify_keyboard.mjs',
    'verify_target_size.mjs', 'verify_overflow.mjs', 'verify_interactive.mjs',
    'lint_intent.mjs', 'verify_reduced_motion.mjs', 'verify_rtl.mjs', 'slop_tells.mjs',
    'taste_audit.mjs', 'verify_responsive.mjs', 'verify_mobile_first.mjs',
    'verify_focustrap.mjs',
  ];
  for (const g of RENDER_GATES) {
    const r = node(g, ['tests/fixtures/nope.html'], { env: { DS_REQUIRE_BROWSER: '1' } });
    assert.equal(r.status, 2,
      `${g} exited ${r.status} on a missing path; expected 2 ("could not look")\n${r.out}`);
    assert.match(r.out, /not found/,
      `${g} did not say which path was missing`);
  }
});

test('a render gate given no target at all refuses too', () => {
  // The other half of the same hole: no argument is not "scan everything".
  const r = node('verify_states.mjs', [], { env: { DS_REQUIRE_BROWSER: '1' } });
  assert.equal(r.status, 2, r.out);
  assert.match(r.out, /no target given/);
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
  // The gates used to print usage and exit 0 when handed nothing, which is why
  // the helper learned to reject that shape. They exit 2 now - see the
  // missing-path tests above - so the helper is checked against the shape
  // directly rather than against a gate that no longer produces it. The guard
  // stays because any future gate could regress into it.
  const { accepts } = await import('../helpers/run.mjs');
  const usage = { status: 0, out: 'Usage: node scripts/verify_states.mjs <file> [--dark]', signal: null };
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
