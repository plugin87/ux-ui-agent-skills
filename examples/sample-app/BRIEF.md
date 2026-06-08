# Test Brief (the "โจทย์")

**Build an Analytics admin with two pages that share one theme:**
1. **Dashboard** — page title, 4 KPI stat cards (responsive 1→2→4 cols), a primary "Export" action.
2. **Settings** — a form (name + notifications toggle) and a "Delete account" flow that opens a **confirmation modal**.

**Requirements (the bar):**
- One shared token theme (`../golden/theme.css`); zero hardcoded colors/sizes/fonts; no raw Tailwind palette utilities.
- Light + dark must both pass WCAG AA.
- The modal MUST use the shared `Modal` primitive (focus trap, role=dialog, aria-modal, Escape, return focus).
- Reuse one `Button` primitive; essential input borders use `border-strong` (3:1).
- Responsive at multiple breakpoints (not a single 768px).

This is fed through the gates (`lint_hardcodes`, `validate_theme_refs`, `validate_contrast`) + a design review to prove the loop closes.
