#!/usr/bin/env node
/**
 * ux-ui-agent-skills as an MCP server.
 *
 * The kit's gates are plain Node and Python and never depended on which agent
 * was reading - that is why `AGENTS.md` works for Codex and Cursor. This takes
 * the same half one step further: any MCP client can now RUN the gates, not
 * just read the doctrine.
 *
 * ## Why this speaks JSON-RPC directly
 *
 * The kit ships with `"dependencies": {}` and says so on its front page. Adding
 * an SDK to expose it would make that false for every install, so the protocol
 * is implemented here: MCP is JSON-RPC 2.0 over stdio with four methods that
 * matter, and the whole handshake is forty lines. Written against the
 * 2025-06-18 specification, read rather than remembered.
 *
 * ## What it refuses to do
 *
 * It runs gates and returns what they printed. It does not summarise them, does
 * not convert a failure into advice, and does not report a number no gate
 * produced. The kit's first rule is "never state a number you did not measure",
 * and a server that paraphrases its gates would be the most convenient place in
 * the system to break it.
 *
 *   node mcp/server.mjs            # stdio, for an MCP client
 *   node mcp/server.mjs --selftest # exercise the handshake and every tool
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';
import { catalogue, byName, KIT } from './gates.mjs';

const PROTOCOL = '2025-06-18';
const pkg = JSON.parse(readFileSync(join(KIT, 'package.json'), 'utf8'));

/* ------------------------------------------------------------------ tools */

const TOOLS = [
  {
    name: 'list_gates',
    title: 'List the objective gates',
    description:
      'Every gate this kit can run, what each one measures, and whether it needs a browser. '
      + 'Call this first: the gate names it returns are what run_gate accepts.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'run_gate',
    title: 'Run one gate',
    description:
      'Run a single gate against files or directories and return exactly what it printed, '
      + 'with its exit code. Exit 0 means it looked and found nothing wrong; 1 means it found '
      + 'something; 2 means it could not look - a path that does not exist is never a pass. '
      + 'A render gate with no browser installed FAILS here rather than skipping, so a clean '
      + 'result always means something was measured.',
    inputSchema: {
      type: 'object',
      properties: {
        gate: { type: 'string', description: 'A gate name from list_gates, such as verify_states.' },
        paths: {
          type: 'array', items: { type: 'string' }, minItems: 1,
          description: 'Files or directories to measure, absolute or relative to the working directory.',
        },
        args: {
          type: 'array', items: { type: 'string' },
          description: 'Extra flags the gate accepts, such as --dark or --scale=1.25.',
        },
      },
      required: ['gate', 'paths'],
      additionalProperties: false,
    },
  },
  {
    name: 'review_ui',
    title: 'Run every applicable gate',
    description:
      'Run every gate that applies to the given paths and return a per-gate verdict with the '
      + 'full output of each failure. This is the "did I get this right" call. It is all-or-nothing '
      + 'on purpose: there is no partial credit and no score. It measures objective correctness - '
      + 'tokens, accessibility, drift - and says nothing about whether the work is any good.',
    inputSchema: {
      type: 'object',
      properties: {
        paths: { type: 'array', items: { type: 'string' }, minItems: 1 },
        tokens: { type: 'string', description: 'Optional path to the project\'s token JSON or theme CSS, for the gates that need one.' },
        skip_browser: { type: 'boolean', description: 'Run only the gates that read files. Use when no browser is installed; the result then covers less.' },
      },
      required: ['paths'],
      additionalProperties: false,
    },
  },
  {
    name: 'get_doctrine',
    title: 'Read a rule from the kit',
    description:
      'The kit\'s written doctrine: the rules an agent should build to before it generates. '
      + 'Topics are tokens, typography, components, accessibility, frameworks, taste, '
      + 'review, brand, and agents (the whole brief). Read the relevant one BEFORE building, '
      + 'not after a gate fails.',
    inputSchema: {
      type: 'object',
      properties: { topic: { type: 'string', description: 'One of the topics named above.' } },
      required: ['topic'],
      additionalProperties: false,
    },
  },
  {
    name: 'get_design_system',
    title: 'Read a named design system',
    description:
      'One of the kit\'s brand-grade design system specs: visual theme, colour roles with hex, '
      + 'typography, spacing, components, motion. Call with no name to list what is available.',
    inputSchema: {
      type: 'object',
      properties: { name: { type: 'string', description: 'A system name such as stripe or linear. Omit to list them all.' } },
      additionalProperties: false,
    },
  },
  {
    name: 'get_tokens',
    title: 'Read the token source',
    description:
      'The kit\'s DTCG design tokens - colour, typography, spacing, motion, sizing and the rest - '
      + 'as the starting point for a project theme. Call with no file to list what is available.',
    inputSchema: {
      type: 'object',
      properties: { file: { type: 'string', description: 'A token file such as colors or spacing. Omit to list them all.' } },
      additionalProperties: false,
    },
  },
];

