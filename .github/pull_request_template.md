## What changed, and why

<!-- The diff shows what. Say why, and what you decided against. -->

## Gate output

<!-- Paste the real run. Do not describe it. If it could not run, say which gate and why. -->

```
$ node scripts/accuracy_report.mjs

$ npm run test:gates

```

## Checklist

- [ ] `node scripts/accuracy_report.mjs` is green, and the output is pasted above
- [ ] `npm run test:gates` is green (every gate still rejects its broken fixture)
- [ ] No emoji anywhere: UI, code, JSON, copy, comments, commit messages
- [ ] No hardcoded hex, px, or timing outside a commented `ds-allow-hardcode` exception
- [ ] Every number in the description and the docs was measured, not remembered
- [ ] If this adds a gate: a fixture in `tests/fixtures/bad/`, a meta-test asserting exit 1 for the right reason, and the count bumped in `tests/meta/registry.test.mjs`
- [ ] If this adds a component: the eight states, a harness under `examples/component-states/`, and a row in the `CLAUDE.md` router
- [ ] Version impact named below

**Version impact:** patch / minor / major (see `workflows/governance.md`)

## What is still open

<!-- Written down beats implied. If part of this is deliberately unfinished, say so here. -->
