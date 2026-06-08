# Atoms

The smallest, indivisible UI elements. Each atom maps directly to design tokens and has a single, focused responsibility.

---

## 1. Button

The primary interactive control for triggering actions.

**Anatomy:** `[icon?] [label] [icon?]` within a pressable container.

**Variants:**
| Variant | Use Case | Token Mapping |
|---------|----------|---------------|
| Primary | Main CTA — one per visible area | `component.button.primary-*` |
| Secondary | Supporting actions | `component.button.secondary-*` |
| Ghost | Tertiary, toolbar, inline actions | `component.button.ghost-*` |
| Destructive | Delete, remove, irreversible | `component.button.destructive-*` |
| Link | Navigation-styled as button | `semantic.text.link` + underline |

**Sizes:**
| Size | Height | Padding | Font | Icon |
|------|--------|---------|------|------|
| sm | 32px | 12px × 8px | body-sm (14px) | 16px |
| md | 40px | 16px × 10px | body-base (16px) | 20px |
| lg | 48px | 24px × 12px | body-lg (18px) | 24px |

**States (8):**
1. **Default** — resting state
2. **Hover** — cursor over; background shifts one shade
3. **Focus** — keyboard focus; apply `focus-ring` shadow token
4. **Active/Pressed** — mouse down; background shifts two shades
5. **Disabled** — `opacity: 0.5`, `cursor: not-allowed`, `pointer-events: none`
6. **Loading** — replace icon with spinner, add `aria-busy="true"`, disable interaction
7. **Error** — N/A for a standalone button; a submit button reflects form error via the form, not its own style
8. **Selected** — for toggle/segmented buttons only: `interactive.selected-bg` + `aria-pressed`/`aria-selected`

**Accessibility:**
- Native `<button>` element always; never `<div>`
- Icon-only: add `aria-label`
- Loading: `aria-busy="true"`, announce via live region
- Disabled: use `disabled` attribute (removes from tab order) or `aria-disabled="true"` (keeps in tab order for discoverability)
- Minimum target size: 24×24px (WCAG 2.5.8)

---

## 2. Input

Single-line text entry field.

**Anatomy:** `[leading-icon?] [prefix?] [input] [suffix?] [trailing-icon?] [clear?]`

**Variants:** Text, Email, Password (toggle visibility), Number, Search, URL, Tel

**Sizes:**
| Size | Height | Padding | Font |
|------|--------|---------|------|
| sm | 32px | 12px × 8px | body-sm |
| md | 40px | 12px × 10px | body-base |
| lg | 48px | 16px × 12px | body-lg |

**States (8):**
1. **Default** — `input.border` (gray-200)
2. **Hover** — `input.border-hover` (gray-300)
3. **Focus** — `input.border-focus` (blue-500) + focus ring
4. **Active** — N/A for text entry (no pressed state); typing reflects via the caret/value
5. **Disabled** — `input.bg-disabled` + reduced opacity
6. **Loading** — async validation/lookup: trailing spinner + `aria-busy="true"`
7. **Error** — `input.border-error` (red-500) + error icon + message + `aria-invalid`
8. **Selected** — filled/has-value styling; read-only is a variant of default (non-editable, no hover)

**Accessibility:**
- Always associate with `<label>` via `for`/`id`
- Error messages: `aria-describedby` linking to error text + `aria-invalid="true"`
- Required: `aria-required="true"` + visual indicator (asterisk)
- Password toggle: `aria-label="Show password"` / `"Hide password"`

---

## 3. Label

Text label associated with a form control.

**Anatomy:** `[label-text] [required-indicator?] [optional-indicator?]`

**Token Mapping:** `textStyle.label` (14px/medium), `semantic.text.primary`

**Accessibility:**
- Use `<label for="input-id">` — clicking label focuses input
- Required: append `<span aria-hidden="true">*</span>` + `aria-required` on input
- Group labels: use `<legend>` inside `<fieldset>`

---

## 4. Icon

Decorative or informational pictogram.

**Sizes:** 12px, 16px, 20px, 24px, 32px

**Token Mapping:** Inherits `currentColor` from parent.

