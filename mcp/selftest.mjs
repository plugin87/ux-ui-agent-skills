/**
 * Exercise the server without a client.
 *
 * An MCP server that nobody has spoken to is a plausible-looking file. This
 * drives the real handshake and calls every tool it advertises, so "it works"
 * is something that was run rather than something that was written.
 */
export async function selftest(dispatch, TOOLS) {
  const sent = [];
  const realWrite = process.stdout.write.bind(process.stdout);
  process.stdout.write = (s) => { sent.push(s); return true; };
  const pop = () => { const last = sent[sent.length - 1]; return last ? JSON.parse(last) : null; };

  const checks = [];
  const check = (name, ok, detail = '') => checks.push({ name, ok, detail });

  // --- handshake
  dispatch({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18' } });
  let r = pop();
  check('initialize answers with the protocol version', r?.result?.protocolVersion === '2025-06-18', JSON.stringify(r?.result?.protocolVersion));
  check('initialize declares the tools capability', Boolean(r?.result?.capabilities?.tools));
  check('initialize names the server and its version', Boolean(r?.result?.serverInfo?.name && r?.result?.serverInfo?.version));
  check('instructions carry the measurement rule', /never state/i.test(r?.result?.instructions || ''));

  // An unknown protocol version must get this server's own, not an echo.
  dispatch({ jsonrpc: '2.0', id: 2, method: 'initialize', params: { protocolVersion: '1999-01-01' } });
  check('an unsupported version is answered with ours, not echoed', pop()?.result?.protocolVersion === '2025-06-18');

  dispatch({ jsonrpc: '2.0', method: 'notifications/initialized' });
  check('the initialized notification draws no reply', sent.length === 2);

  // --- tools/list
  dispatch({ jsonrpc: '2.0', id: 3, method: 'tools/list' });
  r = pop();
  const tools = r?.result?.tools || [];
  check('tools/list returns every tool', tools.length === TOOLS.length, `${tools.length}`);
  check('every tool has a name, description and object schema',
    tools.every(t => t.name && t.description && t.inputSchema?.type === 'object'));

  // --- every tool actually runs
  const call = (name, args = {}) => {
    dispatch({ jsonrpc: '2.0', id: 99, method: 'tools/call', params: { name, arguments: args } });
    return pop()?.result;
  };

  let res = call('list_gates');
  check('list_gates names a real gate', /verify_states/.test(res?.content?.[0]?.text || ''));
  check('list_gates says which gates need a browser', /needs a browser/.test(res?.content?.[0]?.text || ''));

  res = call('get_doctrine', { topic: 'components' });
  check('get_doctrine returns the component rules', /Component/i.test(res?.content?.[0]?.text || ''));
  res = call('get_doctrine', { topic: 'nonsense' });
  check('an unknown doctrine topic is an error with the list', res?.isError === true && /Available:/.test(res.content[0].text));

  res = call('get_tokens');
  check('get_tokens lists the token files', /colors/.test(res?.content?.[0]?.text || ''));
  res = call('get_tokens', { file: 'spacing' });
  check('get_tokens returns real DTCG', /\$value/.test(res?.content?.[0]?.text || ''));

  res = call('get_design_system');
  check('get_design_system lists the library', /\b\d+ systems/.test(res?.content?.[0]?.text || ''));
  res = call('get_design_system', { name: 'definitely-not-a-system' });
  check('an unknown system is an error', res?.isError === true);

  // --- the part that matters: a gate that cannot look must not read as a pass
  res = call('run_gate', { gate: 'check_no_emoji', paths: ['./does-not-exist-9f1c.html'] });
  check('a missing path is refused, not passed', res?.isError === true && /not a pass/i.test(res.content[0].text));

  res = call('run_gate', { gate: 'not_a_gate', paths: ['package.json'] });
  check('an unknown gate names list_gates', res?.isError === true && /list_gates/.test(res.content[0].text));

  res = call('run_gate', { gate: 'check_no_emoji', paths: ['tests/fixtures/bad/emoji.html'] });
  check('a gate that finds something reports isError and its output',
    res?.isError === true && /exited 1/.test(res.content[0].text));

  res = call('run_gate', { gate: 'check_no_emoji', paths: ['tests/fixtures/good/clean.html'] });
  check('a clean file passes', res?.isError !== true && /exited 0/.test(res.content[0].text));

  res = call('review_ui', { paths: ['tests/fixtures/good/clean-panel.html'], skip_browser: true });
  const body = res?.content?.[0]?.text || '';
  check('review_ui reports a per-gate verdict', /gates passed/.test(body) && /PASS /.test(body));
  check('review_ui states its own scope', /does not measure whether the work is any good/.test(body));
  check('review_ui says when the browser gates were skipped', /covers less/.test(body));

  // --- protocol errors stay protocol errors
  dispatch({ jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'nope' } });
  check('an unknown tool is a JSON-RPC error, not a tool result', pop()?.error?.code === -32602);
  dispatch({ jsonrpc: '2.0', id: 5, method: 'resources/list' });
  check('an unsupported method is method-not-found', pop()?.error?.code === -32601);

  process.stdout.write = realWrite;

  const bad = checks.filter(c => !c.ok);
  for (const c of checks) console.log(`  ${c.ok ? 'PASS' : 'FAIL'}  ${c.name}${c.detail ? `  (${c.detail})` : ''}`);
  console.log(`\n${checks.length - bad.length}/${checks.length} checks passed`);
  return bad.length === 0;
}
