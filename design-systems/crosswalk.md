# Design-System Crosswalks (curated)

Concrete role mappings for the most-requested systems, applying the [Interop Protocol](./interop-protocol.md). Map by **role/intent**. For systems not listed, derive a mapping with the protocol's Crosswalk Method.

---

## Color-role crosswalk (the universal spine)

| Our semantic role | Material 3 | Apple HIG | Fluent 2 | Carbon | shadcn/ui | Radix Colors |
|-------------------|-----------|-----------|----------|--------|-----------|--------------|
| `action.primary` | `primary` | `tintColor` / accent | `brand` / `accent` | `interactive` / `$button-primary` | `--primary` | step `9` (solid) |
| `action.primary-hover` | `primary` + state layer | accent (pressed) | `brand hover` | `$button-primary-hover` | `--primary` (hover) | step `10` |
| `on-action` (text on primary) | `onPrimary` | label-on-accent | `text-on-accent` | `$text-on-color` | `--primary-foreground` | contrast step `12`/`1` |
| `surface.page` | `surface` / `background` | systemBackground | `neutralBackground1` | `$background` | `--background` | step `1`/`2` |
| `surface.card` | `surfaceContainer` | secondarySystemBackground | `neutralBackground2` | `$layer` | `--card` | step `2`/`3` |
| `border.default` | `outlineVariant` | separator | `neutralStroke2` | `$border-subtle` | `--border` | step `6` |
| `border.strong` | `outline` | opaqueSeparator | `neutralStroke1` | `$border-strong` | `--input` | step `7`/`8` |
| `text.primary` | `onSurface` | label | `neutralForeground1` | `$text-primary` | `--foreground` | step `12` |
| `text.secondary` | `onSurfaceVariant` | secondaryLabel | `neutralForeground2` | `$text-secondary` | `--muted-foreground` | step `11` |
| `feedback.error` | `error` | systemRed | `dangerForeground` | `$support-error` | `--destructive` | `red` step `9` |
| `feedback.success` | `tertiary`/custom | systemGreen | `successForeground` | `$support-success` | custom | `green` step `9` |
| `focus-ring` | `primary` outline | focusRing/keyboard | `strokeFocus` | `$focus` | `--ring` | step `8` (focus) |

> Material 3 conveys hover/press via **state layers** (opacity overlays), not separate hex — map our `-hover`/`-active` tokens to the equivalent state-layer opacity (`tokens/opacity.json`). Radius/elevation differ per system — see below.

---

## Other axes

| Axis | Material 3 | Apple HIG | Fluent 2 | Carbon | shadcn/ui |
|------|-----------|-----------|----------|--------|-----------|
| **Base grid** | 4dp | 8pt (4pt half-steps) | 4px | 8px (2x grid) | 4px (Tailwind) |
| **Type ramp** | Display/Headline/Title/Body/Label | Large Title→Caption (SF) | Display→Caption | Productive/Expressive | Tailwind text-* |
| **Radius** | xs–xl (`shape`) | continuous-corner, ~`8–14pt` | `borderRadius` 2–8px | `0–8px` (sharp-leaning) | `--radius` (0.5rem default) |
| **Elevation** | dp tonal + shadow (0–5) | thin shadows / materials | depth 4/8/16/64 | `01–05` boxshadow | `shadow-sm…lg` |

---

## Per-system notes

### Material Design 3 (Google)
Tokens are role-based and dynamic-color-driven. Map our semantics → MD3 roles above; for **dynamic color**, treat MD3's generated tonal palette as primitives and our semantics as the role layer. Use `tokens/opacity.json` for state layers. Built-in motion → our `tokens/motion.json`.

### Apple HIG (iOS/macOS)
No hex token file — uses semantic system colors that adapt to light/dark/accessibility automatically. Map our semantics → system colors; let the OS handle dark mode. See `frameworks/swiftui.md` for the asset-catalog mechanism. Respect Dynamic Type (our type scale → `@ScaledMetric`).

### Fluent 2 (Microsoft)
Neutral-heavy with `brand` ramp + depth tokens. Map via the table; Fluent's `neutralBackground1..6` ladder → our `surface.*` elevation. Strong high-contrast-mode story — verify against our `accessibility` rules.

### Carbon (IBM)
Sharp, grid-strict, enterprise. 2x grid (8px), restrained radius. Map `$layer`/`$field`/`$border-*` tokens; Carbon's token names are role-based already — near-1:1 with our semantics.

### shadcn/ui
Copy-in components using CSS variables (`--primary`, `--background`, …) — the **closest match to our model**. Re-point shadcn's `:root` variables to our token values and components inherit instantly. Built on Radix primitives (behavior + a11y). Best low-friction target for web.

### Radix (Primitives + Colors)
Primitives = unstyled behavior/a11y; Colors = 12-step scales. Map roles to steps (table). Style entirely from our tokens. Ideal headless foundation.

### Quick adds
- **Ant Design / Chakra / Mantine:** theme via their config (`theme.token` / `extendTheme` / `MantineProvider`). Override base unit, radius, primary; keep our 8-state + a11y. Watch opinionated defaults.
- **Bootstrap:** override Sass `$variables` / CSS vars (`--bs-primary`, etc.); map base spacing + radius; supplement focus-visible and state coverage.
