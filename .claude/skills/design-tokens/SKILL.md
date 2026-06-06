---
name: design-tokens
description: Generate, extend, or audit design tokens in DTCG format with the 3-tier architecture (primitive → semantic → component). Use when the user wants a color palette, type scale, spacing/shadow/radius/motion tokens, multi-brand theming, or wants to validate token files. Covers colors, typography, spacing, shadows, borders, breakpoints, motion, gradients, opacity, blur, sizing, states, theming.
---

# Skill: Design Tokens

Produce and maintain DTCG (`$type`/`$value`) tokens following the project's 3-tier system.

## Steps
1. Read `CLAUDE.md` → "Token System" + "Color/Typography/Spacing Guidelines" for the rules (4px base, Major Third scale, OKLCH palette generation, dark-mode-at-semantic-layer).
2. Read the relevant existing files in `tokens/` to match structure: `colors.json`, `typography.json`, `spacing.json`, `shadows.json`, `borders.json`, `breakpoints.json`, `motion.json`, `gradients.json`, `opacity.json`, `blur.json`, `sizing.json`, `states.json`, `theming.json`.
3. Generate/extend tokens:
   - Primitives = raw values (never used directly). Semantic = purpose aliases. Component = component-scoped.
   - New palettes: generate 11 OKLCH shades; verify 500 ≥ 4.5:1 on white (text), 600 ≥ 3:1 (UI) using the `a11y-audit` skill / `scripts/contrast.py`.
   - Multi-brand/density → `theming.json`.
4. **Validate**: run `python3 scripts/validate_tokens.py` (JSON validity + alias resolution).

## Output
DTCG JSON. Preserve `$description` on every token. Reference, never hardcode.