/* --------------------------------------------------------------- handlers */

const text = (s, isError = false) => ({ content: [{ type: 'text', text: s }], isError });

/** Run a gate the way the kit insists gates are run. */
function runGate(gate, paths, extra = []) {
  const g = byName(gate);
  if (!g) {
    return { ok: false, out: `Unknown gate "${gate}". Call list_gates for the names it accepts.`, code: null };
  }
  const script = join(KIT, 'scripts', g.file);
  const r = spawnSync(g.runner, [script, ...paths, ...extra], {
    encoding: 'utf8',
    timeout: 300000,
    // Never optional. A render gate with no browser prints SKIPPED and exits 0,
    // and a "pass" from a run that measured nothing is the one failure this
    // whole kit is written against.
    env: { ...process.env, DS_REQUIRE_BROWSER: '1' },
  });
  const out = ((r.stdout || '') + (r.stderr || '')).trim();
  return { ok: r.status === 0, code: r.status, out, gate: g };
}

const DOCTRINE = {
  tokens: '.claude/rules/tokens-and-color.md',
  typography: '.claude/rules/typography-and-spacing.md',
  components: '.claude/rules/components.md',
  accessibility: '.claude/rules/accessibility.md',
  frameworks: '.claude/rules/frameworks.md',
  review: '.claude/rules/review-and-research.md',
  brand: '.claude/rules/brand-and-operations.md',
  taste: 'taste/design-taste.md',
  agents: 'AGENTS.md',
};

function handle(name, args) {
  if (name === 'list_gates') {
    const c = catalogue();
    const line = (g) => `${g.name}${g.browser ? '  [needs a browser]' : ''}\n    ${g.measures}`;
    return text(
      `${c.length} gates. ${c.filter(g => g.browser).length} open a real browser; `
      + `the rest read files.\n\n${c.map(line).join('\n\n')}\n\n`
      + 'Exit codes: 0 looked and found nothing, 1 found something, 2 could not look.');
  }

  if (name === 'run_gate') {
    const { gate, paths, args: extra = [] } = args;
    const missing = paths.filter(p => !existsSync(p));
    if (missing.length) {
      return text(`Not found: ${missing.join(', ')}\nNothing was measured. This is not a pass.`, true);
    }
    const r = runGate(gate, paths, extra);
    if (r.code === null && !r.gate) return text(r.out, true);
    return text(`${r.gate.name} exited ${r.code}\n\n${r.out}`, !r.ok);
  }

  if (name === 'review_ui') {
    const { paths, tokens, skip_browser } = args;
    const missing = paths.filter(p => !existsSync(p));
    if (missing.length) {
      return text(`Not found: ${missing.join(', ')}\nNothing was measured. This is not a pass.`, true);
    }
    const html = paths.some(p => statSync(p).isDirectory() || /\.html?$/i.test(p));
    const results = [];
    for (const g of catalogue()) {
      if (g.browser && skip_browser) continue;
      if (g.browser && !html) continue;                    // a render gate needs something to render
      if (g.name === 'validate_theme_refs' && !tokens) continue;  // it needs a theme to check against
      if (g.name === 'validate_tokens' || g.name === 'validate_contrast') {
        if (!tokens) continue;
        results.push({ g, r: runGate(g.name, [tokens]) });
        continue;
      }
      const extra = g.name === 'validate_theme_refs' ? ['--theme', tokens] : [];
      results.push({ g, r: runGate(g.name, extra.length ? [...extra, ...paths] : paths) });
    }
    const failed = results.filter(x => !x.r.ok);
    const head = `${results.length - failed.length}/${results.length} gates passed`
      + (skip_browser ? '  (browser gates skipped - this covers less)' : '');
    const body = results.map(x => `  ${x.r.ok ? 'PASS' : 'FAIL'}  ${x.g.name}`).join('\n');
    const detail = failed.length
      ? '\n\nFailures, in full:\n\n' + failed.map(x => `--- ${x.g.name} (exit ${x.r.code})\n${x.r.out}`).join('\n\n')
      : '';
    const scope = '\n\nThis is objective correctness only: tokens, accessibility, drift. '
      + 'It does not measure whether the work is any good, and no number here covers taste.';
    return text(`${head}\n\n${body}${detail}${scope}`, failed.length > 0);
  }

  if (name === 'get_doctrine') {
    const rel = DOCTRINE[String(args.topic || '').toLowerCase()];
    if (!rel) {
      return text(`Unknown topic "${args.topic}". Available: ${Object.keys(DOCTRINE).join(', ')}.`, true);
    }
    const p = join(KIT, rel);
    if (!existsSync(p)) return text(`${rel} is missing from this install.`, true);
    return text(readFileSync(p, 'utf8'));
  }

  if (name === 'get_design_system') {
    const dir = join(KIT, 'design-systems/library');
    if (!existsSync(dir)) return text('The design-system library is not in this install.', true);
    const all = readdirSync(dir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name).sort();
    if (!args.name) return text(`${all.length} systems:\n\n${all.join(', ')}`);
    const p = join(dir, args.name, 'DESIGN.md');
    if (!existsSync(p)) {
      const near = all.filter(n => n.includes(String(args.name).toLowerCase())).slice(0, 8);
      return text(`No system "${args.name}".${near.length ? ` Did you mean: ${near.join(', ')}?` : ''}`, true);
    }
    return text(readFileSync(p, 'utf8'));
  }

  if (name === 'get_tokens') {
    const dir = join(KIT, 'tokens');
    if (!existsSync(dir)) return text('The token source is not in this install.', true);
    const all = readdirSync(dir).filter(f => f.endsWith('.json')).map(f => f.replace(/\.json$/, '')).sort();
    if (!args.file) return text(`${all.length} token files:\n\n${all.join(', ')}`);
    const p = join(dir, `${String(args.file).replace(/\.json$/, '')}.json`);
    if (!existsSync(p)) return text(`No token file "${args.file}". Available: ${all.join(', ')}.`, true);
    return text(readFileSync(p, 'utf8'));
  }

  return null;   // unknown tool: a protocol error, not a tool error
}

