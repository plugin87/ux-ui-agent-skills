/**
 * Every documented npx command runs an exact version (scripts/pin_version.mjs).
 * The check is proven against the forms it exists to catch, including the one
 * that was worse than unpinned: `npx ux-ui-skills`, a bin name that is not a
 * package on npm, so npx would resolve it against the registry.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { audit, KIT, SKILLS_CLI, PLAYWRIGHT } from '../../scripts/pin_version.mjs';
import { node } from '../helpers/run.mjs';

test('every documented npx command in the repo is pinned to this release', () => {
  const r = node('pin_version.mjs', ['--check']);
  assert.equal(r.status, 0, r.out);
});

test('unpinned, stale and squattable forms are all caught and rewritten', () => {
  const bad = [
    ['npx ux-ui-agent-skills init', `npx ux-ui-agent-skills@${KIT} init`],
    ['npx -y ux-ui-agent-skills@1.0.0 init', `npx -y ux-ui-agent-skills@${KIT} init`],
    ['npx ux-ui-agent-skills@latest init', `npx ux-ui-agent-skills@${KIT} init`],
    ['npx ux-ui-skills observe', `npx ux-ui-agent-skills@${KIT} observe`],
    ['`npx\nux-ui-agent-skills init` wrapped in prose', `\`npx\nux-ui-agent-skills@${KIT} init\` wrapped in prose`],
    ['npx\nskills add x', `npx\nskills@${SKILLS_CLI} add x`],
    ['"--package=ux-ui-agent-skills", "ux-ui-mcp"', `"--package=ux-ui-agent-skills@${KIT}", "ux-ui-mcp"`],
    ['npx skills add plugin87/ux-ui-agent-skills', `npx skills@${SKILLS_CLI} add plugin87/ux-ui-agent-skills`],
    ['npm i -D playwright', `npm i -D playwright@${PLAYWRIGHT}`],
  ];
  for (const [input, want] of bad) {
    const r = audit(input);
    assert.equal(r.stale.length, 1, `not flagged: ${input}`);
    assert.equal(r.out, want);
  }
});

test('names that only start like the package are left alone', () => {
  for (const ok of ['ux-ui-agent-skills-foo', 'see ux-ui-skills.md', `npx ux-ui-agent-skills@${KIT} init`,
    'npx ux-ui-agent-skills@${version} init']) {
    assert.equal(audit(ok).stale.length, 0, `flagged by mistake: ${ok}`);
  }
});
