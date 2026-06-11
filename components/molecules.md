# Molecules

Composed of atoms, molecules form functional groups that handle a specific user task.

---

## 1. Form Field

A complete form input unit: label + input + help text + error message.

**Composition:** `Label` + `Input` + (optional) help text + (optional) error text

**Anatomy:**
```
┌─────────────────────────────┐
│ Label *                     │  ← Label atom + required indicator
│ ┌─────────────────────────┐ │
│ │ [icon] Placeholder...   │ │  ← Input atom
│ └─────────────────────────┘ │
│ Help text or error message  │  ← Caption text style
└─────────────────────────────┘
```

**Layout:**
- Stack: vertical (default) — label on top
- Inline: horizontal — label left, input right (forms with short labels)
- Label-input gap: `spacing.stack.xs` (4px)
- Input-help gap: `spacing.stack.xs` (4px)
- Field-to-field gap: `spacing.stack.lg` (16px)

**States:**
- Default → Hover → Focus → Filled → Error → Disabled
- Error replaces help text, uses `feedback.error-text` color + error icon
- Required: asterisk on label + `aria-required="true"` on input

**Responsive:**
- Inline layout collapses to stacked below `md` breakpoint
- In multi-column forms, fields span full width below `sm`

**Accessibility:**
- `<label for>` associates label with input
- Help text: `aria-describedby` on input
- Error: `aria-invalid="true"` + `aria-describedby` pointing to error message
- Error message includes `role="alert"` or is in a live region

---

## 2. Search Bar

A text input optimized for search with clear functionality and optional suggestions.

**Composition:** `Icon` (search) + `Input` (type="search") + `Button` (clear) + optional dropdown

**Anatomy:**
```
┌─────────────────────────────────────┐
│ Search products...          [×] │
└─────────────────────────────────────┘
│ Recent: Blue widget                 │  ← Optional suggestion dropdown
│ Popular: Red gadget                 │
└─────────────────────────────────────┘
```

**Variants:**
| Variant | Behavior |
|---------|----------|
| Instant | Filters as you type (debounce 300ms) |
| Submit | Search on Enter or button click |
| Combobox | Shows autocomplete suggestions |

**States:** Empty, Typing (show clear button), Has value, Loading (spinner replaces search icon), No results

**Responsive:**
- Desktop: full width in toolbar or constrained by container
- Mobile: collapses to icon button → expands to full-width overlay on tap

**Accessibility:**
- `role="search"` on container or use `<search>` element
- `type="search"` provides native clear on some browsers
- Clear button: `aria-label="Clear search"`
- With suggestions: use Combobox ARIA pattern (`aria-patterns.md` → Combobox)
- Announce result count: live region "5 results found"

---

## 3. Card

A contained surface grouping related content and actions.

**Composition:** `[image?]` + `[header: Badge? + Title + Subtitle?]` + `[body]` + `[footer: Button*]`

**Anatomy:**
```
┌──────────────────────────────┐
│         [Image/Media]         │  ← Optional media slot
├──────────────────────────────┤
│ [Badge]                       │
│ Card Title            [Menu]  │  ← heading-5 + optional overflow menu
│ Supporting text               │  ← body-sm, text-secondary
├──────────────────────────────┤
│ Body content area             │  ← body-base
├──────────────────────────────┤
│           [Cancel] [Action]   │  ← Footer with actions
└──────────────────────────────┘
```

**Variants:**
| Variant | Border | Shadow | Use Case |
|---------|--------|--------|----------|
| Outlined | `border.default` | none | Lists, dense layouts |
| Elevated | none | `shadow.sm` | Standalone, dashboards |
| Interactive | `border.default` | `shadow.sm` on hover | Clickable cards |
| Filled | none | none | On sunken backgrounds |

**Token Mapping:** `component.card.*`, `spacing.card.*`, `radius.card`

**Layout:**
- Padding: `spacing.card.padding` (24px), compact: `spacing.card.padding-sm` (16px)
- Internal gap: `spacing.card.gap` (16px)
- Image: full-bleed (no padding) with `border-radius` top corners only

**Responsive:**
- Grid: 3 columns (desktop) → 2 (tablet) → 1 (mobile)
- Card min-width: 280px; max-width: none (fills grid cell)

**Accessibility:**
- Interactive card: wrap in `<a>` or `<button>` with full-card click area
- If card has multiple links, use "stretched link" pattern with one primary `<a>`
- Card title should be a heading level appropriate to page hierarchy
- Image: meaningful `alt` text or `alt=""` if title duplicates content

---

## 4. Navigation Item

A single item within a navigation structure (sidebar, tabs, breadcrumbs).

