---
name: critique
description: Adversarial design critique of the current work — render it, look at it, and argue for rejection. Run after the gates are green, never instead of them.
# A command the user runs. Converted from .claude/commands/ so it has a
# CLAUDE_SKILL_DIR of its own and its paths resolve on every install route.
# disable-model-invocation keeps the behaviour a command had: the user
# starts it, the model never does, and its description stays out of the
# listing budget the model's skill choice is drawn from.
disable-model-invocation: true
---
> **Step 0 — is the kit here?** This skill reads files from the kit. Check once:
> `ls ${CLAUDE_SKILL_DIR}/../../../tokens >/dev/null 2>&1 && echo KIT_OK || echo KIT_MISSING`
> On `KIT_MISSING` only the skill folders were installed, which is what
> `npx skills add` does. Say so plainly, point the user at
> `npx ux-ui-agent-skills init` or the plugin install, and stop. Do not guess the
> contents of a file you could not open.

The gates prove objective correctness. They cannot tell you whether the work is
any good. This command closes that gap the only honest way: render the thing, look
at it, and let a critic who is trying to reject it write the findings.

Target: `$ARGUMENTS` (a file, a directory, or the screens changed in this session;
ask if it is ambiguous).

## 1. Refuse to critique blind

If the target has never been rendered, render it first. A critique written from
source alone is worthless. Screenshot every screen or harness at 1280 and 390
wide, in light and dark, pointer parked off the UI, then click every control and
note what actually changed.

## 2. Gather the numbers the critic will need

```
node ${CLAUDE_SKILL_DIR}/../../../scripts/taste_audit.mjs <file> && node ${CLAUDE_SKILL_DIR}/../../../scripts/taste_audit.mjs <file> --dark
node ${CLAUDE_SKILL_DIR}/../../../scripts/slop_tells.mjs  <file> && node ${CLAUDE_SKILL_DIR}/../../../scripts/slop_tells.mjs  <file> --dark
node ${CLAUDE_SKILL_DIR}/../../../scripts/verify_overflow.mjs   <file|dir>
node ${CLAUDE_SKILL_DIR}/../../../scripts/verify_responsive.mjs <file|dir>
```

Report their real output. These are heuristics: they name what you saw, they do
not decide whether it is good.

## 3. Hand it to the critic

Delegate to the `design-critic` subagent with the screenshots, the script output,
and the file paths. Its stance is adversarial on purpose: the work is mediocre
until the render proves otherwise, a passing gate is never evidence of taste, and
every finding must name its evidence.

**Open the delegation message with this line, exactly:**

```
KIT=${CLAUDE_SKILL_DIR}/../../..
```

A subagent gets no `CLAUDE_SKILL_DIR`, so without that line it cannot find the
scripts under a plugin install and will either guess a path or report nothing.

If subagents are unavailable, adopt
`${CLAUDE_SKILL_DIR}/../../../.claude/agents/design-critic.md` yourself and
follow it literally, including the verdict format.

## 4. Report, then decide

Relay the verdict, the three rejection reasons, and the findings table as written.
Do not soften it, and do not pad the "what is good" list.

Then act on it: fix every Critical and Major finding, re-run `/gate`, and re-run
this critique on what changed. The loop ends when the critic's remaining findings
are Minor or Enhancement, not when you are tired of it.

Honest scope, always stated with the result: this is judgement, not measurement.
It does not produce a percentage, and no percentage in this repo covers taste.
