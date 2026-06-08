# WAI-ARIA Design Patterns

Reference for implementing accessible interactive components. Each pattern defines roles, properties, keyboard interactions, and focus management per the WAI-ARIA Authoring Practices Guide (APG).

---

## 1. Accordion

Vertically stacked headers that expand/collapse associated content panels.

**Roles & Properties:**
```html
<div class="accordion">
  <h3>
    <button aria-expanded="false" aria-controls="panel-1" id="header-1">
      Section Title
    </button>
  </h3>
  <div id="panel-1" role="region" aria-labelledby="header-1" hidden>
    <p>Panel content...</p>
  </div>
</div>
```

**Keyboard:**
| Key | Action |
|-----|--------|
| Enter / Space | Toggle expanded/collapsed |
| Tab | Move to next focusable element |
| Down Arrow (optional) | Move focus to next accordion header |
| Up Arrow (optional) | Move focus to previous accordion header |
| Home (optional) | Move focus to first header |
| End (optional) | Move focus to last header |

**Focus Management:** Focus stays on the button. Panel content enters tab order when expanded.

---

## 2. Alert

A live region that announces important, time-sensitive information.

**Roles & Properties:**
```html
<div role="alert">
  Form submitted successfully.
</div>
<!-- Or for dismissible alerts: -->
<div role="alert" aria-live="assertive" aria-atomic="true">
  <p>Error: Email is required.</p>
  <button aria-label="Dismiss alert">×</button>
</div>
```

**Key Rules:**
- `role="alert"` implicitly sets `aria-live="assertive"` and `aria-atomic="true"`
- Content injected into the live region is announced immediately
- Do NOT move focus to the alert unless it contains interactive elements the user must address
- Dismissible alerts need a close button with accessible label

---

## 3. Button

A clickable element that triggers an action (not navigation — use `<a>` for links).

**Roles & Properties:**
```html
<!-- Native button (preferred) -->
<button type="button">Save</button>

<!-- Toggle button -->
<button type="button" aria-pressed="false">Mute</button>

<!-- Custom element (avoid if possible) -->
<div role="button" tabindex="0">Custom Action</div>
```

**Keyboard:**
| Key | Action |
|-----|--------|
| Enter | Activate button |
| Space | Activate button (prevent scroll) |

**Key Rules:**
- Always prefer native `<button>` — it provides keyboard, focus, and activation for free
- `role="button"` on non-button elements requires `tabindex="0"`, Enter, and Space handlers
- Toggle buttons use `aria-pressed` (true/false), NOT `aria-checked`
- Icon-only buttons need `aria-label` or visually hidden text

---

## 4. Checkbox

A control that allows toggling between checked and unchecked states.

**Roles & Properties:**
```html
<!-- Native (preferred) -->
<label>
  <input type="checkbox" checked />
  Accept terms
</label>

<!-- Tri-state (mixed) checkbox -->
<div role="checkbox" aria-checked="mixed" tabindex="0">
  Select all
</div>
```

**Keyboard:**
| Key | Action |
|-----|--------|
| Space | Toggle checked state |
| Tab | Move to next focusable element |

**Key Rules:**
- `aria-checked`: `true`, `false`, or `mixed` (tri-state for "select all" patterns)
- Group related checkboxes with `role="group"` and `aria-labelledby`
- Mixed state: cycles true → false → mixed (or true → false in simple implementations)

---

## 5. Dialog (Modal)

An overlay window that requires user interaction before returning to the main page.

**Roles & Properties:**
```html
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby="dialog-desc">
  <h2 id="dialog-title">Confirm Delete</h2>
  <p id="dialog-desc">This action cannot be undone.</p>
  <button>Cancel</button>
  <button>Delete</button>
</div>
```

**Keyboard:**
| Key | Action |
|-----|--------|
| Tab | Cycle focus within dialog (focus trap) |
| Shift+Tab | Reverse cycle within dialog |
| Escape | Close dialog |

**Focus Management:**
1. On open: move focus to first focusable element (or the dialog itself if no focusable child)
2. Trap focus: Tab and Shift+Tab cycle within the dialog only
3. On close: return focus to the element that triggered the dialog
4. Set `aria-hidden="true"` on all content behind the dialog (or use `<dialog>` element with `inert`)

---

## 6. Disclosure (Show/Hide)

A button that controls the visibility of a section of content.

**Roles & Properties:**
```html
<button aria-expanded="false" aria-controls="details-1">
  Show Details
</button>
<div id="details-1" hidden>
  <p>Additional details here...</p>
</div>
```

