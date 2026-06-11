# Vision Accessibility — Low Vision, Color Blindness, High Contrast

Beyond the baseline contrast ratios (CLAUDE.md Color Guidelines), this covers users with low vision, color vision deficiency (CVD), light sensitivity, and OS-level high-contrast/forced-colors modes.

---

## Color vision deficiency (CVD)

~8% of men, ~0.5% of women. Red–green (deutan/protan) is most common; blue–yellow (tritan) rarer; full achromatopsia rarest.

- **Never encode meaning in hue alone** (WCAG 1.4.1) — pair every color signal with icon, text, shape, or pattern. Red/green status, chart series, required-field marks, map regions: all need a second channel.
- Don't rely on red-vs-green to distinguish success/error — add (pass) /(x) icons and labels.
- Charts: distinguish series by **marker shape + dash pattern + direct labels**, and use the CVD-safe palette in `tokens/data-viz.json` (Okabe–Ito-derived). Cap categorical series.
- Test with a simulator (deuteranopia, protanopia, tritanopia, grayscale) — if information disappears in grayscale, it failed.

## Low vision

- Support **200% zoom with no loss of content/function** (WCAG 1.4.4) and **400% reflow** to a single column at 320px width (1.4.10) — this is why we use logical properties + relative units, not fixed px layouts.
- Respect the user's **base font size** — size type in `rem`, never lock `html { font-size }` to px. Honor browser/OS text scaling (SwiftUI Dynamic Type via `@ScaledMetric`; Android `sp`).
- **Text spacing override (1.4.12):** content must survive user-applied line-height 1.5, paragraph 2×, letter 0.12em, word 0.16em — don't clip with fixed heights.
- Keep a visible, high-contrast focus indicator (≥ 3:1, `shadow.focus-ring`) and don't let sticky headers obscure it (WCAG 2.4.11).
- Maintain a clear visual hierarchy and generous spacing so magnifier users keep context.

## Light sensitivity & dark mode

- Offer both light and dark themes (semantic tokens auto-swap — CLAUDE.md Dark Mode). Honor `prefers-color-scheme`.
- Avoid pure-black-on-pure-white for large text blocks if it causes halation; our `surface.page`/`text.primary` are tuned for comfort.
- No flashing > 3×/sec (WCAG 2.3.1) — seizure safety.

## High-contrast / forced-colors mode

Windows High Contrast / `forced-colors: active` overrides author colors with a system palette.

- Use `@media (forced-colors: active)` to adapt; rely on **system color keywords** (`CanvasText`, `Canvas`, `ButtonText`, `LinkText`, `Highlight`) rather than hard-coded hex.
- Don't convey state with background-color alone — it gets flattened. Add borders/outlines/icons that survive.
- Set `forced-color-adjust: auto` (default) for most UI; use `none` only for things that must keep brand color (e.g. a chart swatch) — and verify a non-color cue remains.
- Test: icons drawn with CSS background-images can vanish — use real `<svg>` with `currentColor` so they pick up the forced color.

## Verification
- Grayscale the screen — is any status/required/series still distinguishable?
- Zoom to 400% — does content reflow to one column with nothing lost or overlapping?
- Toggle Windows High Contrast / emulate `forced-colors` — do borders, focus, and icons survive?
- Apply the 1.4.12 text-spacing bookmarklet — any clipping?
