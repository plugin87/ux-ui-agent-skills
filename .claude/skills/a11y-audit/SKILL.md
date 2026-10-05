---
name: a11y-audit
description: Audit a UI or design against WCAG 2.2 AA/AAA and ARIA patterns, returning criterion-referenced findings with severity and specific fixes. Use when the user wants an accessibility check, contrast verification, keyboard/screen-reader review, or wants to confirm a component meets POUR.
---

# Skill: Accessibility Audit

> **Step 0 — is the kit here?** This skill reads files from the kit. Check once:
> `ls ${CLAUDE_SKILL_DIR}/../../../tokens >/dev/null 2>&1 && echo KIT_OK || echo KIT_MISSING`
> On `KIT_MISSING` only the skill folders were installed, which is what
> `npx skills add` does. Say so plainly, point the user at
> `npx ux-ui-agent-skills init` or the plugin install, and stop. Do not guess the
> contents of a file you could not open.

Evaluate against WCAG 2.2 and the project's ARIA patterns.

## Steps
1. Read `${CLAUDE_SKILL_DIR}/../../../accessibility/wcag-checklist.md` (POUR-organized, P0/P1/P2) and `${CLAUDE_SKILL_DIR}/../../../accessibility/aria-patterns.md`.
2. Check the mandatory P0 set per component: keyboard navigable, focus visible (≥3:1), screen-reader name/role/state, contrast (4.5:1 text / 3:1 UI), target size ≥24×24, no color-only signaling.
3. Verify WCAG 2.2 additions: Focus Not Obscured (2.4.11), Target Size (2.5.8), Accessible Authentication (3.3.8).
4. **Contrast — measure, don't eyeball.** For rendered HTML, RUN the real-render gates and report their actual output (CLAUDE.md → Verification Protocol): `node ${CLAUDE_SKILL_DIR}/../../../scripts/measure_render.mjs <file> [--dark]` (every text element) AND `node ${CLAUDE_SKILL_DIR}/../../../scripts/verify_states.mjs <file> [--dark]` (every interactive element in default/hover/focus — catches hover-state failures). For loose color pairs, `python3 ${CLAUDE_SKILL_DIR}/../../../scripts/contrast.py "<fg>" "<bg>"`. Never state a ratio you did not measure.
5. Check reduced-motion handling (`${CLAUDE_SKILL_DIR}/../../../taste/motion-choreography.md`).

## Output
A findings table: WCAG criterion (e.g. 1.4.3) · severity (P0/P1/P2) · what fails · specific fix. Confirm passes explicitly. Accessibility may never be traded for aesthetics.
