---
name: token-build
description: Set up or run the token build pipeline. Transform the DTCG tokens/*.json (source of truth) into platform artifacts (CSS variables, Tailwind @theme, JS/TS, iOS Asset Catalog, Android, Compose) with Style Dictionary / Tokens Studio / W3C DTCG export. Use when the user wants to generate platform theme files from tokens, wire token CI, or multi-platform token output.
---

# Skill: Token Build

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

Turn the DTCG token source of truth into platform-ready outputs. Tokens are authored once; every platform output is generated.

## Steps
1. Read `${CLAUDE_SKILL_DIR}/../../../workflows/token-build.md` (architecture, tool options, resolution rules, output targets, CI).
2. Pick the tool: **Style Dictionary** (multi-platform, the default), **Tokens Studio** (Figma-owned tokens; pairs with `figma-integration`), W3C DTCG export, or a small custom script (model on `${CLAUDE_SKILL_DIR}/../../../scripts/validate_tokens.py`).
3. Honor the resolution rules: resolve aliases to final values per platform; expose semantic + component tokens (primitives stay internal); emit base + dark/brand/density overrides (`${CLAUDE_SKILL_DIR}/../../../tokens/theming.json`) as deltas only; format by `$type`.
4. Generate the requested target(s): CSS `:root` vars, Tailwind v4 `@theme`, typed JS/TS, iOS Asset Catalog + `Color.DS`/`Spacing`, Android `colors.xml`/Compose theme.
5. Wire CI: on `${CLAUDE_SKILL_DIR}/../../../tokens/*.json` change, run `${CLAUDE_SKILL_DIR}/../../../scripts/validate_tokens.py`, regenerate, fail if committed artifacts are stale; gate colors with `${CLAUDE_SKILL_DIR}/../../../scripts/contrast.py`.

## Verification (definition of done)
- `python3 ${CLAUDE_SKILL_DIR}/../../../scripts/validate_tokens.py` passes (no unresolved aliases).
- Regenerating produces no diff vs. committed artifacts.
- Dark/brand/density outputs contain only deltas, not full duplicates.
