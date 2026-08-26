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

## Composition, before anything is styled

A blind cold-start run produced two screens that passed all fourteen gates and still
came back from review as "rework". Everything the critic named was a composition
decision no gate can see, so the decisions live here.

1. **One thing leads.** Every screen has a first place for the eye. Four equal stat
   cards, three equal plan cards, a grid of identical tiles: the eye lands nowhere
   and the screen reads as generated. Give the lead item more size, more weight, or
   its own row, and let the rest be quiet.
2. **Display type is a different size, not a bolder body.** The largest heading
   should be at least 2.5x the body size. 24px over 16px is bold body text.
   `taste_audit.mjs` measures this and calls it a HIGH finding.
3. **An empty state owns the viewport it is in.** A small centred block pinned under
   the header with a thousand pixels of nothing below it reads as a page that failed
   to load, not as a considered zero-state. Fill the space or centre in it, and give
   the sparse case real content: what this will look like, what to do first.
4. **A page ends on purpose.** A footer, a summary line, a secondary panel: something
   that says the content is finished rather than missing.
5. **A long list needs one differentiator.** Forty identical cards are forty
   identical cards. Surface something that varies (recency, status, a badge) so the
   eye has somewhere to land while scrolling.
6. **Feedback may not outrun the truth.** A toast that says "Draft project created"
   while the list still shows the same items is a lie the user catches immediately.
   Either change the data or change the copy.
7. **A hidden overflow needs a visible cue.** A table that scrolls sideways inside
   its own region must show that it does - an edge fade, a scrollbar, an arrow. An
   `aria-label` mentioning it serves screen readers only, and sighted users simply
   lose the columns.
8. **Loading is not disabled.** Reusing the disabled dimming for an in-flight action
   reads as "you cannot do this", not "this is happening". Keep the control at full
   strength and swap the label for a spinner.
9. **Nothing that is scaffolding ships.** A preview checkbox, a debug toggle, a
   "test" row: if it is not product, it does not render in the product screen. Put it
   behind a query parameter or a build flag.

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
