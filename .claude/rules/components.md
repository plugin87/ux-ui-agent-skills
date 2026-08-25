# Rule: Component design

Loaded when designing, specifying, or reviewing a component.

Split out of `CLAUDE.md` so it loads only when the work calls for it. The
headings below are unchanged, so any pointer to them still resolves.

---

## Design Principles

### Atomic Design
Build from small to large: **Atoms → Molecules → Organisms → Templates → Pages**
- Atoms are indivisible (Button, Input, Icon)
- Molecules combine atoms for a task (Form Field = Label + Input + Error)
- Organisms are complex sections (Header, Data Table, Modal)
- Templates define page-level layout (Dashboard, Auth, Settings)
- Reference: `components/atoms.md`, `components/molecules.md`, `components/organisms.md`, `components/templates.md`

### Design Thinking
Follow the double diamond: **Discover → Define → Develop → Deliver**
- Diverge before converging — explore multiple solutions before committing
- Validate at every fidelity level (see `workflows/prototyping.md`)
- User research is not optional — see the usability testing script in `workflows/prototyping.md`

### Inclusive Design
Design for the edges, and the center benefits:
- WCAG 2.2 AA is the **minimum**, not the goal — see `accessibility/wcag-checklist.md`
- Keyboard navigation is not an afterthought — it's designed first
- Color is never the only way to convey information
- Target sizes: 24×24px minimum (WCAG 2.5.8), 44×44px recommended for primary actions
- See ARIA implementation patterns in `accessibility/aria-patterns.md`

### Progressive Disclosure
Show only what's needed at each step:
- Primary actions are always visible
- Secondary actions are one interaction away (menu, expand)
- Advanced options are behind explicit "Advanced" disclosure
- Empty states guide users to the first action
- Error messages explain what happened AND how to fix it

---

## Narrow-width defences (the four causes that actually bite)

A layout that fits at 280px on one machine can overflow on another, because font
metrics differ per platform. Prove it with `node scripts/verify_responsive.mjs
<file|dir> --scale=1.25`, and know the usual causes:

1. **An `<input>` keeps an intrinsic width of about twenty characters.** In a grid
   that intrinsic width sizes the column. Fix: `inline-size:100%; min-inline-size:0`.
2. **A grid or flex item keeps `min-width:auto`**, so a child that refuses to shrink
   widens its own track. Fix: `min-inline-size:0` on the item, or pin the track with
   `grid-template-columns:minmax(0,1fr)`.
3. **One unbreakable token** — an email, a URL, an API key — sets the element's
   min-content width. Fix: `overflow-wrap:anywhere`, which shrinks min-content too;
   `break-word` alone does not.
4. **A `white-space:nowrap` tooltip or pill has no upper bound.** Fix:
   `max-inline-size:min(<n>rem, calc(100vw - <gutter>))`.

And one that hides from screenshots: an absolutely positioned **`.sr-only` span with
no positioned ancestor** resolves against the initial containing block. Inside a
horizontal scroller it lands outside the viewport and inflates
`document.documentElement.scrollWidth`, so the page reports a huge overflow while
everything visible sits inside it. Give the span a positioned ancestor.

---

## Component Guidelines

### Component Quality Bar
Every component must have:
1. **Anatomy diagram** — Visual structure breakdown
2. **Variants** — All visual variants (primary, secondary, ghost, etc.)
3. **Sizes** — sm, md, lg with exact dimensions
4. **States** — Default, Hover, Focus, Active, Disabled, Loading (minimum 6)
5. **Token mapping** — Every value traced to a design token
6. **Accessibility** — ARIA pattern, keyboard model, screen reader behavior

### Component References
| Level | File | Contents |
|-------|------|----------|
| Atoms | `components/atoms.md` | Button, Input, Label, Icon, Badge, Avatar, Checkbox, Radio, Toggle, Tooltip |
| Molecules | `components/molecules.md` | Form Field, Search Bar, Card, Navigation Item, Alert, Dropdown |
| Organisms | `components/organisms.md` | Header, Sidebar, Form, Data Table, Modal, Drawer |
| Templates | `components/templates.md` | Dashboard, Auth, Settings, List/Detail |

### State Requirements
All interactive components must define these states:

| # | State | Required? | Token Pattern |
|---|-------|-----------|--------------|
| 1 | Default | Always | Base tokens |
| 2 | Hover | Always | `-hover` suffix |
| 3 | Focus | Always | `shadow.focus-ring` |
| 4 | Active/Pressed | Always | `-active` suffix |
| 5 | Disabled | Always | `opacity: 0.5` + no pointer events |
| 6 | Loading | If async | Spinner + `aria-busy` |
| 7 | Error | If input | `border.error` + error message |
| 8 | Selected | If selectable | `interactive.selected-bg` |
