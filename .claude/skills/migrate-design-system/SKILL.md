---
name: migrate-design-system
description: Map this token system to or from any external design system (Material Design 3, Apple HIG, Fluent, Carbon, Ant, shadcn/ui, Radix, Chakra, Mantine, Bootstrap…). Adopt their look, build on their stack, or migrate between systems. Use when the user mentions interop, migration, or a specific design-system/component-library bridge.
# `invocation:` was not a field Claude Code reads - unknown frontmatter keys are
# ignored without an error, so these six were auto-invocable the whole time they
# were marked user-only. This is the field that actually does it.
disable-model-invocation: true
---

# Skill: Migrate / Interop Design System

## Requirements

This skill needs the full UX/UI Agent Skills kit: the gates, the references and
the design-system library. Install it with `npx ux-ui-agent-skills@3.1.0 init`
or as the Claude Code plugin. `npx skills@1.7.6 add` copies the skill folder and
nothing else. Installed that way, this skill runs in **guidance-only mode**: no gate
runs, so it gives no verdict.

> **Step 0: is the kit here?** Check once:
> `ls ${CLAUDE_SKILL_DIR}/../../../tokens >/dev/null 2>&1 && echo KIT_OK || echo KIT_MISSING`
> On `KIT_MISSING`, open your reply with: "Guidance-only mode: the UX/UI Agent
> Skills kit is not installed here, so no gate ran and nothing below is
> measured." Then work from this file and general practice, under three rules.
> Do not guess or cite the contents of a kit file you could not open. State no
> measured number (no contrast ratio, no N/N, no "passes WCAG"): write "not
> verified" where one would go. End with a line `Skipped (kit not installed):`
> that names every gate script this file tells you to run, then the install
> command above.

Bridge to or from external design systems via a role-based crosswalk.

## Steps
1. Read `${CLAUDE_SKILL_DIR}/../../../design-systems/interop-protocol.md` (Crosswalk Method, the three directions, headless-vs-styled guidance, verification).
2. Use the curated tables in `${CLAUDE_SKILL_DIR}/../../../design-systems/crosswalk.md` for Material 3 / Apple HIG / Fluent 2 / Carbon / shadcn/ui / Radix. For others, derive a mapping with the Crosswalk Method (map by role/intent across 6 axes: color roles, type scale, spacing unit, radius, elevation, motion).
3. Choose the direction:
   - **FROM** external → our tokens (adopt their look): re-point `semantic.*`.
   - **TO** external stack (our components on their foundation): theme their primitives with our tokens.
   - **Migrate**: Audit → Map → Bridge (alias layer) → Verify, screen by screen.
4. **Verify** every mapped color pair for contrast (`${CLAUDE_SKILL_DIR}/../../../scripts/contrast.py` / `a11y-audit`); confirm all 8 states + dark mode survive the mapping.

## Output
A crosswalk table (our token → their token → value note), a bridge plan if migrating, and verified token overrides. Render via `design-code`.