**Keyboard:**
| Key | Action |
|-----|--------|
| Enter / Space | Toggle visibility |

**Key Rules:**
- Simpler than accordion — no header grouping needed
- `aria-expanded` on the button, NOT on the content
- Use `hidden` attribute or `display: none` to truly hide content from screen readers

---

## 7. Listbox

A list of options where the user selects one or more items.

**Roles & Properties:**
```html
<label id="label-1">Choose color</label>
<ul role="listbox" aria-labelledby="label-1" tabindex="0">
  <li role="option" aria-selected="true">Red</li>
  <li role="option" aria-selected="false">Green</li>
  <li role="option" aria-selected="false">Blue</li>
</ul>

<!-- Multi-select -->
<ul role="listbox" aria-labelledby="label-2" aria-multiselectable="true" tabindex="0">
  <li role="option" aria-selected="false">Option A</li>
  <li role="option" aria-selected="true">Option B</li>
</ul>
```

**Keyboard:**
| Key | Action |
|-----|--------|
| Down Arrow | Move focus to next option |
| Up Arrow | Move focus to previous option |
| Home | Move focus to first option |
| End | Move focus to last option |
| Space (multi-select) | Toggle selection |
| Shift+Down/Up (multi-select) | Extend selection |
| Ctrl+A (multi-select) | Select all |

**Focus Management:** Use `aria-activedescendant` on the listbox (container keeps focus) or move `tabindex` between options (roving tabindex).

---

## 8. Menu & Menubar

A widget that offers a list of actions or functions.

**Roles & Properties:**
```html
<button aria-haspopup="true" aria-expanded="false" aria-controls="menu-1">
  Actions
</button>
<ul role="menu" id="menu-1">
  <li role="menuitem">Edit</li>
  <li role="menuitem">Duplicate</li>
  <li role="separator"></li>
  <li role="menuitem">Delete</li>
</ul>
```

**Keyboard:**
| Key | Action |
|-----|--------|
| Enter / Space | Activate menu item |
| Down Arrow | Move to next item |
| Up Arrow | Move to previous item |
| Right Arrow (menubar) | Move to next top-level item |
| Left Arrow (menubar) | Move to previous top-level item |
| Escape | Close menu, return focus to trigger |
| Home | First item |
| End | Last item |
| Type-ahead | Focus item starting with typed character |

**Focus Management:** Focus moves into menu on open. Escape returns focus to trigger button.

---

## 9. Radio Group

A set of mutually exclusive options.

**Roles & Properties:**
```html
<div role="radiogroup" aria-labelledby="group-label">
  <span id="group-label">Shipping method</span>
  <label><input type="radio" name="ship" value="standard" checked /> Standard</label>
  <label><input type="radio" name="ship" value="express" /> Express</label>
  <label><input type="radio" name="ship" value="overnight" /> Overnight</label>
</div>
```

**Keyboard:**
| Key | Action |
|-----|--------|
| Tab | Move into/out of radio group (focuses selected or first) |
| Down / Right Arrow | Select next radio |
| Up / Left Arrow | Select previous radio |
| Space | Select focused radio (if not auto-select) |

**Key Rules:**
- Only ONE radio in the group is in the tab order (the selected one, or first if none selected)
- Arrow keys move selection AND focus (roving tabindex)
- Wraps: Down from last → first, Up from first → last

---

## 10. Slider (Range)

A control for selecting a value within a range.

**Roles & Properties:**
```html
<label id="vol-label">Volume</label>
<input type="range" min="0" max="100" value="50" step="1"
       aria-labelledby="vol-label" aria-valuemin="0" aria-valuemax="100"
       aria-valuenow="50" aria-valuetext="50%">

<!-- Custom slider -->
<div role="slider" tabindex="0"
     aria-labelledby="vol-label"
     aria-valuemin="0" aria-valuemax="100"
     aria-valuenow="50" aria-valuetext="50%">
</div>
```

**Keyboard:**
| Key | Action |
|-----|--------|
| Right / Up Arrow | Increase by step |
| Left / Down Arrow | Decrease by step |
| Page Up | Increase by large step (10×) |
| Page Down | Decrease by large step (10×) |
| Home | Set to minimum |
| End | Set to maximum |

**Key Rules:**
- `aria-valuetext` for non-numeric display (e.g., "Medium", "50%", "$100")
- For range sliders (two thumbs), use two `role="slider"` elements

---

## 11. Switch (Toggle)

