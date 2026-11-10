---
name: governance
description: Govern how the design system evolves (SemVer for tokens/components, the contribution workflow, deprecation policy, and change communication). Use when the user wants to add/promote/deprecate a component or token, decide a version bump, set up a contribution process, or keep the system from fragmenting.
# `invocation:` was not a field Claude Code reads - unknown frontmatter keys are
# ignored without an error, so these six were auto-invocable the whole time they
# were marked user-only. This is the field that actually does it.
disable-model-invocation: true
---

# Skill: Governance

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

Keep the system consistent as it grows. Apply versioning, contribution, and deprecation rules.

## Steps
1. Read `${CLAUDE_SKILL_DIR}/../../../workflows/governance.md` (SemVer table, contribution workflow, deprecation policy, change comms).
2. Classify the change: **major** (breaking: renamed/removed token or prop, changed anatomy/default), **minor** (additive: new token/component/variant/optional prop), **patch** (fix: contrast/bug/doc/value tweak in tolerance).
3. For a **new** component/token: confirm it serves a real, repeated need (≥ 2 places) before promoting product → candidate → core. Design it to the full quality bar (`${CLAUDE_SKILL_DIR}/../../../.claude/rules/components.md` → Component Quality Bar).
4. For a **deprecation**: mark with reason + replacement + removal version; keep working ≥ 1 minor cycle; provide a migration map (`${CLAUDE_SKILL_DIR}/../../../design-systems/crosswalk.md` style); remove only in a major.
5. Wire any new file into `CLAUDE.md` (File Reference Map + relevant table/router) and add a changelog entry.

## Verification (definition of done)
- Change has a SemVer level **and** a changelog entry.
- Removals have a deprecation window, a replacement, and a migration table.
- New spec meets the 8-state + a11y + token-mapping bar and is reachable via the router.
- `python3 ${CLAUDE_SKILL_DIR}/../../../scripts/validate_tokens.py` passes; contrast re-checked if colors changed.
