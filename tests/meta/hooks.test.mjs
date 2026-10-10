/**
 * The three hooks, driven the way Claude Code drives them: JSON on stdin,
 * verdict in the exit code.
 *
 * A hook is the only thing in this repo that runs whether or not the model
 * remembers to run it, which is why `CLAUDE.md` can say "never state a number
 * you did not measure" and have it mean something. It is also the only thing
 * here that can fail completely silently: a hook that throws early, or reads its
 * input wrongly, exits 0 and looks exactly like a clean codebase.
 *
 * The first version of the PostToolUse hook did precisely that. It called
 * `require` in an ES module, the catch swallowed the ReferenceError, and it
 * exited 0 on a file with 63 hardcoded values and 12 emoji. These tests exist so
 * that cannot happen quietly again.
 */
import { test, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readdirSync, rmSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ROOT, F } from '../helpers/run.mjs';

/** Run a hook with a JSON payload on stdin, in an isolated receipts directory. */
function hook(name, payload, env = {}) {
  return spawnSync('node', [join(ROOT, 'hooks', name)], {
    cwd: ROOT,
    input: JSON.stringify(payload),
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
}

let scratch;
beforeEach(() => {
  if (scratch) rmSync(scratch, { recursive: true, force: true });
  scratch = mkdtempSync(join(tmpdir(), 'ds-hooks-'));
});
after(() => { if (scratch) rmSync(scratch, { recursive: true, force: true }); });

/** An isolated receipts/ledger location, so tests never read the real session. */
const isolated = () => ({ CLAUDE_PLUGIN_DATA: scratch, CLAUDE_SESSION_ID: 'test', CLAUDE_PROJECT_DIR: ROOT });

// ---------------------------------------------------------------- SessionStart

test('SessionStart says whether the render gates can run at all', () => {
  const r = hook('session-start-preflight.mjs', { hook_event_name: 'SessionStart' });
  assert.equal(r.status, 0, 'a preflight must never block a session');
  assert.match(r.stdout, /Verification preflight/);
  assert.match(r.stdout, /Render gates (CAN|CANNOT) run here/);
  assert.match(r.stdout, /Browser-free gates always work/,
    'it must name what still works, not only what does not');
});

test('SessionStart installs nothing and spawns nothing', () => {
  // It may NAME the install command as advice - that is the useful half. What it
  // must never do is run one: this fires on every session start.
  const src = readFileSync(join(ROOT, 'hooks/session-start-preflight.mjs'), 'utf8');
  for (const forbidden of ['spawnSync', 'execSync', 'spawn(', 'exec(', 'child_process']) {
    assert.ok(!src.includes(forbidden),
      `session-start-preflight.mjs uses ${forbidden}; it must only look at the filesystem`);
  }
});

// ---------------------------------------------------------------- PostToolUse

test('PostToolUse REJECTS a file the browser-free gates have findings on', () => {
  const r = hook('posttooluse-fast-gates.mjs', {
    tool_name: 'Write',
    tool_input: { file_path: F('bad/slop-screen.html') },
  }, isolated());
  assert.equal(r.status, 2, `expected exit 2, got ${r.status}:\n${r.stdout}${r.stderr}`);
  assert.match(r.stderr, /hardcoded value/);
  assert.match(r.stderr, /emoji/);
});

test('PostToolUse passes a clean file', () => {
  const r = hook('posttooluse-fast-gates.mjs', {
    tool_name: 'Edit',
    tool_input: { file_path: join(ROOT, 'examples/sample-app/preview.html') },
  }, isolated());
  assert.equal(r.status, 0, `${r.stdout}${r.stderr}`);
});

test('PostToolUse ignores a file that is not UI', () => {
  const r = hook('posttooluse-fast-gates.mjs', {
    tool_name: 'Edit',
    tool_input: { file_path: join(ROOT, 'README.md') },
  }, isolated());
  assert.equal(r.status, 0);
  assert.equal(r.stderr.trim(), '');
});

test('PostToolUse actually reads its stdin', () => {
  // The regression that matters. If the hook cannot parse its payload it exits 0
  // and every edit looks clean, which is indistinguishable from working.
  const withPayload = hook('posttooluse-fast-gates.mjs', {
    tool_name: 'Write', tool_input: { file_path: F('bad/slop-screen.html') },
  }, isolated());
  assert.equal(withPayload.status, 2, 'a known-bad file must be rejected, proving stdin was read');

  const src = readFileSync(join(ROOT, 'hooks/posttooluse-fast-gates.mjs'), 'utf8');
  assert.ok(!/\brequire\s*\(/.test(src),
    'require() is not available in an ES module; it throws and the catch hides it');
});

test('PostToolUse records the edit before it runs any gate', () => {
  // If a gate crashed before the ledger was written, the Stop hook would see
  // nothing to check and the session would end unmeasured.
  const src = readFileSync(join(ROOT, 'hooks/posttooluse-fast-gates.mjs'), 'utf8');
  const ledgerAt = src.indexOf('appendFileSync');
  const gatesAt = src.indexOf('const GATES');
  assert.ok(ledgerAt > 0 && gatesAt > ledgerAt,
    'the ledger write must come before the gate runs');
});

// ------------------------------------------------------------------------ Stop

test('Stop passes straight through when stop_hook_active is set', () => {
  // True when Claude Code is already continuing because of a Stop hook. Blocking
  // again there is an infinite loop.
  const r = hook('stop-require-measurement.mjs', { stop_hook_active: true }, isolated());
  assert.equal(r.status, 0);
  assert.equal(r.stderr.trim(), '');
});

test('Stop does nothing when the session edited nothing', () => {
  const r = hook('stop-require-measurement.mjs', {}, isolated());
  assert.equal(r.status, 0);
});

test('Stop BLOCKS when a UI file was edited and never measured', () => {
  const env = isolated();
  const target = join(ROOT, 'examples/sample-app/preview.html');
  const edit = hook('posttooluse-fast-gates.mjs',
    { tool_name: 'Edit', tool_input: { file_path: target } }, env);
  assert.equal(edit.status, 0, 'setup: the edit itself should be clean');

  const r = hook('stop-require-measurement.mjs', {}, env);
  assert.equal(r.status, 2, `expected a block, got ${r.status}:\n${r.stdout}${r.stderr}`);
  assert.match(r.stderr, /no live gate receipt/);
  assert.match(r.stderr, /preview\.html/);
});

test('Stop releases once the file has a live receipt', () => {
  const env = isolated();
  const target = join(ROOT, 'examples/sample-app/preview.html');
  hook('posttooluse-fast-gates.mjs', { tool_name: 'Edit', tool_input: { file_path: target } }, env);

  const gate = spawnSync('node', [join(ROOT, 'scripts/gate.mjs'), 'lint_intent.mjs', target],
    { cwd: ROOT, encoding: 'utf8', env: { ...process.env, ...env } });
  assert.equal(gate.status, 0, `setup: the gate run failed:\n${gate.stdout}${gate.stderr}`);

  const r = hook('stop-require-measurement.mjs', {}, env);
  assert.equal(r.status, 0, `expected release, got ${r.status}:\n${r.stderr}`);
});

test('a receipt stops counting once the file changes', () => {
  // The hash is what makes a receipt evidence rather than a note. This is the
  // behaviour the Stop hook depends on.
  const env = isolated();
  const tmp = join(scratch, 'page.html');
  const original = '<!doctype html><title>t</title><p>a</p>';
  writeFileSync(tmp, original);

  const gate = spawnSync('node', [join(ROOT, 'scripts/gate.mjs'), 'check_no_emoji.py', tmp],
    { cwd: ROOT, encoding: 'utf8', env: { ...process.env, ...env } });
  assert.equal(gate.status, 0, gate.stdout + gate.stderr);

  const before = spawnSync('node', [join(ROOT, 'scripts/gate.mjs'), '--check', tmp],
    { cwd: ROOT, encoding: 'utf8', env: { ...process.env, ...env } });
  assert.equal(before.status, 0, 'a freshly measured file has a live receipt');

  writeFileSync(tmp, original + '<p>b</p>');
  const after = spawnSync('node', [join(ROOT, 'scripts/gate.mjs'), '--check', tmp],
    { cwd: ROOT, encoding: 'utf8', env: { ...process.env, ...env } });
  assert.equal(after.status, 1, 'editing the file must expire its receipt');
  assert.match(after.stdout, /EXPIRED/);
});

test('both install routes declare all three hooks', () => {
  const plugin = JSON.parse(readFileSync(join(ROOT, 'hooks/hooks.json'), 'utf8'));
  const project = JSON.parse(readFileSync(join(ROOT, '.claude/settings.json'), 'utf8'));
  for (const event of ['SessionStart', 'PostToolUse', 'Stop']) {
    assert.ok(plugin.hooks[event], `hooks/hooks.json is missing ${event}`);
    assert.ok(project.hooks?.[event], `.claude/settings.json is missing ${event}`);
  }
  // The scripts are shared; only the way the path is spelled differs.
  const pluginCmds = JSON.stringify(plugin.hooks);
  const projectCmds = JSON.stringify(project.hooks);
  assert.match(pluginCmds, /\$\{CLAUDE_PLUGIN_ROOT\}/, 'the plugin route needs CLAUDE_PLUGIN_ROOT');
  assert.match(projectCmds, /\$CLAUDE_PROJECT_DIR/, 'the init route needs CLAUDE_PROJECT_DIR');
  for (const f of ['session-start-preflight.mjs', 'posttooluse-fast-gates.mjs',
                   'stop-require-measurement.mjs']) {
    assert.ok(existsSync(join(ROOT, 'hooks', f)), `hooks/${f} is missing`);
    assert.match(pluginCmds, new RegExp(f.replace('.', '\\.')));
    assert.match(projectCmds, new RegExp(f.replace('.', '\\.')));
  }
});

/**
 * A hook must never block you over a file in someone else's project.
 *
 * Under a plugin install the receipts directory is CLAUDE_PLUGIN_DATA, which
 * every project on the machine shares, and CLAUDE_SESSION_ID is not always set
 * - a `claude -p` run has none. The ledger was keyed on the session alone, so
 * every such run wrote to one `edited-local.jsonl` and the Stop hook in one
 * project read another project's edits. Observed on 2026-10-08: a session in
 * /tmp/mcptest was told ten files under /tmp/blind-plugin were unmeasured.
 */
test('the edit ledger is scoped to the project, not just the session', () => {
  // Same session id in both, so only the project scoping can keep them apart.
  const shared = { CLAUDE_PLUGIN_DATA: scratch, CLAUDE_SESSION_ID: '' };
  const b = mkdtempSync(join(tmpdir(), 'ds-projB-'));
  try {
    const target = join(ROOT, 'examples/sample-app/preview.html');
    const edit = hook('posttooluse-fast-gates.mjs',
      { session_id: 'same', tool_name: 'Edit', tool_input: { file_path: target } },
      { ...shared, CLAUDE_PROJECT_DIR: ROOT });
    assert.equal(edit.status, 0, 'setup: the edit itself should be clean');

    const other = hook('stop-require-measurement.mjs', { session_id: 'same' },
      { ...shared, CLAUDE_PROJECT_DIR: b });
    assert.equal(other.status, 0,
      `project B was blocked by project A's edit:\n${other.stderr}`);

    // Project A itself must still be blocked - the scoping must not switch the hook off.
    const own = hook('stop-require-measurement.mjs', { session_id: 'same' },
      { ...shared, CLAUDE_PROJECT_DIR: ROOT });
    assert.equal(own.status, 2,
      `project A should still be blocked for its own unmeasured edit, got ${own.status}`);
    assert.match(own.stderr, /preview\.html/);
  } finally {
    rmSync(b, { recursive: true, force: true });
  }
});

/**
 * The guarantee that holds even if a ledger is wrong: the Stop hook names
 * only files inside the current project. A ledger written by an older version,
 * or by anything else, cannot make it block over another repository.
 */
test('Stop never names a file outside the current project', () => {
  const env = { CLAUDE_PLUGIN_DATA: scratch, CLAUDE_SESSION_ID: '', CLAUDE_PROJECT_DIR: ROOT };
  const outside = mkdtempSync(join(tmpdir(), 'ds-foreign-'));
  try {
    const foreign = join(outside, 'page.html');
    writeFileSync(foreign, '<!doctype html><title>x</title>');
    // Poison this session's own ledger with a foreign path, as a bug would.
    const probe = hook('posttooluse-fast-gates.mjs',
      { session_id: 'poisoned', tool_name: 'Edit', tool_input: { file_path: foreign } }, env);
    assert.notEqual(probe.status, null, 'setup: the hook must run');

    const r = hook('stop-require-measurement.mjs', { session_id: 'poisoned' }, env);
    assert.equal(r.status, 0, `blocked over a file in another directory:\n${r.stderr}`);
    assert.doesNotMatch(r.stderr, /page\.html/);
  } finally {
    rmSync(outside, { recursive: true, force: true });
  }
});

test('with no session id nothing is recorded and nothing blocks', () => {
  const env = { CLAUDE_PLUGIN_DATA: scratch, CLAUDE_SESSION_ID: '', CLAUDE_PROJECT_DIR: ROOT };
  const target = join(ROOT, 'examples/sample-app/preview.html');
  hook('posttooluse-fast-gates.mjs', { tool_name: 'Edit', tool_input: { file_path: target } }, env);
  const receipts = join(scratch, 'receipts');
  const ledgers = existsSync(receipts) ? readdirSync(receipts).filter(f => f.startsWith('edited-')) : [];
  assert.deepEqual(ledgers, [], 'a ledger with no session id is a ledger every session shares');
  const r = hook('stop-require-measurement.mjs', {}, env);
  assert.equal(r.status, 0);
});

test('SessionStart removes the shared ledgers older versions left behind', () => {
  const receipts = join(scratch, 'receipts');
  mkdirSync(receipts, { recursive: true });
  for (const f of ['edited-local.jsonl', 'edited-0123456789-local.jsonl', 'edited-0123456789-abc.jsonl', 'local.jsonl']) {
    writeFileSync(join(receipts, f), '{}\n');
  }
  const r = hook('session-start-preflight.mjs', { hook_event_name: 'SessionStart' },
    { CLAUDE_PLUGIN_DATA: scratch });
  assert.equal(r.status, 0);
  assert.deepEqual(readdirSync(receipts).sort(), ['edited-0123456789-abc.jsonl', 'local.jsonl'],
    'only the shared legacy ledgers go; a real session ledger and the receipts stay');
});

/**
 * Two sessions in one project must not share a ledger either.
 *
 * CLAUDE_SESSION_ID does not reach hook processes; the session id arrives on
 * stdin as `session_id`. Keyed on the environment alone, every session was
 * 'local', and on 2026-10-10 a session was blocked over five files that other
 * sessions, in other projects, had edited.
 */
test('the edit ledger is scoped to the session from the hook payload', () => {
  const env = { CLAUDE_PLUGIN_DATA: scratch, CLAUDE_PROJECT_DIR: ROOT, CLAUDE_SESSION_ID: '' };
  const target = join(ROOT, 'examples/sample-app/preview.html');
  const edit = hook('posttooluse-fast-gates.mjs',
    { session_id: 'sess-a', tool_name: 'Edit', tool_input: { file_path: target } }, env);
  assert.equal(edit.status, 0, 'setup: the edit itself should be clean');

  const other = hook('stop-require-measurement.mjs', { session_id: 'sess-b' }, env);
  assert.equal(other.status, 0, `session B was blocked by session A's edit:\n${other.stderr}`);

  const own = hook('stop-require-measurement.mjs', { session_id: 'sess-a' }, env);
  assert.equal(own.status, 2, `session A should still be blocked, got ${own.status}`);
  assert.match(own.stderr, /preview\.html/);
});

/**
 * The two hooks must agree on where the ledger is, and may not get there by
 * importing each other: posttooluse-fast-gates.mjs does its work at the top
 * level, so importing it to ask for a path would run a PostToolUse pass as a
 * side effect. Two hand-copied path formulas drift, and when they do the Stop
 * hook silently sees no edits at all - which looks exactly like a clean
 * session.
 */
test('both hooks read the ledger path from one place', () => {
  const writer = readFileSync(join(ROOT, 'hooks/posttooluse-fast-gates.mjs'), 'utf8');
  const reader = readFileSync(join(ROOT, 'hooks/stop-require-measurement.mjs'), 'utf8');
  for (const [name, src] of [['posttooluse', writer], ['stop', reader]]) {
    assert.match(src, /from '\.\/_ledger\.mjs'/, `${name} does not import the shared ledger module`);
    assert.doesNotMatch(src, /edited-\$\{/, `${name} still builds the ledger filename itself`);
  }
  assert.doesNotMatch(reader, /posttooluse-fast-gates/,
    'the Stop hook imports the PostToolUse script, whose top-level work would run as a side effect');
});
