---
name: design-screen
description: Design or build a page, screen, landing page, website, app or UI from a request - the whole job, end to end. Use this for "design a landing page", "build a settings screen", "make me a website", "design the onboarding", "ออกแบบหน้าเว็บ", "ทำหน้า landing", "ออกแบบ UI", "ทำแอป". It runs the pipeline no single skill covers: the house doctrine, a written Brief Inference so the result is not the statistical mean, a committed visual direction, tokens, build, the objective gates, then an adversarial critic. Hands off to data-dashboard for dense data screens, redesign for existing UI, and image-to-code when a reference image is given.
---

# Skill: Design a screen

## Do this first, before anything else

**Write the Brief Inference block into your reply now.** Not after reading the
rest of this file, not in your head, not "once the layout is clearer" - now,
before any markup, any file, any tool call.

```
Domain:           fintech | editorial | dev-tool | healthcare | consumer | ...
Audience & tone:  expert vs first-time, calm vs energetic, premium vs utilitarian
Mood:             the one adjective the result must earn - "expensive", "precise", "warm", "brutal"
Motion depth:     none | subtle feedback | expressive choreography
Layout family:    the section sequence you will use, named, varied per section
Reference anchor: an archetype, or a named system - see step 3
```

Fill in every line with a decision. `Mood: clean` is not a decision; `Mood:
expensive` is. If you cannot name the mood and the layout family, you have not
decided anything yet and whatever you generate will regress to the mean.

**The stop condition:** if you are about to write markup, create a file, or call
a tool that produces UI, and this block is not already in your reply, stop and
write it first. Measured on 2026-10-07, one run in three skipped it - the skill
loaded, the block did not get written, and the result was a screen designed by
nobody. This section is at the top of the file because it was previously below
twenty-nine lines of background, and background is not an instruction.

Everything below is how to execute the decisions above.

---

> **Is the kit here?** This skill reads files from the kit. Check once:
> `ls ${CLAUDE_SKILL_DIR}/../../../tokens >/dev/null 2>&1 && echo KIT_OK || echo KIT_MISSING`
> On `KIT_MISSING` only the skill folders were installed, which is what
> `npx skills add` does. Say so plainly, point the user at
> `npx ux-ui-agent-skills init` or the plugin install, and stop. Do not guess the
> contents of a file you could not open.

## Hand off instead, when the work is actually

| The request | Use |
|---|---|
| A dashboard, terminal, console, or any screen whose job is many numbers at once | `data-dashboard` |
| An existing site or app to improve | `redesign` |
| A screenshot, mockup or reference image to match | `image-to-code` |
| One component's spec, not a screen | `design-component` |
| A brand foundation from scratch, before any screen | `brandkit` |

Otherwise, continue.

---

## 1. Taste preflight

The block at the top of this file. If it is not in your reply yet, go back and
write it before reading further - the rest of this skill executes decisions it
assumes you have already made.

Full version and the reasoning: `${CLAUDE_SKILL_DIR}/../../../taste/design-taste.md`.

### Banned defaults — break each one deliberately

These are the tells that make UI read as generated. They are defects, not
starting points.

- **Three or four identical equal-weight cards.** One thing leads: more size,
  more weight, or its own row. A grid of equals gives the eye nowhere to land.
- **Everything centered.** Use asymmetry and a real grid. Center sparingly.
- **The same left-text / right-image row repeated.** Vary composition per section.
- **Display type that is just bold body text.** The largest heading is at least
  2.5x the body size, short, on a wide measure (18-24ch).
- **Generic drop shadow on every box.** Most things are flat; elevation is layered
  and rare.
- **Pure `#000` on `#fff`.** Off-black on warm-white, from the theme.
- **A rainbow of accents.** One primary, one accent at most; neutrals carry it.
- **Emoji anywhere** - icons, bullets, status dots, labels. Use lucide inline SVG
  with `currentColor`, or plain words. This is a hard gate, not a preference.
- **Em-dashes in UI copy**, marketing filler ("elevate", "seamless", "unlock"),
  hollow triads ("powerful, intuitive, beautiful"), fake labels ("SECTION 01",
  lorem ipsum). Say the concrete thing or say nothing.
- **A colored border on one side only** of a card, alert, toast or callout. The
  tinted 3-4px strip is a generated-UI cliche. Full hairline border or surface
  separation, and status carried by a real icon plus text, never colour alone.
- **Cramped vertical rhythm.** Generous macro-whitespace between sections.

---

## 2. Doctrine

Load `design-doctrine` and follow it. The parts that decide this job: token by
intent, one shared theme, the eight states on every interactive element, one
thing leads, zero emoji, and never state a number you did not measure.

## 3. Direction into tokens

Pick the reference anchor from
`${CLAUDE_SKILL_DIR}/../../../taste/aesthetic-systems.md` or the library at
`${CLAUDE_SKILL_DIR}/../../../design-systems/library/`, then resolve it into
tokens rather than styling screens directly. One CSS-variable layer, imported
once. If a brand colour fails contrast, adjust it: taste serves tier 4 and never
overrides accessibility.

Reference output to match for quality:
`${CLAUDE_SKILL_DIR}/../../../examples/showcase/` and
`${CLAUDE_SKILL_DIR}/../../../examples/templates/`.

## 4. Build

**Mobile is the base**, not an afterthought: write the phone layout as the base
styles and layer wider screens on with `min-width`. `max-width` is fine for a
narrow refinement, never as the way mobile gets supported. Every value a token. Every interactive element ships all eight
states. Content first, then the layout that serves it.

## 5. Gate — run it, never claim it

```bash
node ${CLAUDE_SKILL_DIR}/../../../scripts/accuracy_report.mjs
```

Report the real `N/N` line. For a single file, at minimum:

```bash
node ${CLAUDE_SKILL_DIR}/../../../scripts/verify_states.mjs <file> [--dark]
node ${CLAUDE_SKILL_DIR}/../../../scripts/verify_responsive.mjs <file> --scale=1.25
node ${CLAUDE_SKILL_DIR}/../../../scripts/slop_tells.mjs --strict <file>
node ${CLAUDE_SKILL_DIR}/../../../scripts/taste_audit.mjs --strict <file>
```

A render gate with no browser prints SKIPPED and exits 0. That is not a pass.
Set `DS_REQUIRE_BROWSER=1` when you run one on its own and intend to trust it.

## 6. Render and look

Gates pass while a screen is still visibly broken. Screenshot it, look at every
state, and click each control to confirm something actually changed.

## 7. Critic

Run `/critique`. It is adversarial on purpose and it sees the work, not your
reasoning. A passing gate is never evidence of taste.

---

## What you deliver

The Brief Inference block, the files, the real gate output, and the critic's
verdict. If a gate was not run, say which and why - an unmeasured result is
reported as unmeasured, never as a pass.
