---
name: apply-aesthetic
description: Apply a visual direction — an archetype (high-end agency, editorial minimal, brutalist, soft-SaaS, dark-tech) or one of 138 named design systems (apple, linear-app, stripe, vercel, notion, material, shadcn, spotify, tesla…) — by resolving it into the token system. Use when the user wants a specific look/vibe/brand feel, or asks to make a design feel premium/expensive/non-generic.
---

# Skill: Apply Aesthetic

> **Step 0 — is the kit here?** This skill reads files from the kit. Check once:
> `ls ${CLAUDE_SKILL_DIR}/../../../tokens >/dev/null 2>&1 && echo KIT_OK || echo KIT_MISSING`
> On `KIT_MISSING` only the skill folders were installed, which is what
> `npx skills add` does. Say so plainly, point the user at
> `npx ux-ui-agent-skills init` or the plugin install, and stop. Do not guess the
> contents of a file you could not open.

Choose and apply a design direction without breaking accessibility.

## Steps
1. **Brief Inference first (mandatory)** — before any tokens, name it: industry/domain, audience & tone, the one mood adjective the result must earn, motion depth, and the layout-family sequence (`${CLAUDE_SKILL_DIR}/../../../taste/design-taste.md` → Brief Inference + Variance Mandate). Generating before deciding = slop.
2. Pick a direction in `${CLAUDE_SKILL_DIR}/../../../taste/aesthetic-systems.md`:
   - An **archetype** (recipe mapped to our tokens), or
   - A **named library system** — browse with `python3 ${CLAUDE_SKILL_DIR}/../../../scripts/design_systems.py list` (or `search <term>` / `show <name>`); specs live in `${CLAUDE_SKILL_DIR}/../../../design-systems/library/<name>/DESIGN.md`.
3. Apply the **Library Contract** (in `aesthetic-systems.md`): re-point `semantic.*` tokens to the chosen system's color roles; map typography/spacing/radius/shadow/motion to `${CLAUDE_SKILL_DIR}/../../../tokens/*.json`.
4. **Verify contrast** of every mapped color pair (`${CLAUDE_SKILL_DIR}/../../../scripts/contrast.py` / `a11y-audit`). A brand value that fails must be adjusted — taste never overrides POUR.
5. Add motion per `${CLAUDE_SKILL_DIR}/../../../taste/motion-choreography.md`; run the pre-flight aesthetic check in `design-taste.md`.

## Output
Updated/overridden semantic tokens + notes on type/space/motion, then render via `design-code`. Confirm the result passes both the aesthetic check and accessibility.
