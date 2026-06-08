# Golden Examples — the quality bar, demonstrated

Reference output that shows what "done" looks like, and proves the **single-theme consistency** contract. Use these as the benchmark when generating or reviewing UI.

## Files
- `theme.css` — the ONE shared token theme (light + dark), imported once at the app root. Generated from `tokens/*.json`; contrast-verified in both modes.
- `Button.tsx` — a golden component: `forwardRef`, all 8 states, ARIA wired, dark-mode safe, **zero hardcoded values** (every value is a `var(--…)`).

## The contract these demonstrate
1. **One theme, every page.** Each page imports `theme.css` and references the same `--color-*` variables. No page defines its own palette. Switch brand/dark mode by editing the token source — every page updates.
2. **Real WCAG.** The token pairs in `theme.css` pass WCAG 2.2 AA in light and dark (`scripts/validate_contrast.py`). Link and primary-action colors are tuned per mode.
3. **No drift.** Component code contains no raw hex/px/timing (`scripts/lint_hardcodes.py` returns clean on this folder).

## How it's scored (the bar for any generated UI)
| Dimension | Pass condition | Tool |
|-----------|----------------|------|
| Token-driven | 0 hardcoded colors/sizes/timing | `scripts/lint_hardcodes.py examples/golden` |
| Contrast | required text/action pairs ≥ WCAG AA (light+dark) | `scripts/validate_contrast.py` |
| States | all 8 states present or justified N/A | review vs. `components/*` |
| A11y | role/name/state, keyboard, focus ring, ≥24px target | `a11y-audit` skill |
| Consistency | every page uses `theme.css` tokens only | `scripts/lint_hardcodes.py` across the app |

Regenerating a component should match or beat this bar. If it doesn't, it's not done.