/* -------------------------------------------------------------- transport */

const send = (msg) => process.stdout.write(JSON.stringify(msg) + '\n');
const reply = (id, result) => send({ jsonrpc: '2.0', id, result });
const fail = (id, code, message) => send({ jsonrpc: '2.0', id, error: { code, message } });

function dispatch(msg) {
  const { id, method, params } = msg;

  if (method === 'initialize') {
    /* The spec: respond with the client's version when supported, otherwise the
       latest this server speaks. Echoing a version blindly would claim support
       for a protocol this file has never been read against. */
    const asked = params?.protocolVersion;
    return reply(id, {
      protocolVersion: asked === PROTOCOL ? asked : PROTOCOL,
      capabilities: { tools: { listChanged: false } },
      serverInfo: { name: 'ux-ui-agent-skills', title: 'UX/UI design system gates', version: pkg.version },
      instructions:
        'Design-system doctrine and the objective gates that check work against it.\n\n'
        + 'Before building a screen: get_doctrine for the rules that apply, and get_tokens for the '
        + 'token source.\n'
        + 'After building: review_ui on what you produced, and report what it printed.\n\n'
        + 'Never state a contrast ratio, a WCAG verdict or a pass rate that a gate did not just '
        + 'print. If you have not run it, "not verified yet" is the correct answer and is always '
        + 'acceptable. A gate exiting 2 means it could not look - that is not a pass.',
    });
  }

  if (method === 'notifications/initialized' || method?.startsWith('notifications/')) return;
  if (method === 'ping') return reply(id, {});
  if (method === 'tools/list') return reply(id, { tools: TOOLS });

  if (method === 'tools/call') {
    const tool = TOOLS.find(t => t.name === params?.name);
    if (!tool) return fail(id, -32602, `Unknown tool: ${params?.name}`);
    try {
      const result = handle(params.name, params.arguments || {});
      if (!result) return fail(id, -32602, `Unknown tool: ${params.name}`);
      return reply(id, result);
    } catch (e) {
      // A thrown error is the tool failing, not the protocol failing.
      return reply(id, text(`${tool.name} could not run: ${e.message}`, true));
    }
  }

  if (id !== undefined) fail(id, -32601, `Method not found: ${method}`);
}

/* ------------------------------------------------------------------- main */

if (process.argv.includes('--selftest')) {
  const { selftest } = await import('./selftest.mjs');
  process.exit(await selftest(dispatch, TOOLS) ? 0 : 1);
}

let buf = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  buf += chunk;
  let i;
  while ((i = buf.indexOf('\n')) !== -1) {
    const line = buf.slice(0, i).trim();
    buf = buf.slice(i + 1);
    if (!line) continue;
    try { dispatch(JSON.parse(line)); }
    catch { send({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }); }
  }
});
process.stdin.on('end', () => process.exit(0));
