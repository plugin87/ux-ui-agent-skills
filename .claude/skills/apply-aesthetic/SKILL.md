---
name: apply-aesthetic
description: Apply a visual direction, an archetype (high-end agency, editorial minimal, brutalist, soft-SaaS, dark-tech) or one of 2,144 named design systems (apple, linear-app, stripe, vercel, notion, material, shadcn, spotify, tesla…), by resolving it into the token system. Use when the user wants a specific look/vibe/brand feel, or asks to make a design feel premium/expensive/non-generic.
---

# Skill: Apply Aesthetic

## Requirements

This skill needs the full UX/UI Agent Skills kit: the gates, the references and
the design-system library. Install it with `npx ux-ui-agent-skills@3.0.0 init`
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

Choose and apply a design direction without breaking accessibility.

## Steps
1. **Brief Inference first (mandatory).** Before any tokens, name it: industry/domain, audience & tone, the one mood adjective the result must earn, motion depth, and the layout-family sequence (`${CLAUDE_SKILL_DIR}/../../../taste/design-taste.md` → Brief Inference + Variance Mandate). Generating before deciding = slop.
2. Pick a direction in `${CLAUDE_SKILL_DIR}/../../../taste/aesthetic-systems.md`:
   - An **archetype** (recipe mapped to our tokens), or
   - A **named library system**: browse with `python3 ${CLAUDE_SKILL_DIR}/../../../scripts/design_systems.py list` (or `search <term>` / `show <name>`). Then run `node ${CLAUDE_SKILL_DIR}/../../../scripts/library.mjs get <name>` and read the `DESIGN.md` at the path it prints. An npm install carries the index and no spec, so this is what fetches it (checked against the sha256 the kit ships); where the spec is already on disk it fetches nothing. If it prints `refused`, say the spec could not be fetched and pick from an archetype instead; never write a spec from memory.
3. Apply the **Library Contract** (in `aesthetic-systems.md`): re-point `semantic.*` tokens to the chosen system's color roles; map typography/spacing/radius/shadow/motion to `${CLAUDE_SKILL_DIR}/../../../tokens/*.json`.
4. **Verify contrast** of every mapped color pair (`${CLAUDE_SKILL_DIR}/../../../scripts/contrast.py` / `a11y-audit`). A brand value that fails must be adjusted. Taste never overrides POUR.
5. Add motion per `${CLAUDE_SKILL_DIR}/../../../taste/motion-choreography.md`; run the pre-flight aesthetic check in `design-taste.md`.

## Output
Updated/overridden semantic tokens + notes on type/space/motion, then render via `design-code`. Confirm the result passes both the aesthetic check and accessibility.
