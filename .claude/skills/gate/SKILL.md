---
name: gate
description: Run the one-command quality gate and report the real N/N result. Use before claiming any build/review is done.
# A command the user runs. Converted from .claude/commands/ so it has a
# CLAUDE_SKILL_DIR of its own and its paths resolve on every install route.
# disable-model-invocation keeps the behaviour a command had: the user
# starts it, the model never does, and its description stays out of the
# listing budget the model's skill choice is drawn from.
disable-model-invocation: true
---
## Requirements

This skill needs the full UX/UI Agent Skills kit: the gates, the references and
the design-system library. Install it with `npx ux-ui-agent-skills@3.0.0 init`
or as the Claude Code plugin. `npx skills@1.7.6 add` copies the skill folder and
nothing else, and this skill has no guidance-only mode: its whole job is to
run the gates and report their real N/N, so without the kit there is nothing for it to do.

> **Step 0: is the kit here?** Check once:
> `ls ${CLAUDE_SKILL_DIR}/../../../tokens >/dev/null 2>&1 && echo KIT_OK || echo KIT_MISSING`
> On `KIT_MISSING`, say plainly that only the skill folder was installed, name
> the install command above, and stop. Do not guess the contents of a file you
> could not open, and do not report a result you did not produce.

Run the full quality gate and report the ACTUAL output, never a remembered or
reasoned number.

1. Run: `node ${CLAUDE_SKILL_DIR}/../../../scripts/accuracy_report.mjs`
   (tokens + contrast + spec + no-hardcode + theme-refs + no-emoji +
   real-render WCAG + state-aware, light and dark; all-or-nothing).
2. Report the exact `N/N` line it prints.
3. If it is not fully green:
   - List each failing check verbatim.
   - Fix the cause (do not suppress the check).
   - Re-run until green. Do not announce success between failures.
4. For any rendered HTML touched this session, also run the pixel-truth checks
   the gate cannot prove:
   - `node ${CLAUDE_SKILL_DIR}/../../../scripts/gate.mjs verify_states.mjs <file> [--dark]`
   - `node ${CLAUDE_SKILL_DIR}/../../../scripts/gate.mjs verify_responsive.mjs <file>`
   - RENDER-AND-LOOK: screenshot the harness, park the pointer off it, inspect
     every state, click each control to confirm the state changed.

Honest scope: these gates prove objective correctness (tokens, a11y, no drift).
They do not prove taste. Pair with `DS_REQUIRE_BROWSER=1 node ${CLAUDE_SKILL_DIR}/../../../scripts/taste_audit.mjs` + human review;
never claim auto-100% on aesthetics.
