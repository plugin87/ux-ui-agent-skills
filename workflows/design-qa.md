# Design QA — Visual Regression & Accessibility CI

Automated gates that keep quality from regressing as the system changes. Manual review (`workflows/design-review.md`) catches judgment; CI catches drift. Run both.

---

## The QA pyramid

```
        ▲  Manual a11y (screen reader, keyboard) — per release
       ╱ ╲ Visual regression (per PR, key states)
      ╱   ╲ Automated a11y (axe — every component, every PR)
     ╱     ╲ Token + lint gates (every commit)
    ─────────
```

## 1. Token & lint gates (every commit, fast)

- `scripts/validate_tokens.py` — JSON valid + all aliases resolve.
- **No hard-coded values** — lint/grep for raw hex, px, and timing in component code; every value must trace to a token (CLAUDE.md Output Rules). Fail the build on a raw `#`, `px` in styles outside the token layer, or magic durations.
- `scripts/contrast.py` — gate color/token changes against WCAG (4.5:1 text, 3:1 UI; 7:1 if targeting AAA).
- **`scripts/measure_render.mjs` (real-render gate)** — the static checks above verify the token palette; this verifies the **actual rendered result**. It opens the HTML in headless Chromium, disables transitions/animations, walks the DOM, and measures every visible text element's computed-style contrast against its true alpha-composited background, in light and `--dark`. Use this to catch defects static checks can't (wrong variant rendering dark-on-color, a transparent button over the wrong surface, a transition mid-state). Requires Playwright (`npm i -D playwright`); skips cleanly if absent.

## 2. Automated accessibility (every PR)

- Run **axe-core** (or Pa11y/Lighthouse a11y) against each component's stories/states. Zero serious/critical violations to merge.
- Cover the states that change semantics: error, loading (`aria-busy`), disabled, expanded, selected — not just default.
- Automated tools catch ~30–40% of issues; they gate the floor, not the ceiling. Pair with #4.

## 3. Visual regression (every PR)

- Snapshot each component across **variants × sizes × states × themes** (light/dark) — e.g. Chromatic, Playwright/Storybook screenshots, Percy.
- Snapshot at key breakpoints (`tokens/breakpoints.json`) to catch reflow/overflow.
- Freeze animations and use deterministic data so diffs are real, not flaky. Review intentional diffs; block unintended ones.
- Include RTL snapshots (`accessibility/i18n-rtl.md`) and a pseudo-locale frame to catch expansion clipping.

## 4. Manual a11y (per release, the ceiling)

- Keyboard-only pass: Tab order logical, all actions reachable, focus visible and never trapped/obscured (WCAG 2.4.11).
- Screen reader pass (VoiceOver + NVDA at minimum): name/role/state announced correctly; live regions fire (`accessibility/aria-patterns.md` SR checklist).
- Zoom 400% reflow + 200% text-spacing override (`accessibility/vision.md`).
- Reduced-motion + forced-colors modes behave.

## CI wiring

- PR pipeline: gates #1 → #2 → #3 (fail fast on the cheap ones first).
- Release pipeline: + the manual #4 checklist signed off.
- Track flake rate on visual tests; quarantine, don't disable.

## Verification
- Can an unreviewed PR introduce a contrast failure, a raw hex, or an axe violation? If yes, a gate is missing.
- Do snapshots cover dark mode, RTL, and the semantic-changing states — or only the happy path?