An on/off control similar to a checkbox but semantically indicates an immediate state change.

**Roles & Properties:**
```html
<button role="switch" aria-checked="false">
  Dark Mode
</button>

<!-- Or with hidden input for form submission -->
<label>
  <span>Notifications</span>
  <button role="switch" aria-checked="true" aria-label="Notifications">
    <span class="thumb"></span>
  </button>
</label>
```

**Keyboard:**
| Key | Action |
|-----|--------|
| Space | Toggle on/off |
| Enter | Toggle on/off |

**Key Rules:**
- Use `role="switch"` with `aria-checked`, NOT `role="checkbox"`
- Switch implies immediate effect (no Submit button needed)
- Provide visible on/off labels or states for users who can't perceive color

---

## 12. Tabs

A set of layered sections, only one visible at a time, selected via tab buttons.

**Roles & Properties:**
```html
<div role="tablist" aria-label="Project settings">
  <button role="tab" id="tab-1" aria-selected="true" aria-controls="panel-1">General</button>
  <button role="tab" id="tab-2" aria-selected="false" aria-controls="panel-2" tabindex="-1">Members</button>
  <button role="tab" id="tab-3" aria-selected="false" aria-controls="panel-3" tabindex="-1">Billing</button>
</div>
<div role="tabpanel" id="panel-1" aria-labelledby="tab-1">General content</div>
<div role="tabpanel" id="panel-2" aria-labelledby="tab-2" hidden>Members content</div>
<div role="tabpanel" id="panel-3" aria-labelledby="tab-3" hidden>Billing content</div>
```

**Keyboard:**
| Key | Action |
|-----|--------|
| Tab | Move into tablist → selected tab. Tab again → into panel content. |
| Right Arrow | Activate next tab |
| Left Arrow | Activate previous tab |
| Home | Activate first tab |
| End | Activate last tab |
| Delete (optional) | Remove closeable tab |

**Focus Management:**
- Only the active tab has `tabindex="0"`; others have `tabindex="-1"` (roving tabindex)
- Arrow keys move focus AND activate (automatic activation) — preferred for fast switching
- Alternative: Arrow keys move focus only, Enter/Space to activate (manual activation) — for expensive content loads

---

## 13. Tooltip

A popup that displays a description for an element on hover or focus.

**Roles & Properties:**
```html
<button aria-describedby="tip-1">
  <svg><!-- icon --></svg>
  <span class="sr-only">Settings</span>
</button>
<div role="tooltip" id="tip-1">
  Open application settings
</div>
```

**Keyboard:**
| Key | Action |
|-----|--------|
| Escape | Dismiss tooltip |
| Tab (to trigger) | Show tooltip |
| Tab (away) | Hide tooltip |

**Key Rules:**
- Tooltip appears on hover AND focus
- Content is supplementary — never put essential info only in tooltips
- `role="tooltip"` + `aria-describedby` links tooltip to trigger
- Per WCAG 1.4.13: tooltip must be dismissible (Escape), hoverable, and persistent
- Do NOT put interactive elements inside tooltips — use a Popover/Disclosure instead

---

## 14. Tree View

A hierarchical list where items can be expanded/collapsed.

**Roles & Properties:**
```html
<ul role="tree" aria-label="File explorer">
  <li role="treeitem" aria-expanded="true">
    src
    <ul role="group">
      <li role="treeitem" aria-expanded="false">
        components
        <ul role="group">
          <li role="treeitem" class="leaf">Button.tsx</li>
        </ul>
      </li>
      <li role="treeitem" class="leaf">index.ts</li>
    </ul>
  </li>
</ul>
```

**Keyboard:**
| Key | Action |
|-----|--------|
| Down Arrow | Next visible treeitem |
| Up Arrow | Previous visible treeitem |
| Right Arrow | Expand (if collapsed) or move to first child |
| Left Arrow | Collapse (if expanded) or move to parent |
| Home | First treeitem |
| End | Last visible treeitem |
| Enter | Activate item |
| Space | Select item (multi-select: toggle) |
| * | Expand all siblings |
| Type-ahead | Focus matching item |

**Focus Management:** Single `tabindex="0"` in the tree, roving tabindex moves with arrow keys.

---

## 15. Combobox (Autocomplete)

A text input with a popup listbox for suggestions.

