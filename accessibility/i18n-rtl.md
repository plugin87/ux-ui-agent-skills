# Internationalization & RTL

Design and build so the UI works in any language and writing direction. The cheapest time to internationalize is before launch; retrofitting bidi and text-expansion is expensive. Bake logical properties and externalized strings in from the start.

---

## Logical properties (the foundation)

Use **flow-relative** CSS, never physical, so layout mirrors automatically for RTL:

| Physical (avoid) | Logical (use) |
|------------------|---------------|
| `margin-left` / `padding-right` | `margin-inline-start` / `padding-inline-end` |
| `left` / `right` | `inset-inline-start` / `inset-inline-end` |
| `text-align: left` | `text-align: start` |
| `border-left` | `border-inline-start` |
| `width` / `height` | `inline-size` / `block-size` |

Our token CSS already uses `block-size`/`padding-inline` (see `frameworks/adapters/*`). Set direction once: `<html dir="rtl" lang="ar">` — children inherit. In SwiftUI/Compose/Flutter use the native start/end leading/trailing equivalents (`leadingMargin`, `MaterialLocalizations`, `Directionality`).

## RTL mirroring rules

- **Mirror:** layout flow, alignment, icons that imply direction (arrows, back/forward, send, progress, chevrons), sliders, breadcrumbs, carousels.
- **Do NOT mirror:** time-independent media, logos, phone numbers, code, checkmarks, most pictographic icons (clock, search rarely), media playback controls (play stays ▶ in many locales — verify per market).
- Numbers and embedded LTR runs (URLs, emails, code) inside RTL text need bidi isolation: `<bdi>` / `unicode-bidi: isolate` to prevent reordering glitches.

## Text expansion

- Translations run **+30–40% longer** than English (German/Finnish more); CJK can be shorter but taller.
- Never fix widths to English text. Let buttons/labels grow; allow wrapping; avoid truncation on essential labels (or provide full text on hover/focus + `title`).
- Test layouts with a pseudo-locale (e.g. `[!!! Ŝȧṽḗ ƈħȧńɠḗŝ !!!]`) to catch clipping, overlap, and concatenation bugs early.
- Don't build sentences by concatenating fragments — word order differs per language. Use full strings with named placeholders (`{count} items`), and use ICU plural/select for grammatical number/gender.

## Locale-aware formatting

- Format dates, times, numbers, currency, and units with `Intl.*` (or platform equivalents) — never hand-format. Respect locale decimal/thousands separators and first-day-of-week (affects the Calendar in `components/data-display.md`).
- Names, addresses, and phone formats vary — don't assume first/last name or US address shape.

## Fonts & typography

- Choose a font (or stack) with the required script coverage (Arabic, Hebrew, Devanagari, Thai, CJK). Verify line-height accommodates tall scripts (Thai/Arabic diacritics clip at tight leading).
- `font-feature-settings`/optical sizing differ per script; don't letter-space non-Latin text.

## Verification
- Flip `dir="rtl"` — does the whole layout mirror, with directional icons flipped and no hard-coded left/right?
- Run the pseudo-locale — any clipped, overlapped, or concatenated strings?
- Are all user-facing strings externalized (zero hard-coded copy) and formatted via `Intl`?
