---
name: design-tokens
description: Generate, extend, or audit design tokens in DTCG format with the 3-tier architecture (primitive → semantic → component). Use when the user wants a color palette, type scale, spacing/shadow/radius/motion tokens, multi-brand theming, or wants to validate token files. Covers colors, typography, spacing, shadows, borders, breakpoints, motion, gradients, opacity, blur, sizing, states, theming.
---

# Skill: Design Tokens

## Requirements

This skill needs the full UX/UI Agent Skills kit: the gates, the references and
the design-system library. Install it with `npx ux-ui-agent-skills@3.0.0 init`
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

Produce and maintain DTCG (`$type`/`$value`) tokens following the project's 3-tier system.

## Steps
1. Read `${CLAUDE_SKILL_DIR}/../../../.claude/rules/tokens-and-color.md` → "Token System" + "Color Guidelines" and `${CLAUDE_SKILL_DIR}/../../../.claude/rules/typography-and-spacing.md` for the rules (4px base, Major Third scale, OKLCH palette generation, dark-mode-at-semantic-layer).
2. Read the relevant existing files in `${CLAUDE_SKILL_DIR}/../../../tokens/` to match structure: `colors.json`, `typography.json`, `spacing.json`, `shadows.json`, `borders.json`, `breakpoints.json`, `motion.json`, `gradients.json`, `opacity.json`, `blur.json`, `sizing.json`, `states.json`, `theming.json`.
3. Generate/extend tokens:
   - Primitives = raw values (never used directly). Semantic = purpose aliases. Component = component-scoped.
   - New palettes: generate 11 OKLCH shades; verify 500 ≥ 4.5:1 on white (text), 600 ≥ 3:1 (UI) using the `a11y-audit` skill / `${CLAUDE_SKILL_DIR}/../../../scripts/contrast.py`.
   - Multi-brand/density → `theming.json`.
4. **Validate**: run `python3 ${CLAUDE_SKILL_DIR}/../../../scripts/validate_tokens.py` (JSON validity + alias resolution).

## Output
DTCG JSON. Preserve `$description` on every token. Reference, never hardcode.
