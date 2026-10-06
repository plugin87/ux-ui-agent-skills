---
name: prototype
description: Move an idea up the fidelity ladder (content-first → wireframe → low-fi → high-fi → code) with a validation plan at each level, plus user-journey mapping and usability-testing scripts. Use when the user wants to prototype, wireframe, map a user flow, or plan/run usability testing.
# `invocation:` was not a field Claude Code reads - unknown frontmatter keys are
# ignored without an error, so these six were auto-invocable the whole time they
# were marked user-only. This is the field that actually does it.
disable-model-invocation: true
---

# Skill: Prototype & Research

> **Step 0 — is the kit here?** This skill reads files from the kit. Check once:
> `ls ${CLAUDE_SKILL_DIR}/../../../tokens >/dev/null 2>&1 && echo KIT_OK || echo KIT_MISSING`
> On `KIT_MISSING` only the skill folders were installed, which is what
> `npx skills add` does. Say so plainly, point the user at
> `npx ux-ui-agent-skills init` or the plugin install, and stop. Do not guess the
> contents of a file you could not open.

Guide work through the right fidelity level with validation.

## Steps
1. Read `${CLAUDE_SKILL_DIR}/../../../workflows/prototyping.md` (5-level fidelity ladder, journey mapping template, usability-testing script, sample data).
2. Identify the current need and pick the **lowest** fidelity that answers it — never skip levels:
   - Content-first (info needs) → Wireframe (layout/nav) → Low-fi (task completion) → High-fi (visual/a11y) → Code (feasibility/perf).
3. For flows: produce a user-journey map with decision points, error paths, and edge cases.
4. For validation: define the usability test (tasks, success criteria, 5-user rule) using the script.
5. High-fi/code steps pull tokens (`${CLAUDE_SKILL_DIR}/../../../tokens/*`), components (`${CLAUDE_SKILL_DIR}/../../../components/*`), taste (`${CLAUDE_SKILL_DIR}/../../../taste/*`), and a11y (`${CLAUDE_SKILL_DIR}/../../../accessibility/*`).

## Output
The artifact at the chosen fidelity + an explicit "what we validate next" plan.

## Verification (before declaring done)
- The fidelity matches the question being answered — no level skipped.
- Flows include decision points, **error paths, and edge cases** (empty/loading/overflow), not just the happy path.
- A concrete validation step is named (tasks + success criteria), not "test later".
- High-fi/code artifacts pass the same token + a11y bar as `design-code` (no hardcoded values, contrast, states).
