---
name: redesign
description: Upgrade an existing website or app to premium quality without breaking functionality — audit the current design, identify generic/AI tells, then apply taste and system rules surgically. Use when the user wants to improve, modernize, polish, or "make better" an existing UI/codebase.
---

# Skill: Redesign & Audit

Audit-first redesign that preserves behavior.

## Steps
1. Read `workflows/redesign-audit.md` (the full Scan → Diagnose → Direct → Apply → Verify sequence + Output Completeness).
2. **Scan** the codebase: framework, styling method (→ route to the matching `frameworks/` adapter), token reality, components, what must be preserved.
3. **Diagnose** with the Banned Defaults checklist (`taste/design-taste.md`) + the review rubric (`design-review` skill). Produce a prioritized findings table.
4. **Direct**: choose an archetype/system (`apply-aesthetic` skill) that fits the brand.
5. **Apply** in order — tokens first, then typography/spacing, then component states, then motion — without changing routes/data/markup semantics (except a11y fixes).
6. **Verify**: re-run `design-review` + `a11y-audit`; smoke-test every previously working flow; dark mode + responsive spot-check. Run `scripts/validate_contrast.py` on the token source and `scripts/lint_hardcodes.py` over the changed code.

## Guardrails
Never sacrifice a working feature for aesthetics. Never ship a brand color that fails contrast. Never remove existing accessibility affordances. Deliver complete files — no placeholders.

## Single-theme consistency (critical for multi-page apps)
Consolidate to ONE shared token theme and make **every page** consume it — a redesign that leaves different pages on different palettes has failed. Replace per-page/ad-hoc colors with semantic tokens; verify with `scripts/lint_hardcodes.py` that no page reintroduces off-theme values. Theme switches must come from the single token source, not page edits (CLAUDE.md → Single-Theme Consistency).
