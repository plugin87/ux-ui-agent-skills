# Icon System

Icons are a token-governed subsystem, not loose SVGs. Consistency in grid, stroke, and metaphor is what makes an icon set feel like one system. Sizing comes from `tokens/sizing.json` (`icon.*`); color from `currentColor` so icons inherit text/state tokens.

---

## Foundations

- **Grid:** design on a single pixel grid (commonly 24×24) with a consistent live area + padding. Every icon shares the grid so optical weight matches.
- **Stroke:** one stroke width across the set (e.g. 1.5–2px at 24px). Keep stroke constant across sizes — scale the canvas, not the stroke, or the set looks inconsistent (CLAUDE.md: "keep stroke weight consistent across sizes").
- **Style:** pick one — outline OR solid OR duotone — as the primary; use the alternate only for a deliberate signal (e.g. solid = selected/active). Don't mix styles arbitrarily.
- **Optical alignment:** align to optical center, not geometric; balance visual mass.

## Sizing & color (tokens)

| Token | Size | Use |
|-------|------|-----|
| `sizing.icon.xs` | 12px | Dense inline / badge |
| `sizing.icon.sm` | 16px | Default inline icon (with body text) |
| `sizing.icon.md` | 20px | Buttons, inputs |
| `sizing.icon.lg` | 24px | Standalone / nav |
| `sizing.icon.xl` | 32px | Feature / empty-state accent |

- Color via `currentColor` — the icon inherits `text.*` / state tokens automatically (incl. forced-colors mode, `accessibility/vision.md`). Never hard-code icon hex.
- Pair icon size with text size for optical balance; keep stroke legible at the smallest used size.

## Delivery

| Method | When |
|--------|------|
| **Inline `<svg>`** | Default — stylable (`currentColor`), no extra request, supports `aria-*`. Best for forced-colors and theming. |
| **SVG sprite** (`<use href="#id">`) | Large sets, cache one file, reference by id. |
| **Icon font** | Legacy only — avoid (a11y + rendering issues; can't do duotone/forced-colors well). |
| Component wrapper | An `<Icon name size>` component enforces size tokens + a11y props across frameworks (`frameworks/adapter-protocol.md`). |

## Accessibility

- **Decorative icon** (next to a text label): `aria-hidden="true"` and no `title` — the label carries meaning. Most UI icons are decorative.
- **Meaningful icon** (icon-only button/status): give an accessible name — `aria-label` on the button, or `role="img"` + `aria-label`/`<title>` on the SVG. Icon-only controls still need a ≥ 24×24px (44px recommended) hit target (CLAUDE.md).
- **Never icon-alone for status** — pair with text/color-plus-shape (`accessibility/vision.md`); an icon's meaning isn't universal.
- Use `currentColor` so icons meet contrast with their text context and adapt to high-contrast mode.

## States

Icons participate in component states via inherited color: default (`text.secondary`), hover/active (inherit control state), selected (`action.primary` or solid variant), disabled (`opacity.disabled`), loading (animated spinner icon + `aria-busy`).

## Verification
- Single grid + single stroke weight across the whole set?
- All icons use `currentColor` and `sizing.icon.*` (zero hard-coded hex/px)?
- Every icon-only control has an accessible name and a ≥ 24px target?
- No status conveyed by icon (or color) alone?
