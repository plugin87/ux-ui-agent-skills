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
