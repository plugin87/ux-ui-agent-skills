/**
 * A fix that is not released does not exist, for anyone on the plugin route.
 *
 * Claude Code pins an installed plugin to its manifest `version`. It does not
 * compare commits. So a change merged to main without a version bump leaves
 * `claude plugin update` answering "already at the latest version", and every
 * plugin user keeps running the old code indefinitely.
 *
 * Found on 2026-10-08 by checking the installed copy rather than trusting the
 * merge: the H7 fix - the one that moved the taste step to where the model
 * reads it - had been on main for an hour and reached nobody. Reported as
 * fixed, shipped to no one.
 *
 * These tests do not know what "needs a release" means on their own; that is a
 * judgement. What they can hold is the mechanical half: the four version sites
 * agree, the changelog has an entry for the version about to be tagged, and the
 * entry is not a stub.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from '../helpers/run.mjs';

const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const json = (p) => JSON.parse(read(p));

const VERSION = json('package.json').version;

test('every version site carries the same version', () => {
  /* Four files state the version, and `validate_instruction_surface.py` fails
     when they disagree. This repeats that here so the failure arrives in the
     test run rather than only in a release that was already tagged. */
  const sites = {
    'package.json': json('package.json').version,
    '.claude-plugin/plugin.json': json('.claude-plugin/plugin.json').version,
    '.claude-plugin/marketplace.json (plugin entry)': json('.claude-plugin/marketplace.json').plugins[0].version,
  };
  const wrong = Object.entries(sites).filter(([, v]) => v !== VERSION);
  assert.deepEqual(wrong, [],
    `these disagree with package.json (${VERSION}): ${wrong.map(([k, v]) => `${k}=${v}`).join(', ')}`);

  const readme = read('README.md');
  assert.match(readme, new RegExp(`version-${VERSION.replace(/\./g, '\\.')}-`),
    `the README badge does not say ${VERSION}`);
  assert.match(readme, new RegExp(`\`v${VERSION.replace(/\./g, '\\.')}\``),
    `the README "Current release" line does not say ${VERSION}`);
});

test('the changelog has a real entry for this version', () => {
  /* release.yml extracts the tag's section with awk and uses it as the GitHub
     Release notes. A missing section falls back to auto-generated notes
     silently, so the release ships with no explanation of what changed. */
  const cl = read('CHANGELOG.md');
  const heading = `### \`v${VERSION}\``;
  assert.ok(cl.includes(heading),
    `CHANGELOG.md has no ${heading} section. release.yml would ship auto-generated notes instead.`);

  const body = cl.split(heading)[1].split('### `v')[0].trim();
  assert.ok(body.length > 120,
    `the ${heading} section is ${body.length} characters. That is a stub, not release notes.`);
});

test('the version is ahead of the newest released tag, or equal to it', () => {
  /* A version BEHIND the newest tag means someone bumped backwards, and the
     release workflow's tag-vs-package guard would reject the next tag with a
     message that does not explain which direction is wrong. */
  const cl = read('CHANGELOG.md');
  const versions = [...cl.matchAll(/^### `v(\d+)\.(\d+)\.(\d+)`/gm)]
    .map(m => [Number(m[1]), Number(m[2]), Number(m[3])]);
  assert.ok(versions.length >= 2, 'the changelog lists fewer than two versions');

  const [maj, min, pat] = VERSION.split('.').map(Number);
  const [pMaj, pMin, pPat] = versions[1];  // the one below the current entry
  const ahead = maj > pMaj
    || (maj === pMaj && min > pMin)
    || (maj === pMaj && min === pMin && pat > pPat);
  assert.ok(ahead,
    `package.json is ${VERSION}, which is not ahead of the previous changelog entry v${pMaj}.${pMin}.${pPat}`);
});

/**
 * A duplicate key in a manifest is silent: JSON.parse keeps the last one, and
 * `claude plugin validate` passes. The marketplace entry carried TWO `version`
 * keys from 2026-10-06 until this was written - at different indents, so the eye
 * skipped them too. Both happened to hold the same value, which is luck: a bump
 * that edited one and missed the other would have published a manifest whose
 * visible version was not the one in force.
 */
test('no manifest declares the same key twice', () => {
  for (const f of ['.claude-plugin/plugin.json', '.claude-plugin/marketplace.json', 'package.json']) {
    const dupes = [];
    const seen = (pairs) => {
      const counts = {};
      for (const [k] of pairs) counts[k] = (counts[k] || 0) + 1;
      for (const [k, n] of Object.entries(counts)) if (n > 1) dupes.push(`${f}: ${k} x${n}`);
      return Object.fromEntries(pairs);
    };
    // JSON.parse has no object_pairs_hook, so walk the text for repeated keys
    // at the same nesting depth instead.
    const text = read(f);
    const stack = [new Set()];
    let depth = 0, inStr = false, esc = false, key = '', collecting = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (esc) { if (collecting) key += c; esc = false; continue; }
      if (c === '\\') { esc = true; continue; }
      if (c === '"') {
        if (inStr) {
          inStr = false;
          if (collecting) {
            // a key is a string immediately followed by a colon
            const rest = text.slice(i + 1).match(/^\s*:/);
            if (rest) {
              if (stack[depth].has(key)) dupes.push(`${f}: "${key}" appears twice in the same object`);
              stack[depth].add(key);
            }
          }
          collecting = false; key = '';
        } else { inStr = true; collecting = true; }
        continue;
      }
      if (inStr) { if (collecting) key += c; continue; }
      if (c === '{') { depth++; stack[depth] = new Set(); }
      else if (c === '}') { depth--; }
    }
    assert.deepEqual(dupes, [], dupes.join('; '));
    void seen;
  }
});
