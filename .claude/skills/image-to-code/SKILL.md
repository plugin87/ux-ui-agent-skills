---
name: image-to-code
description: Turn a reference image, screenshot, or mockup into token-driven, accessible code — infer the design system from the reference (palette, type scale, spacing, radius, layout archetype), map it to the 3-tier tokens, rebuild it, then verify with the kit's gates. Use when the user provides a design/screenshot and wants matching UI code.
# `invocation:` was not a field Claude Code reads - unknown frontmatter keys are
# ignored without an error, so these six were auto-invocable the whole time they
# were marked user-only. This is the field that actually does it.
disable-model-invocation: true
---

# Skill: Image to Code

> **Step 0 — is the kit here?** This skill reads files from the kit. Check once:
> `ls ${CLAUDE_SKILL_DIR}/../../../tokens >/dev/null 2>&1 && echo KIT_OK || echo KIT_MISSING`
> On `KIT_MISSING` only the skill folders were installed, which is what
> `npx skills add` does. Say so plainly, point the user at
> `npx ux-ui-agent-skills init` or the plugin install, and stop. Do not guess the
> contents of a file you could not open.

Reconstruct a design from a visual reference as a real design system, not a one-off copy. Match the *system* (color/type/spacing language), never lift copyrighted imagery or brand assets.

## Steps
1. **Read the reference like a designer.** Infer and write down:
   - **Palette** — 1 dominant surface family, text colors, 1 primary action + at most 1 accent (sample the hues; don't guess random hex).
   - **Type** — family feel (geometric/grotesk/serif), the scale jumps, display vs. body contrast, weights.
   - **Spacing & density** — base unit, section rhythm, card padding; airy vs. compact.
   - **Radius & depth** — radius language (sharp/soft/pill), shadow vs. hairline separation.
   - **Layout archetype + sequence** — bounded hero / asymmetric split / dense bento / editorial stack (`${CLAUDE_SKILL_DIR}/../../../taste/design-taste.md` → Variance Mandate).
2. **Anchor to a known system** if it's close — browse `${CLAUDE_SKILL_DIR}/../../../taste/aesthetic-systems.md` / `python3 ${CLAUDE_SKILL_DIR}/../../../scripts/design_systems.py search <term>` and adopt that recipe to stabilize decisions.
3. **Build the token theme** from the inferred values → 3-tier DTCG (`design-tokens` skill); generate a single `theme.css`. Verify every color pair with `${CLAUDE_SKILL_DIR}/../../../scripts/contrast.py` / `${CLAUDE_SKILL_DIR}/../../../scripts/validate_contrast.py` (light + dark) — a sampled brand color that fails AA gets adjusted; taste never overrides POUR.
4. **Rebuild layout + components** token-driven via `${CLAUDE_SKILL_DIR}/../../../frameworks/adapter-protocol.md` + `${CLAUDE_SKILL_DIR}/../../../components/*`: one shared primitive layer, all 8 states, a11y wired, no emoji (lucide), single theme. Apply taste (`design-taste.md`) so it doesn't regress to generic.
5. **Verify against the reference** — render and screenshot it, compare side-by-side to the reference; run `node ${CLAUDE_SKILL_DIR}/../../../scripts/measure_render.mjs`, `lint_hardcodes.py`, `taste_audit.mjs`, and `npm run verify`.

## Verification (definition of done)
- `npm run verify` is 100% (tokens resolve, contrast AA light+dark, no hardcodes/emoji, real-render WCAG).
- The rebuilt UI uses ONE inferred token theme — no per-section palettes.
- A screenshot of the result visibly matches the reference's design language.

> Honest limit: this matches the design **system**, not a pixel-perfect copy. Do not reproduce the reference's photographs, logos, or copyrighted copy — substitute your own or generic placeholders.
