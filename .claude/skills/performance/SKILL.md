---
name: performance
description: Optimize UI performance against Core Web Vitals (LCP, INP, CLS) with loading/code-split strategy, layout-shift prevention, and animation performance rules. Use when the user wants to improve speed, fix jank or layout shift, hit Web Vitals budgets, or make a UI feel fast on low-end devices.
---

# Skill: Performance

## Requirements

This skill needs the full UX/UI Agent Skills kit: the gates, the references and
the design-system library. Install it with `npx ux-ui-agent-skills@3.1.0 init`
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

Make the UI fast and stable. Treat performance as an accessibility concern: slow/janky UIs fail low-end devices first.

## Steps
1. Read `${CLAUDE_SKILL_DIR}/../../../workflows/performance.md` (Core Web Vitals targets, loading strategy, layout-shift, animation perf, design-system runtime cost).
2. Diagnose against budgets: **LCP ≤ 2.5s**, **INP ≤ 200ms**, **CLS ≤ 0.1**. Measure on a mid-tier mobile profile (throttle slow 4G + 4× CPU).
3. Loading: render above-fold first (SSR/Server Components), code-split by route + heavy widget, lazy-load below-fold/behind-interaction (Astro islands / Qwik), preload one critical font weight, modern responsive images.
4. Kill layout shift: size skeletons to final dimensions, reserve media space via `aspect-ratio` (`${CLAUDE_SKILL_DIR}/../../../tokens/sizing.json`), never inject content above existing.
5. Animation: only `transform`/`opacity`, `will-change` sparingly, 100-300ms (`${CLAUDE_SKILL_DIR}/../../../tokens/motion.json`), honor `prefers-reduced-motion`. Prefer CSS state styling over JS for low INP; tree-shake/per-component imports.

## Verification (definition of done)
- Lighthouse / field data meets LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 on mid-tier mobile.
- First interaction stays responsive under slow-4G + 4× CPU throttle.
- Skeletons + media reserve space (zero CLS on load); no non-compositor animation in loops.
