# Data-Display Components

Components that present structured or browsable data: Calendar, Carousel, and Tree. Each uses a documented WAI-ARIA pattern (`accessibility/aria-patterns.md`) and renders via the [Framework Adapter Protocol](../frameworks/adapter-protocol.md). For tabular data see `components/organisms.md` (Data Table); for charts see `components/data-viz.md`.

---

## 1. Calendar / Date Grid

Standalone month grid for picking or displaying dates. The popover-wrapped picker variant lives in `components/forms-advanced.md` (Date Picker) — this is the grid itself.

**Anatomy:** `[header: ‹ prev | month year | next ›] [weekday row] [day grid 6×7] [footer: Today / Clear?]`

**Variants:**
| Variant | Use |
|---------|-----|
| Single date | Pick one day |
| Range | Start→end selection with in-range fill (`semantic.interactive.selected-bg` at reduced opacity) |
| Multi-month | 2–3 grids side-by-side for range picking |
| With time | Grid + time selector below |
| Display-only | Read-only schedule/availability heatmap |

**Sizes:** cell hit area ≥ `sizing.control.xs` (24px); md grid uses `sizing.control.md` cells. Gap from `spacing` scale.

**States (8):** default, hover (cell `interactive.hover-bg`), focus (roving `shadow.focus-ring`), selected (`interactive.selected-bg`), today (ringed via `border.strong` / `aria-current`), disabled (out-of-range, `opacity.disabled`), range-endpoint, in-range (subtle fill).

**Accessibility:**
- `role="grid"` (or `role="application"` for rich range UX); column headers `role="columnheader"` with `abbr` for weekday.
- **Roving tabindex** — one cell tabbable; Arrow keys move day/week, PageUp/Down month, Shift+PageUp/Down year, Home/End week edges, Enter/Space select.
- Selected cell `aria-selected="true"`; today `aria-current="date"`. Announce month/year change on navigation (live region).
- Never convey availability by color alone — pair with icon/label/`aria-disabled`.

---

## 2. Carousel / Slideshow

Sequentially browsable set of slides (media, cards, testimonials).

**Anatomy:** `[viewport (overflow clip)] → [slide track] [prev ‹] [next ›] [pagination dots] [play/pause?]`

**Variants:** single-slide, multi-item (n visible), peek (partial next), fade vs. slide transition, auto-advancing vs. manual, looping vs. bounded.

**Sizes:** slide width via `sizing.aspectRatio` or container fraction; control hit area ≥ 44px recommended.

**Behavior:** transition uses `tokens/motion.json` (`transition.standard`, `ease-out`). Snap to slide boundaries. On multi-item, advance by page or by item (document which).

**States:** default, hover (reveal/enlarge controls), focus (control `shadow.focus-ring`), active slide (dot filled), transitioning, auto-playing (timer), paused, disabled control (at non-looping bound).

**Accessibility:**
- Container `role="region"` (or `group`) with `aria-roledescription="carousel"` + `aria-label`. Slide group `aria-roledescription="slide"` + `aria-label="N of M"`.
- **WCAG 2.2.2** — any auto-advance must be pausable/stoppable; show a visible Pause control and **pause on hover/focus**. Respect `prefers-reduced-motion` (disable autoplay + use fade/instant).
- Prev/Next/dots are real `<button>`s with labels; rotation region `aria-live="off"` while auto, `"polite"` after user interaction.
- Off-screen slides `aria-hidden`/`inert` so they're skipped by Tab and SR.

---

## 3. Tree View

Hierarchical, expandable list (file explorers, nav, nested categories).

**Anatomy:** `[node: ▸ twisty | icon? | label | badge/count?] [indent guides] [nested group]`

**Variants:** single-select, multi-select (tri-state checkboxes), with icons, draggable-reorder, lazy-loaded branches.

**Sizes:** row height `sizing.control.sm`/`md`; indent step from `spacing` scale (consistent per level).

**States (8):** default, hover (`interactive.hover-bg`), focus (roving `shadow.focus-ring`), selected (`interactive.selected-bg`), expanded, collapsed, loading (branch spinner + `aria-busy`), disabled.

**Accessibility:**
- `role="tree"` → `role="treeitem"` → nested `role="group"`. Each item: `aria-expanded` (parents only), `aria-level`, `aria-setsize`, `aria-posinset`; selection via `aria-selected`. Multi-select checkboxes use `aria-checked="mixed"` for partial.
- **Roving tabindex** — Up/Down move visible items, Right expands/enters, Left collapses/exits to parent, Home/End to first/last, type-ahead to label, Enter/Space activate/select, `*` expands siblings.
- Twisty is decorative if the row is the control; expose state through `aria-expanded`, never the glyph alone.
