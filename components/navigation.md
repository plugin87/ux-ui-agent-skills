# Navigation Components

Patterns for moving through and orienting within an interface. Each maps to tokens and an ARIA pattern in `accessibility/aria-patterns.md`. Render via the [Framework Adapter Protocol](../frameworks/adapter-protocol.md).

---

## 1. Tabs

Switch between peer views in the same context.

**Anatomy:** `[tablist [tab][tab][tab]] → [tabpanel]`

**Variants:**
| Variant | Use | Token Mapping |
|---------|-----|---------------|
| Underline | Default content tabs | active border `semantic.action.primary` |
| Pill/Segmented | Compact filters, ≤4 options | selected bg `state.selected.bg` |
| Vertical | Settings, side nav | left-edge active indicator |

**Sizes:** sm/md/lg → control heights from `tokens/sizing.json`.

**States (8):** default, hover (`opacity.subtle` overlay), focus (`focus-ring`), active, selected (active indicator + `text.primary`), disabled (`opacity.disabled`), loading (skeleton panel), error (n/a).

**Accessibility (ARIA Tabs pattern):**
- `role="tablist"` › `role="tab"` (`aria-selected`, `aria-controls`) › `role="tabpanel"` (`aria-labelledby`).
- Roving tabindex; `←/→` move, `Home/End` jump, `Enter/Space` activate (or automatic on focus).
- Selected tab must be distinguished by more than color (indicator + weight).

---

## 2. Breadcrumb

Show hierarchy and the path to the current page.

**Anatomy:** `Home / Section / Subsection / [Current]` with separators.

**Variants:** with/without leading icon; truncating (collapse middle into `…` menu on small screens).

**States:** link items get default/hover/focus; current item is non-interactive (`aria-current="page"`).

**Accessibility:**
- Wrap in `<nav aria-label="Breadcrumb">` › ordered list.
- Current page: `aria-current="page"`, not a link.
- Separators are decorative (`aria-hidden`) — never the only indicator.

---

## 3. Pagination

Navigate across pages of results.

**Anatomy:** `[‹ Prev] [1][2]…[n] [Next ›]` or `[‹] Page X of Y [›]`.

**Variants:** numbered (with ellipsis truncation), prev/next only, load-more, infinite (announce new items via live region).

**Sizes:** controls ≥ `control.xs` (24px) target minimum; recommend `control.md` for touch.

**States (8):** default, hover, focus, active, selected (current page, `aria-current="page"`), disabled (prev on first / next on last), loading (page swap), error.

**Accessibility:**
- `<nav aria-label="Pagination">`; current page `aria-current="page"`.
- Disabled prev/next: `aria-disabled` + removed from tab order or non-actionable.
- Announce result-range changes politely.

---

## 4. Stepper / Progress Steps

Show position within a linear multi-step flow.

**Anatomy:** `①——②——③` with labels; states per step.

**Variants:** horizontal, vertical, numbered vs. icon, with/without descriptions.

**States per step:** upcoming (muted), current (`action.primary` + `aria-current="step"`), completed (check + success), error (one step), disabled.

**Accessibility:**
- `<ol>` of steps; current step `aria-current="step"`.
- Step status conveyed by icon + text, not color alone.
- If steps are navigable, they're buttons/links with clear names ("Step 2: Shipping").

---

## 5. Menu / Menubar

Action lists triggered by a button, or a persistent app menubar with submenus.

**Anatomy:** `[trigger] → [menu [menuitem][separator][submenu ▸]]`

**Variants:** dropdown menu, context menu, menubar, with checkable items (`menuitemcheckbox`/`menuitemradio`), with submenus.

**Sizes:** item height ≥ `control.sm`; comfortable padding from `tokens/spacing.json`.

**States (8):** default, hover, focus, active, selected/checked, disabled, loading (async items), error.

**Accessibility (ARIA Menu pattern):**
- `role="menu"` › `role="menuitem"` (+ `menuitemcheckbox`/`menuitemradio`).
- Roving tabindex; `↑/↓` move, `→/←` open/close submenu, `Enter/Space` activate, `Esc` close + return focus to trigger, typeahead.
- Trigger: `aria-haspopup="menu"`, `aria-expanded`.
- Focus moves into menu on open, returns to trigger on close.
