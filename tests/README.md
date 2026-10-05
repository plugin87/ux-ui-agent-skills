# tests/ — the layer that checks the gates

The kit's 47 objective gates all point at `examples/` that already pass. That
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

- **`validate_theme_refs.py` scanned `examples/golden` and nothing else** until
  2026-09-15, so a `var()` pointing at a token no theme defines survived
  everywhere else. That is how `--space-7` reached the front door: the whole
  `gap` shorthand was invalid, the stat labels collided, and every gate still
  reported green. It takes repeated `--theme` files now, counts a custom
  property defined inside the scanned file as defined, and the gate runs it
  across the templates, harnesses, demos and the front door.
- **`design_systems.py` and `accuracy_report.mjs` are still hardwired to the repo
  root.** The other three - `validate_component_spec.py`,
  `validate_instruction_surface.py`, `validate_template.py` - take `--root` now,
  and `meta/root-scoped.test.mjs` uses it to show each one refusing a broken
  copy. `accuracy_report.mjs` is the runner itself, so pointing it elsewhere is a
  different feature; `design_systems.py` reads a library that only exists here.
- **`build_tokens.mjs` is a generator first.** Without `--check` it still writes
  what it can and exits 0, because that is what a generator should do; the gate
  runs it with `--check`, which turns a dropped reference into a failure. `unit/`
  covers both modes, plus the output contract: a directory build emits the whole
  system rather than colour alone, and no composite token reaches the CSS as
  `[object Object]` or a stray brace. Those last two exist because the bugs
  shipped — the colour-only directory build stood for four releases while CI ran
  the command and checked only its exit status.
- **Taste is still not covered.** `slop_tells` and `taste_audit` only fail on
  HIGH findings under `--strict`; MED and LOW never fail anything, by design.
  These tests confirm the HIGH signals fire. They say nothing about whether the
  work is good.
