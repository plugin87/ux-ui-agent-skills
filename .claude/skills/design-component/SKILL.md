---
name: design-component
description: Design a UI component spec to the house quality bar — anatomy, variants, sizes, the 8 states, token mapping, and accessibility. Use when the user wants to design or document a component (button, input, tabs, toast, combobox, date picker, modal, etc.) at the spec level before or alongside code. For generating framework code, use design-code.
---

# Skill: Design Component

Produce a complete component specification matching the project format.

## Steps
1. Read `CLAUDE.md` → "Component Guidelines" (quality bar, the 8-state table) and "Atomic Design".
2. Check if it already exists: `components/atoms.md`, `molecules.md`, `organisms.md`, `templates.md`, `navigation.md`, `feedback.md`, `forms-advanced.md`, `overlays.md`. Match the existing spec format.
3. Pull the ARIA pattern from `accessibility/aria-patterns.md` and contrast/target rules from `accessibility/wcag-checklist.md`.
4. Map every value to tokens (`tokens/*.json`) — sizes via `sizing.json`, states via `states.json`.
5. Apply visual judgment from `taste/design-taste.md` (states, focus, no slop).
6. Optional fast start: `python3 scripts/scaffold_component.py "<Name>"` to emit a stub, then fill it in.

## Output
Spec with: anatomy diagram, variants table, sizes table, all 8 applicable states, token mapping, accessibility (role/keyboard/SR), and a note to render via `frameworks/adapter-protocol.md`.

## Accuracy — verify every state, don't assume (mandatory when code is produced)
A component is only "correct" when **every variant × state** renders right — not just the resting default. Build a **states harness**: render the component in each applicable state (default, hover, focus, active, disabled, loading `aria-busy`, error `aria-invalid`, selected `aria-pressed`/`aria-selected`) × each variant in one HTML file (see `examples/component-states/button.html`). Then RUN the gates and report their real output (CLAUDE.md → Verification Protocol):
- `node scripts/verify_states.mjs <harness> [--dark]` — contrast of every element in default/hover/focus
- `node scripts/axe_audit.mjs <harness> [--dark]` — ARIA/role/name/label correctness
- `node scripts/measure_render.mjs <harness> [--dark]` — every text element AA
- overlays/modals also: `node scripts/verify_focustrap.mjs <harness> --open=<trigger>`
Every state must pass in light AND dark before the component is "done". Never claim a state is correct without a gate proving it.
