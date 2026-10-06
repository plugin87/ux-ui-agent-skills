---
name: ship
description: Pre-release gate — run the full gate, responsive + render checks, then produce the release checklist (README badge/current/changelog). Use before tagging a release.
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

Gate first, then prepare the release. Do nothing destructive without explicit
confirmation (no tag, no publish) — this command verifies and drafts only.

1. Quality gate (must be fully green before continuing):
   - `node ${CLAUDE_SKILL_DIR}/../../../scripts/accuracy_report.mjs` — report the real N/N.
   - `node ${CLAUDE_SKILL_DIR}/../../../scripts/verify_responsive.mjs examples` — no overflow at 280/320/414.
   - `python3 ${CLAUDE_SKILL_DIR}/../../../scripts/check_no_emoji.py` — UI + taste + instruction surface.
   If anything fails, stop and fix; do not proceed to the checklist.

2. Release checklist (per the project release rule):
   - Update `README.md`: version badge, "current" line, and changelog entry.
   - Confirm the bump level (major/minor/patch) with the user — it is their call.
   - Confirm `examples/apple-home` stays gitignored (local IP).
   - List the commits since the last tag so the changelog is accurate.

3. Output a ready-to-review summary: the green N/N line, the proposed version,
   and the drafted changelog entry. Wait for the user to approve before any
   `git tag` / publish step.
