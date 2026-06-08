---
name: token-build
description: Set up or run the token build pipeline — transform the DTCG tokens/*.json (source of truth) into platform artifacts (CSS variables, Tailwind @theme, JS/TS, iOS Asset Catalog, Android, Compose) with Style Dictionary / Tokens Studio / W3C DTCG export. Use when the user wants to generate platform theme files from tokens, wire token CI, or multi-platform token output.
---

# Skill: Token Build

Turn the DTCG token source of truth into platform-ready outputs. Tokens are authored once; every platform output is generated.

## Steps
1. Read `workflows/token-build.md` (architecture, tool options, resolution rules, output targets, CI).
2. Pick the tool: **Style Dictionary** (multi-platform, the default), **Tokens Studio** (Figma-owned tokens — pairs with `figma-integration`), W3C DTCG export, or a small custom script (model on `scripts/validate_tokens.py`).
3. Honor the resolution rules: resolve aliases to final values per platform; expose semantic + component tokens (primitives stay internal); emit base + dark/brand/density overrides (`tokens/theming.json`) as deltas only; format by `$type`.
4. Generate the requested target(s): CSS `:root` vars, Tailwind v4 `@theme`, typed JS/TS, iOS Asset Catalog + `Color.DS`/`Spacing`, Android `colors.xml`/Compose theme.
5. Wire CI: on `tokens/*.json` change, run `scripts/validate_tokens.py`, regenerate, fail if committed artifacts are stale; gate colors with `scripts/contrast.py`.

## Verification (definition of done)
- `python3 scripts/validate_tokens.py` passes (no unresolved aliases).
- Regenerating produces no diff vs. committed artifacts.
- Dark/brand/density outputs contain only deltas, not full duplicates.
