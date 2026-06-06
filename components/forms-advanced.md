# Advanced Form Components

Complex input controls beyond the basic atoms. Each has a strict ARIA pattern (`accessibility/aria-patterns.md`) and all 8 states. Render via the [Framework Adapter Protocol](../frameworks/adapter-protocol.md).

---

## 1. Combobox / Autocomplete

Text input with a filtered list of suggestions.

**Anatomy:** `[input] [clear?] [toggle ▾] → [listbox [option]…]`

**Variants:** autocomplete (free text + suggestions), select-only (must pick), multi-select (chips), async (debounced fetch + loading).

**Sizes:** input height from `tokens/sizing.json` control scale.

**States (8):** default, hover, focus, open (popup), selected/active-descendant, disabled, loading (fetching), error.

**Accessibility (ARIA Combobox pattern):**
- Input `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, `aria-autocomplete`.
- Popup `role="listbox"`; options `role="option"` with `aria-selected`.
- `↓/↑` move active option, `Enter` select, `Esc` close, `Home/End`; typing filters. Announce result count politely.

---

## 2. Select (enhanced)

Custom-styled selection from a list (single or multi), groups, custom rendering.

**Anatomy:** `[trigger (value/placeholder) ▾] → [listbox [group][option]…]`

**Variants:** single, multi (chips + count), grouped (`optgroup`), searchable (→ becomes a combobox), with icons/descriptions per option.

**States (8):** default, hover, focus, open, selected, disabled, loading, error (`state.error.border`).

**Accessibility:**
- Prefer native `<select>` when styling allows — free a11y. For custom: ARIA Listbox or Combobox pattern (above).
- Trigger announces current value; `aria-expanded`; keyboard parity with native select (typeahead, arrows, `Esc`).

---

## 3. Slider / Range

Select a value (or range) along a continuum.

**Anatomy:** `track [filled] ●(thumb)` single or `●——●` dual-thumb.

**Variants:** single value, range (two thumbs), stepped/ticks, vertical.

**Sizes:** thumb ≥ 24×24 target (`sizing.control.xs`); larger for touch.

**States (8):** default, hover (thumb grows), focus (`focus-ring` on thumb), active (dragging), filled track, disabled, loading (n/a), error.

**Accessibility (ARIA Slider pattern):**
- Thumb `role="slider"`, `aria-valuenow/min/max`, `aria-valuetext` (human-readable, e.g. "$50"), `aria-label`.
- `←/→/↑/↓` step, `Home/End`, `PageUp/PageDown` large step. Each thumb separately focusable in a range.
- Visible current value; don't rely on position alone.

---

## 4. Date / Time Picker

Pick a date, range, or time.

**Anatomy:** `[input] [calendar icon] → [popover: month grid / time list]`

**Variants:** single date, range, date-time, inline vs. popover, with min/max + disabled dates, presets.

**States (8):** default, hover (day cells), focus (focused day), selected (day/range endpoints + in-range fill), today marker, disabled days, loading, error (invalid input).

**Accessibility:**
- Text input accepts typed dates (don't force the calendar) — supports password managers / autofill where relevant.
- Calendar = grid (`role="grid"`, `gridcell`); `←/→/↑/↓` by day/week, `PageUp/Down` month, `Home/End` week. Announce focused date; `aria-selected` on chosen.
- Localized format; respect locale first-day-of-week.

---

## 5. File Upload

Add files via button or drag-and-drop.

**Anatomy:** `[dropzone: icon + "Drag files or browse"] → [file list: name • size • progress • remove]`

**Variants:** single/multiple, drag-drop + click, image preview, with type/size constraints.

**States (8):** default, hover, focus (keyboard), drag-over (active dropzone), uploading (per-file progress), success, disabled, error (rejected type/size — say which + the limit).

**Accessibility:**
- Real `<input type="file">` reachable by keyboard (drag-drop is an enhancement, never the only path).
- Each file row labeled; remove = labeled button. Progress via `role="progressbar"`.
- Errors explain the constraint and how to fix (`content/voice-tone.md`).
