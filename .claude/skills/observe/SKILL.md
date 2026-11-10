---
name: observe
description: 'Show whether the agent followed the kit''s rules in recent sessions: pages edited and measured, Stop hook blocks, findings left open. Reads local hook events only.'
# A command the user runs, like /gate. The model never starts it.
disable-model-invocation: true
---
> **Step 0 - is the kit here?** Check once:
> `ls ${CLAUDE_SKILL_DIR}/../../../scripts/observe.mjs >/dev/null 2>&1 && echo KIT_OK || echo KIT_MISSING`
> On `KIT_MISSING` only the skill folders were installed. Say so, point the user
> at the plugin install or `npx ux-ui-agent-skills@3.0.0 init`, and stop.

Report what the hooks recorded - never a reconstruction from memory.

1. Run `node ${CLAUDE_SKILL_DIR}/../../../scripts/observe.mjs --project "$CLAUDE_PROJECT_DIR"`
   (or without `--project` when the user asks about every project, and with
   `--days N` when they name a window).
2. Quote the summary lines it prints. If it says no session edited UI, say that
   and stop: there is nothing to judge.
3. For each session marked `BROKE A RULE`, run it again with `--session <id>` and
   say which rule failed and the timeline line that shows it.
4. If the user wants the page, run it with `--html <path>` and give the path.

What it measures, and what it does not: three counted rules per session -
every edited page had a passing gate before the end, no fast-gate finding was
left on a file's latest version, and the agent never finished while the Stop
hook still had pages open. It says nothing about design quality, and an
`unfinished` session is not counted for or against.