**Accessibility:**
- **Decorative**: `aria-hidden="true"` (most icons next to text labels)
- **Informational**: `role="img"` + `aria-label="Description"`
- **Interactive**: wrap in `<button>` with `aria-label`

---

## 5. Badge

A small status descriptor for counts or labels.

**Anatomy:** `[dot?] [text] [remove-button?]`

**Variants:**
| Variant | Use Case | Tokens |
|---------|----------|--------|
| Neutral | Default tags | `component.badge.neutral-*` |
| Primary | Active/selected | `component.badge.primary-*` |
| Success | Positive status | `component.badge.success-*` |
| Warning | Attention needed | `component.badge.warning-*` |
| Error | Critical/failed | `component.badge.error-*` |
| Dot | Minimal indicator | 8px circle, no text |

**Sizes:** sm (20px height), md (24px height)

**Token Mapping:** `radius.badge` (full), `spacing.badge-padding-*`

**Accessibility:**
- Notification badges: `aria-label="3 unread messages"` (don't rely on number alone)
- Status badges: pair with descriptive text, not just color

---

## 6. Avatar

A circular representation of a user or entity.

**Anatomy:** `[image | initials | fallback-icon]` within a circle.

**Sizes:** xs (24px), sm (32px), md (40px), lg (48px), xl (64px), 2xl (96px)

**Token Mapping:** `component.avatar.*`, `radius.avatar` (full)

**Fallback Hierarchy:**
1. User-uploaded image
2. Initials (first + last name initial)
3. Generic person icon

**Accessibility:**
- Image avatars: `alt="[User name]"` or `alt=""` if name is adjacent
- Initials: `aria-label="[Full name]"`
- Status indicator (online dot): announce via `aria-label`, not just color

---

## 7. Checkbox

A control for binary or tri-state selection.

**Anatomy:** `[checkbox-box] [label] [help-text?]`

**Sizes:** sm (16px box), md (20px box), lg (24px box)

**States:** Unchecked, Checked, Indeterminate, Hover, Focus, Disabled

**Accessibility:**
- Prefer native `<input type="checkbox">`
- Indeterminate: set via JS `el.indeterminate = true` + `aria-checked="mixed"`
- Group: wrap in `<fieldset>` with `<legend>`
- See `aria-patterns.md` → Checkbox

---

## 8. Radio

A control for selecting exactly one option from a group.

**Anatomy:** `[radio-circle] [label] [help-text?]`

**Sizes:** sm (16px), md (20px), lg (24px)

**States:** Unselected, Selected, Hover, Focus, Disabled

**Accessibility:**
- Always in a `<fieldset>` with `<legend>` describing the group
- Arrow keys navigate between radios
- See `aria-patterns.md` → Radio Group

---

## 9. Toggle (Switch)

An on/off control for immediate state changes.

**Anatomy:** `[track] [thumb]` with optional `[label]` and `[status-text]`

**Sizes:**
| Size | Track | Thumb |
|------|-------|-------|
| sm | 36×20px | 16px |
| md | 44×24px | 20px |
| lg | 52×28px | 24px |

**States:** Off, On, Hover, Focus, Disabled

**Accessibility:**
- Use `role="switch"` with `aria-checked`
- Label must describe what the switch controls
- Avoid using for form submissions — use checkbox instead
- See `aria-patterns.md` → Switch

---

## 10. Tooltip

A non-interactive text popup for supplementary information.

**Anatomy:** `[trigger-element]` → `[tooltip-container] [arrow] [text]`

**Placement:** Top (default), Right, Bottom, Left — auto-flip when near viewport edge.

**Token Mapping:** `surface: gray-900`, `text: white`, `radius: tooltip (md)`, `shadow: md`

**Behavior:**
- Show on hover (300ms delay) and focus
- Hide on mouse leave, blur, Escape, scroll
- Max width: 240px (prevent tooltip walls)
- No interactive content inside

**Accessibility:**
- `role="tooltip"` + `aria-describedby` on trigger
- Must appear on keyboard focus, not just hover
- Content is supplementary, not essential
- See `aria-patterns.md` → Tooltip
