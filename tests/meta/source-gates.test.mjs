/**
 * Meta-gate: the source-reading gates must still REJECT a broken fixture.
 *
 * Separate from browser-gates.test.mjs because these need no browser, and
 * separate from python-gates.test.mjs because they are Node. A gate that costs
 * nothing to run is the one most likely to be quietly turned into a no-op, so
 * each signal it claims gets its own negative fixture here.
 */
import { test } from 'node:test';
import { node, rejects, accepts, F } from '../helpers/run.mjs';

test('lint_intent_source rejects a destructive label given a primary variant', () => {
  rejects(node('lint_intent_source.mjs', [F('bad/blue-delete-source.tsx')]),
    /\[1 wrong-intent\].*"Delete project" is destructive but given a primary variant/);
});

test('lint_intent_source rejects an affirmative label given a danger variant', () => {
  rejects(node('lint_intent_source.mjs', [F('bad/blue-delete-source.tsx')]),
    /\[2 inverted\].*"Save changes" is affirmative but given a danger variant/);
});

test('lint_intent_source rejects a destructive control that declares no intent at all', () => {
  // The shape of the real bug: <Button>Revoke API key</Button> against a
  // component whose default variant is primary.
  rejects(node('lint_intent_source.mjs', [F('bad/blue-delete-source.tsx')]),
    /\[3 unmarked\].*"Revoke API key" is destructive but declares no intent/);
});

test('lint_intent_source accepts a file where every destructive action declares itself', () => {
  accepts(node('lint_intent_source.mjs', [F('good/intent-source.tsx')]),
    /every destructive action declares its intent/);
});

test('lint_intent_source honours ds-allow-intent on the line above the control', () => {
  // bad/blue-delete-source.tsx carries an annotated "Remove label" that must NOT
  // be reported, so the rejection above has to come from the other three.
  const res = node('lint_intent_source.mjs', [F('bad/blue-delete-source.tsx')]);
  if (/Remove label/.test(res.out)) {
    throw new Error(`the ds-allow-intent opt-out was ignored\n${res.out}`);
  }
});

test('lint_intent_source reads a variant written after a prop containing >', () => {
  // good/intent-source.tsx has <Button onClick={() => window.close()}
  // variant="destructive">Delete workspace</Button>. A tag scanner that stops at
  // the first ">" drops the variant and reports a false positive on correct
  // code. This asserts the scanner is brace-aware.
  const res = node('lint_intent_source.mjs', [F('good/intent-source.tsx')]);
  if (/Delete workspace/.test(res.out)) {
    throw new Error(`a variant after an arrow-function prop was not read\n${res.out}`);
  }
});

test('lint_intent_source does not flag a bare Cancel', () => {
  // "Cancel" is the dismiss button on every dialog in the world; only
  // "cancel subscription" and friends are destructive. Held identical to
  // lint_intent.mjs's vocabulary.
  const res = node('lint_intent_source.mjs', [F('good/intent-source.tsx')]);
  if (/"Cancel"/.test(res.out)) throw new Error(`bare Cancel was treated as destructive\n${res.out}`);
});
