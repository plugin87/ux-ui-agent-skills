---
name: brandkit
description: Generate a complete, accessible brand design system from a brief — primitive → semantic → component DTCG tokens (color, type, spacing, radius, shadow, motion), light + dark, plus a single theme.css — verified for WCAG. Use when the user wants a from-scratch brand/design foundation, a new palette + type system, or a themeable token kit for a product.
---

# Skill: Brand Kit

Stand up the *foundation* (one token system everything renders from) before any screen. Get this right and every page stays consistent and themeable from one place.

## Steps
1. **Brief Inference (mandatory)** — name the industry, audience, the one mood adjective, and motion depth (`taste/design-taste.md` → Brief Inference). Pick an anchoring archetype from `taste/aesthetic-systems.md`.
2. **Primitives** — generate the brand color ramp in **OKLCH** (11 shades, consistent chroma) + a neutral ramp; verify the 500 shade ≥ 4.5:1 on white (text) and 600 ≥ 3:1 (UI) per CLAUDE.md Color Generation.
3. **Semantic layer** — map roles to primitives: `action.primary`/`-hover`/`destructive`, `text.{primary,secondary,on-action,link}`, `surface.{page,card,raised}`, `border.{default,strong}`, `feedback.{success,warning,error,info}` — and the **dark** overrides (designed, not inverted).
4. **Scales** — Major Third type scale + composite text styles, 4px spacing scale, radius tiers, elevation, and `tokens/motion.json`-style durations/easings.
5. **Emit** the DTCG `tokens/*.json` (3-tier) + a single `theme.css` (the one shared source, `[data-theme="dark"]` overrides). Optionally feed the token-build pipeline (`token-build` skill) for other platforms.

## Verification (definition of done)
- `python3 scripts/validate_tokens.py` — valid JSON, all aliases resolve.
- `python3 scripts/validate_contrast.py` — required text/action/border pairs pass WCAG AA in **light AND dark**; `border.strong` ≥ 3:1.
- `python3 scripts/validate_theme_refs.py` — every component `var(--…)` resolves to the theme.
- One theme, no per-page palettes; destructive = danger token (not primary); zero hardcoded values.

> Output is a verified token foundation — the measurable part is provable (run `npm run verify`). Brand "feel" still benefits from a human review against `taste/design-taste.md`.
