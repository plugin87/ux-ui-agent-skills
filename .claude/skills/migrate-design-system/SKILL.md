---
name: migrate-design-system
description: Map this token system to or from any external design system (Material Design 3, Apple HIG, Fluent, Carbon, Ant, shadcn/ui, Radix, Chakra, Mantine, Bootstrap…) — adopt their look, build on their stack, or migrate between systems. Use when the user mentions interop, migration, or a specific design-system/component-library bridge.
---

# Skill: Migrate / Interop Design System

Bridge to or from external design systems via a role-based crosswalk.

## Steps
1. Read `design-systems/interop-protocol.md` (Crosswalk Method, the three directions, headless-vs-styled guidance, verification).
2. Use the curated tables in `design-systems/crosswalk.md` for Material 3 / Apple HIG / Fluent 2 / Carbon / shadcn/ui / Radix. For others, derive a mapping with the Crosswalk Method (map by role/intent across 6 axes: color roles, type scale, spacing unit, radius, elevation, motion).
3. Choose the direction:
   - **FROM** external → our tokens (adopt their look): re-point `semantic.*`.
   - **TO** external stack (our components on their foundation): theme their primitives with our tokens.
   - **Migrate**: Audit → Map → Bridge (alias layer) → Verify, screen by screen.
4. **Verify** every mapped color pair for contrast (`scripts/contrast.py` / `a11y-audit`); confirm all 8 states + dark mode survive the mapping.

## Output
A crosswalk table (our token → their token → value note), a bridge plan if migrating, and verified token overrides. Render via `design-code`.
