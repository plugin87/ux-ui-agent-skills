---
name: design-qa
description: Set up or run design QA gates — token + hardcoded-value lint, automated a11y (axe), contrast, visual regression across variants/states/themes/RTL, and the manual a11y checklist. Use when the user wants CI quality gates, to prevent design regressions, or to QA a component/screen before shipping.
---

# Skill: Design QA

> **Step 0 — is the kit here?** This skill reads files from the kit. Check once:
> `ls ${CLAUDE_SKILL_DIR}/../../../tokens >/dev/null 2>&1 && echo KIT_OK || echo KIT_MISSING`
> On `KIT_MISSING` only the skill folders were installed, which is what
> `npx skills add` does. Say so plainly, point the user at
> `npx ux-ui-agent-skills init` or the plugin install, and stop. Do not guess the
> contents of a file you could not open.

Stand up the automated + manual gates that stop quality from regressing.

## Steps
1. Read `${CLAUDE_SKILL_DIR}/../../../workflows/design-qa.md` (the QA pyramid: token/lint gates → automated a11y → visual regression → manual a11y).
2. Wire the **fast gates** first (every commit/PR): `python3 ${CLAUDE_SKILL_DIR}/../../../scripts/validate_tokens.py`, `python3 ${CLAUDE_SKILL_DIR}/../../../scripts/validate_contrast.py` (batch WCAG over the token pairs), and `python3 ${CLAUDE_SKILL_DIR}/../../../scripts/lint_hardcodes.py <src>` (no raw hex/px/timing in component code). The repo's `.github/workflows/ci.yml` runs these.
3. Add **automated a11y** (axe-core / Pa11y) over each component's states (error/loading/disabled/expanded/selected), zero serious/critical to merge. Run the **real-render contrast gate** `node ${CLAUDE_SKILL_DIR}/../../../scripts/measure_render.mjs <file.html>` (and `--dark`) — it opens the page in headless Chromium, disables transitions, and measures the true computed-style + alpha-composited contrast of every text element (catches what static token checks miss).
4. Add **visual regression** snapshots across variants × sizes × states × light/dark + key breakpoints + RTL; freeze animations + deterministic data.
5. Sign off the **manual a11y** checklist per release (keyboard, screen reader, 400% reflow, 200% text-spacing, reduced-motion, forced-colors — `${CLAUDE_SKILL_DIR}/../../../accessibility/*`).

## Verification (definition of done)
- An unreviewed PR cannot introduce an unresolved token alias, a contrast failure, a raw hex/px, or an axe violation — a gate blocks each.
- Snapshots cover dark mode + RTL + the semantic-changing states, not just the happy path.
- Manual a11y checklist signed off for the release.
