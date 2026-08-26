# tests/ — the layer that checks the gates

The kit's 37 objective gates all point at `examples/` that already pass. That
proves a gate says yes to good work. It never proves the gate can still say no.

This directory supplies the other half: input built to be wrong, and the
requirement that each gate rejects it for the right reason.

```
tests/
  helpers/run.mjs        spawnSync wrapper that keeps the NUMERIC exit status
  helpers/preflight.mjs  hard-fails the suite when no browser is available
  meta/                  every gate must REJECT a broken fixture, and ACCEPT a clean one
  unit/                  the arithmetic under the contrast gates; build_tokens output
  cli/                   bin/cli.js and the project scaffold, end to end
  fixtures/bad/          deliberately broken - one file per signal
  fixtures/good/         clean-panel.html survives all sixteen render gates, light and dark
```

## Running it

```bash
npm run test:unit    # no browser: unit + CLI + registry consistency
npm run test:gates   # everything, including the render meta-gates
```

`test:gates` needs Playwright and real Chrome (six gates launch
`channel: 'chrome'`). `helpers/preflight.mjs` fails loudly if either is missing,
because a suite that skips is a suite that proves nothing.

## What a meta-test asserts

`rejects()` requires exit status exactly 1, and refuses three near-misses that
would otherwise look like a detection:

- a **usage message** (nine gates print one and exit 0 when handed nothing, so a
  typo'd fixture path would read as clean),
- a **SKIPPED** line (the gate never opened a browser),
- exit 1 whose output does not match the signal under test (a crash, not a find).

`accepts()` applies the same filters in reverse.

## Fixtures must not poison the real gates

`fixtures/bad/` contains an emoji, raw hex, and a failing contrast pair on
purpose. None of the repo-wide default scans reach into `tests/`, and
`meta/guards.test.mjs` holds that in place — if a default scan ever grows to
cover this directory, CI would go red for the wrong reason.

## Known blind spots

Not everything is coverable, and pretending otherwise is the failure mode this
directory exists to prevent.

- **Five gates are hardwired to the repo root** and ignore argv, so they cannot
  be pointed at a fixture: `validate_component_spec.py`,
  `validate_instruction_surface.py`, `validate_template.py`, `design_systems.py`,
  and `accuracy_report.mjs`. Making them testable means giving the first three a
  `--root` flag. Not done.
- **`verify_keyboard.mjs` only audits controls already in the tab order** — it
  filters on `tabbable(el)` before checking anything. The classic
  `<div role="button">` with no `tabindex` is therefore invisible to it. The
  fixture here (`bad/dead-key-toggle.html`) exercises the dead-key signal
  instead, which the gate does detect.
- **`build_tokens.mjs` has no failure mode.** It is a generator: it never exits
  non-zero and silently drops a reference it cannot resolve. `unit/` asserts its
  output instead — specifically that a broken alias is dropped rather than
  emitted as a literal `{…}`.
- **Taste is still not covered.** `slop_tells` and `taste_audit` only fail on
  HIGH findings under `--strict`; MED and LOW never fail anything, by design.
  These tests confirm the HIGH signals fire. They say nothing about whether the
  work is good.