**Composition:** `Icon` + `Label` + `Badge?` + `Chevron?` (for nested)

**Anatomy:**
```
┌──────────────────────────────┐
│ [icon]  Label          [3]  │  ← Icon + text + count badge
└──────────────────────────────┘
```

**Variants:**
| Variant | Context |
|---------|---------|
| Sidebar item | Vertical navigation with icon + text |
| Tab item | Horizontal tab bar |
| Breadcrumb item | Path trail with separator |
| Bottom nav item | Mobile bottom bar (icon + label stacked) |

**States:** Default, Hover, Active/Current, Focus, Disabled

**Active Indicator:**
- Sidebar: left border 3px `action.primary` + `interactive.selected-bg`
- Tab: bottom border 2px `action.primary`
- Breadcrumb: bold text, no link

**Token Mapping:**
- Text: `text.secondary` (default), `text.primary` (active)
- Background: transparent (default), `interactive.selected-bg` (active)
- Icon: matches text color

**Accessibility:**
- Use `<nav aria-label="Main navigation">` wrapper
- Current item: `aria-current="page"` (sidebar/breadcrumb) or `aria-selected="true"` (tabs)
- Collapsible groups: `aria-expanded` on parent
- Badge count: `aria-label="Messages, 3 unread"` on the nav item

---

## 5. Alert

A contextual message communicating feedback, status, or important information.

**Composition:** `Icon` + `[Title?]` + `Message` + `[Action?]` + `[Close?]`

**Anatomy:**
```
┌──────────────────────────────────────┐
│ ⓘ  Alert Title                  [×] │
│    Alert message with details.       │
│    [Action Link]                     │
└──────────────────────────────────────┘
```

**Variants:**
| Variant | Icon | Colors | Use Case |
|---------|------|--------|----------|
| Info | ⓘ | `feedback.info-*` | Tips, general information |
| Success | (pass) | `feedback.success-*` | Completed actions |
| Warning | Warning: | `feedback.warning-*` | Potential issues |
| Error | (x) | `feedback.error-*` | Failures, blocking issues |

**Layout:**
- Full-width within container (not page-width)
- Padding: `spacing.card.padding-sm` (16px)
- Icon-text gap: `spacing.inline.md` (12px)
- Border-left: `border.width.thick` (4px) in variant color
- Radius: `radius.card` (8px)

**Behavior:**
- Inline alerts: persistent, dismissed by user or resolved condition
- Toast alerts: auto-dismiss after 5s (non-critical) or persistent (errors)
- Stacking: newest on top, max 3 visible

**Accessibility:**
- Use `role="alert"` for dynamic errors/warnings (assertive)
- Use `role="status"` for success messages (polite)
- Inline informational alerts: no ARIA role needed (static content)
- Dismiss button: `aria-label="Dismiss alert"`
- Icon: `aria-hidden="true"` (role is communicated by color/text, not icon alone)
- Never rely solely on color — icon + text + border all convey the variant

---

## 6. Dropdown

A button-triggered floating panel with a list of options or actions.

**Composition:** `Button` (trigger) + floating `[list of items]`

**Anatomy:**
```
[Trigger Button ▾]
┌────────────────────────┐
│ [icon] Option One      │  ← menu item
│ [icon] Option Two      │
│────────────────────────│  ← separator
│ [icon] Danger Action   │  ← destructive variant
└────────────────────────┘
```

**Variants:**
| Variant | Trigger | Content |
|---------|---------|---------|
| Menu | Button with chevron | Action items (`role="menu"`) |
| Select | Input-like trigger | Option selection (`role="listbox"`) |
| Multi-select | Input-like trigger | Checkable options |
| Context menu | Right-click | Action items |

**Layout:**
- Min-width: trigger width; Max-width: 320px
- Item height: 36px (md), 32px (sm)
- Padding: `spacing.component.input-padding-*`
- Shadow: `shadow.lg`
- Radius: `radius.dropdown` (8px)
- Placement: bottom-start (default), auto-flip when near viewport edges

**States (items):** Default, Hover, Focus, Active, Selected (checkmark), Disabled (gray, skip in keyboard nav)

**Behavior:**
- Opens on click (not hover)
- Closes on: selection, Escape, click outside
- Scroll: max-height with overflow if > 8 items visible
- Type-ahead: typing characters focuses matching item

**Accessibility:**
- Menu variant: see `aria-patterns.md` → Menu
- Select variant: see `aria-patterns.md` → Listbox
- Trigger: `aria-haspopup="true"`, `aria-expanded="true/false"`
- Items: `role="menuitem"` or `role="option"`
- Keyboard: Down/Up arrows navigate, Enter selects, Escape closes
