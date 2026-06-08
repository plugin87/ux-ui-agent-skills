# Golden Examples — the quality bar, demonstrated

Reference output that shows what "done" looks like, and proves the **single-theme consistency** contract. Use these as the benchmark when generating or reviewing UI.

## Files
- `theme.css` — the ONE shared token theme (light + dark): full color, **type scale (`--text-xs..7xl`)**, spacing, radius, sizing, motion, breakpoints, and overlay tokens. Imported once at the app root; generated from `tokens/*.json`; contrast-verified in both modes.
- `Button.tsx` — a golden atom: `forwardRef`, all 8 states, ARIA wired, dark-mode safe, **zero hardcoded values**.
- `Modal.tsx` — the ONE reusable overlay primitive: focus trap, `role="dialog"`, `aria-modal`, `aria-labelledby`, Escape, **return-focus on close**, backdrop (WCAG 2.4.3 + 2.1.2). Reuse it — never hand-roll a dialog per screen.

## The contract these demonstrate
1. **One theme, every page.** Each page imports `theme.css` and references the same `--color-*` variables. No page defines its own palette. Switch brand/dark mode by editing the token source — every page updates.
2. **Real WCAG.** The token pairs in `theme.css` pass WCAG 2.2 AA in light and dark (`scripts/validate_contrast.py`). Link and primary-action colors are tuned per mode.
3. **No drift.** Component code contains no raw hex/px/timing (`scripts/lint_hardcodes.py` returns clean on this folder).

## How it's scored (the bar for any generated UI)
| Dimension | Pass condition | Tool |
|-----------|----------------|------|
| Token-driven | 0 hardcoded colors/sizes/timing/fonts + no raw Tailwind palette utilities | `scripts/lint_hardcodes.py examples/golden` |
| No floating tokens | every `var(--…)` resolves to a defined theme token | `scripts/validate_theme_refs.py` |
| Contrast | required text/action/border pairs ≥ WCAG (light+dark) | `scripts/validate_contrast.py` |
| States | all 8 states present or justified N/A | review vs. `components/*` |
| A11y | role/name/state, keyboard, **modal focus trap + return focus**, ≥24px target | `a11y-audit` skill |
| Consistency | every page uses `theme.css` tokens only; one shared primitive per atom | `scripts/lint_hardcodes.py` across the app |

Regenerating a component should match or beat this bar. If it doesn't, it's not done.
