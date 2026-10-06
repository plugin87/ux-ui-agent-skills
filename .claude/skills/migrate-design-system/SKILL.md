---
name: migrate-design-system
description: Map this token system to or from any external design system (Material Design 3, Apple HIG, Fluent, Carbon, Ant, shadcn/ui, Radix, Chakra, Mantine, Bootstrap…) — adopt their look, build on their stack, or migrate between systems. Use when the user mentions interop, migration, or a specific design-system/component-library bridge.
# `invocation:` was not a field Claude Code reads - unknown frontmatter keys are
# ignored without an error, so these six were auto-invocable the whole time they
# were marked user-only. This is the field that actually does it.
disable-model-invocation: true
---

# Skill: Migrate / Interop Design System

> **Step 0 — is the kit here?** This skill reads files from the kit. Check once:
> `ls ${CLAUDE_SKILL_DIR}/../../../tokens >/dev/null 2>&1 && echo KIT_OK || echo KIT_MISSING`
> On `KIT_MISSING` only the skill folders were installed, which is what
> `npx skills add` does. Say so plainly, point the user at
> `npx ux-ui-agent-skills init` or the plugin install, and stop. Do not guess the
> contents of a file you could not open.

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
