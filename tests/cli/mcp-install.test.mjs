/**
 * The install command in the docs has to be the one that works.
 *
 * It is the single line a marketplace listing carries, the line someone pastes
 * once and never debugs. The first version shipped in the docs was:
 *
 *     npx -y ux-ui-agent-skills ux-ui-mcp
 *
 * This package's name is also one of its bin names, so npx resolved the bin
 * `ux-ui-agent-skills` and passed `ux-ui-mcp` to it as an argument. The result
 * is the installer CLI printing a help screen to stdout and an MCP client that
 * never completes a handshake - a failure that looks like the server being
 * broken rather than the command being wrong. Found by running the documented
 * command from an empty directory, which is the only place it shows.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT, run } from '../helpers/run.mjs';

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));

test('the package name collides with a bin name, which is why --package is needed', () => {
  /* If this ever stops being true the plain form would start working, and the
     docs could be simplified. Asserting it keeps the reason discoverable
     instead of leaving `--package=` looking like noise. */
  assert.ok(Object.keys(pkg.bin).includes(pkg.name),
    `${pkg.name} is no longer one of its own bin names - re-check whether --package= is still required`);
  assert.ok(pkg.bin['ux-ui-mcp'], 'the ux-ui-mcp bin is gone');
});

test('every documented npx invocation names the package explicitly', () => {
  const docs = ['README.md', 'docs/MCP.md', 'CHANGELOG.md', 'docs/GUIDE.md']
    .filter(f => existsSync(join(ROOT, f)));
  const bad = [];
  for (const f of docs) {
    const text = readFileSync(join(ROOT, f), 'utf8');
    for (const line of text.split('\n')) {
      if (!/npx\b/.test(line) || !/ux-ui-mcp/.test(line)) continue;
      // The explanation of the wrong form is allowed to quote it.
      if (/runs the \*installer CLI\*/.test(line)) continue;
      if (!/--package=/.test(line)) bad.push(`${f}: ${line.trim()}`);
    }
  }
  assert.deepEqual(bad, [],
    `these would run the installer CLI instead of the MCP server:\n  ${bad.join('\n  ')}`);
});

test('the MCP server answers a handshake through its own bin', { timeout: 60000 }, () => {
  /* Through the bin path, not through `node mcp/server.mjs`: the bin is what an
     install exposes and what the documented command reaches. */
  const bin = join(ROOT, pkg.bin['ux-ui-mcp']);
  assert.ok(existsSync(bin), `${pkg.bin['ux-ui-mcp']} does not exist`);

  // spawnSync directly: the shared helper does not pass stdin, and this server
  // only speaks when spoken to.
  const r = spawnSync('node', [bin], {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: 30000,
    input: JSON.stringify({
      jsonrpc: '2.0', id: 1, method: 'initialize',
      params: { protocolVersion: '2025-06-18', capabilities: {} },
    }) + '\n',
  });
  const first = (r.stdout || '').trim().split('\n')[0] || '';
  let msg;
  assert.doesNotThrow(() => { msg = JSON.parse(first); },
    `the bin did not answer with JSON. It printed:\n${first.slice(0, 200)}`);
  assert.equal(msg.result?.serverInfo?.name, pkg.name);
  assert.equal(msg.result?.serverInfo?.version, pkg.version,
    'the server reports a version other than the package it ships in');
  assert.ok(msg.result?.capabilities?.tools, 'the server does not declare the tools capability');
});

test('the MCP selftest passes', { timeout: 300000 }, () => {
  const r = run('node', ['mcp/server.mjs', '--selftest']);
  assert.equal(r.status, 0, `selftest failed:\n${r.out}`);
  assert.match(r.out, /checks passed/);
});

test('mcp/ ships in the package', () => {
  const files = pkg.files || [];
  assert.ok(files.includes('mcp/'),
    'package.json files does not list mcp/, so an npm install has no server to run');
  for (const f of ['server.mjs', 'gates.mjs', 'selftest.mjs']) {
    assert.ok(existsSync(join(ROOT, 'mcp', f)), `mcp/${f} is missing`);
  }
});

test('the server exposes only tools whose handler exists', () => {
  /* A tool advertised in tools/list and unhandled in the dispatcher answers
     "Unknown tool" to a client that found it in the list - the worst shape of
     error, because the client did exactly what it was told. */
  const src = readFileSync(join(ROOT, 'mcp/server.mjs'), 'utf8');
  const advertised = [...src.matchAll(/^    name: '([\w_]+)',/gm)].map(m => m[1]);
  assert.ok(advertised.length >= 5, `only ${advertised.length} tools parsed out of the TOOLS array`);
  for (const name of advertised) {
    assert.match(src, new RegExp(`name === '${name}'`),
      `${name} is advertised but has no handler`);
  }
});