**Roles & Properties:**
```html
<label for="city-input">City</label>
<div class="combobox-wrapper">
  <input id="city-input" role="combobox"
         aria-expanded="false"
         aria-autocomplete="list"
         aria-controls="city-listbox"
         aria-activedescendant="">
  <ul role="listbox" id="city-listbox" hidden>
    <li role="option" id="opt-1">Bangkok</li>
    <li role="option" id="opt-2">Berlin</li>
    <li role="option" id="opt-3">Boston</li>
  </ul>
</div>
```

**Keyboard:**
| Key | Action |
|-----|--------|
| Down Arrow | Open popup / move to next option |
| Up Arrow | Move to previous option |
| Enter | Select highlighted option, close popup |
| Escape | Close popup, clear selection |
| Home/End | Move cursor within input |
| Type | Filter options |
| Alt+Down | Open popup without changing selection |

**Focus Management:**
- Focus always stays in the input
- Use `aria-activedescendant` to indicate which option is visually highlighted
- Update `aria-expanded` when popup opens/closes
- Announce result count to screen readers (e.g., "3 results available" via live region)

---

## 16. Carousel

Browsable slide set (`components/data-display.md`).

**Roles:** container `role="group"` (or `region`) + `aria-roledescription="carousel"` + `aria-label`. Each slide `role="group"` + `aria-roledescription="slide"` + `aria-label="N of M"`.

**Keyboard:** Prev/Next/dots are real `<button>`s, reachable by Tab and activated by Enter/Space. Off-screen slides `inert`/`aria-hidden`.

**Auto-rotation (WCAG 2.2.2):** visible Pause/Play control; pause on hover and on keyboard focus within. Rotating region `aria-live="off"` while auto-advancing, switch to `"polite"` after the user takes manual control. Disable autoplay under `prefers-reduced-motion`.

---

## 17. Grid (Calendar / Data Grid)

Two-dimensional navigable cells — date pickers (`components/data-display.md`) and interactive tables.

**Roles:** `role="grid"` → `role="row"` → `role="gridcell"` (or `columnheader`/`rowheader`). For a date grid, column headers carry weekday names (`abbr`).

**Keyboard (roving tabindex — one cell tabbable):** Arrow keys move between cells; Home/End to row edges; Ctrl+Home/End to grid corners; PageUp/Down for month (calendar); Enter/Space selects/activates. Selected cell `aria-selected="true"`; today `aria-current="date"`.

**Announce:** month/year changes via a polite live region; for data grids, expose sort state with `aria-sort` on the header.

---

## 18. Toolbar

Grouped set of controls (formatting bars, chart actions).

**Roles:** `role="toolbar"` + `aria-label` (or `aria-orientation` if vertical).

**Keyboard (roving tabindex):** Toolbar is a single tab stop; Left/Right (or Up/Down when vertical) move between controls; Home/End jump to first/last. Tab moves *out* of the toolbar. Nested controls keep their own activation keys.

---

## 19. Feed

Scrollable stream of comparable articles (timelines, infinite lists).

**Roles:** container `role="feed"` (+ `aria-busy` while loading more); each item `role="article"` with `aria-labelledby`, `aria-posinset`, and `aria-setsize` (use a large/estimated value for infinite feeds).

**Keyboard:** PageDown/PageUp move between articles; Home/End to first/last loaded; focus moves *into* article content with Tab. Load more before the user reaches the end to avoid focus loss.

---

## General Patterns

### Focus Indicator Spec
All interactive elements must have a visible focus indicator:
- Minimum: 2px solid outline with 3:1 contrast against adjacent colors
- Recommended: Use the `focus-ring` shadow token (2px white + 2px blue double ring)
- Use `outline-offset: 2px` to prevent overlap with component borders
- Honor `prefers-reduced-motion` but NEVER remove focus indicators

### Roving Tabindex Pattern
For composite widgets (tabs, radio groups, tree views, menus):
1. Container has a single tab stop
2. Selected/active child has `tabindex="0"`, all others have `tabindex="-1"`
3. Arrow keys move `tabindex="0"` between children
4. Tab moves focus out of the entire widget

### Live Region Priority
| Urgency | Attribute | Use Case |
|---------|-----------|----------|
| High | `aria-live="assertive"` | Errors, critical alerts |
| Normal | `aria-live="polite"` | Success messages, status updates |
| Status | `role="status"` | Search result counts, loading states |
| Log | `role="log"` | Chat messages, activity feeds |

### Screen Reader Testing Checklist
1. All interactive elements announce their name, role, and state
2. Dynamic content changes are announced via live regions
3. Form errors are announced when they appear
4. Modal open/close is announced; focus is managed
5. Page navigation is announced (SPA route changes need manual announcement)
