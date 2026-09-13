---
name: design-doctrine
description: The house rules for ANY design or UI work - the verification protocol (run the gate, never claim a number), the absolute no-emoji rule, token by intent, one shared theme, the eight states, one thing leads, and output completeness. Load this FIRST whenever building, reviewing, or theming a screen, component, or token set. Installed as a plugin, this skill carries what CLAUDE.md carries in the repo.
invocation: model
---

# Skill: Design Doctrine

A plugin's root `CLAUDE.md` is not loaded as project context, so the always-on
brief travels here instead. Read this before the first line of any design work,
then load the rule file for the territory you are actually in.

## Verification protocol - run gates, never claim

1. **Never state a number you did not measure.** Any contrast ratio, "WCAG pass",
   or "100%" must come from running a gate and reporting its real output. If you
   have not run it, say "not verified yet."
2. **Verify every state, not just resting.** `node scripts/verify_states.mjs <file> [--dark]`
   measures default, hover and focus - a button that passes at rest can fail on hover.
3. **One command before reporting done:** `node scripts/accuracy_report.mjs`.
   Report the real `N/N` line. It is all-or-nothing.
4. **Build with the gates, not after them.** Fix and re-run until green; never
   announce success between failures.
5. **Render and LOOK.** Gates pass while a UI is still visibly broken. Screenshot
   the harness in both themes, click every control, and confirm the state changed.
6. **Responsive is gated too:** `node scripts/verify_responsive.mjs <file|dir>` -
   no horizontal overflow at 280/320/414px.
7. **Honest scope.** The gates prove objective correctness. They never prove taste.
   For that, run `/critique` and look at the work yourself.

> ABSOLUTE: zero emoji in any output - UI, code, JSON, copy, comments, commit
> messages. Not as an icon, a bullet, a status dot, or "polish". Emoji are the
> number-one tell of machine-generated work. Use a lucide icon (inline SVG,
> `currentColor`) or plain words. Enforced by `scripts/check_no_emoji.py`.

## The five non-negotiables

1. **Token by intent.** Pick the token whose meaning matches the action.
   Destructive actions (Delete, Remove, Revoke) wear `action.destructive` in every
   place they appear - the trigger and the confirm dialog both. A blue Delete is a
   bug. Measured by `scripts/lint_intent.mjs`.
2. **One theme, one source of truth.** Every page renders from the same
   `tokens/*.json` through one CSS-variable layer imported once at the app root.
   No per-page palette, no hardcoded hex, px, or timing.
3. **Every interactive element ships eight states:** default, hover, focus,
   active, disabled, loading (if async), error (if input), and selected (if
   selectable). The eighth is not optional when the thing can be selected.
4. **One thing leads.** Every screen has a first place for the eye, and display
   type is at least 2.5x the body size. Four equal cards means the eye lands
   nowhere and the screen reads as generated.
5. **Output completeness.** A partial output is a broken output. Deliver full
   files, never placeholders. Asked for N components, deliver all N.

## Decision framework

User needs, then accessibility, then consistency, then aesthetics, then developer
experience. Never sacrifice a higher tier for a lower one. Beautiful but
inaccessible is broken; consistent but confusing is the wrong pattern.

## Where the depth lives

| Read it when | File |
|---|---|
| Tokens, palettes, theming, dark mode, any colour decision | `.claude/rules/tokens-and-color.md` |
| Type scale, line length, the 4px spacing rhythm | `.claude/rules/typography-and-spacing.md` |
| Building any screen or component, composition, empty states | `.claude/rules/components.md` |
| Auditing, or finishing any interactive element | `.claude/rules/accessibility.md` |
| Generating code for React, Next.js, SwiftUI, or any adapter | `.claude/rules/frameworks.md` |
| Design review, prototyping, research, handoff | `.claude/rules/review-and-research.md` |
| Aesthetic direction, motion, voice and tone, governance, QA | `.claude/rules/brand-and-operations.md` |

Then pick the runnable skill for the job: `design-tokens`, `design-component`,
`design-code`, `design-review`, `a11y-audit`, `apply-aesthetic`, `brandkit`,
`image-to-code`, `redesign`, and the rest. Interrogate the brief first with
`/grill-me`; prove the result with `/gate`; judge it with `/critique`.
