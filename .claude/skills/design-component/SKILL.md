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
