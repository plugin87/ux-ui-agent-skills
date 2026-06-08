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
Tokens are role-based and dynamic-color-driven. Map our semantics → MD3 roles above; for **dynamic color**, treat MD3's generated tonal palette as primitives and our semantics as the role layer. Use `tokens/opacity.json` for state layers. Built-in motion → our `tokens/motion.json`. For the **React implementation (MUI)**, theme via `createTheme` — see `frameworks/adapters/mui.md`.

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

### Chakra / Mantine
Theme via their config (`createSystem` / `createTheme`). Both mirror our 3-tier model closely (Chakra has primitive **tokens** + **semanticTokens**; Mantine has primitive scales + `primaryColor`). Override base unit, radius, primary; keep our 8-state + a11y. See `frameworks/adapters/chakra.md` and `frameworks/adapters/mantine.md`.

---

## Extended crosswalks (Ant · Polaris · Primer · Atlassian · Bootstrap)

### Color-role crosswalk — extended

| Our semantic role | Ant Design 5 | Shopify Polaris | GitHub Primer | Atlassian (ADS) | Bootstrap 5 |
|-------------------|--------------|-----------------|---------------|-----------------|-------------|
| `action.primary` | `colorPrimary` | `--p-color-bg-fill-brand` | `--button-primary-bgColor-rest` / `accent.fg` | `color.background.brand.bold` | `--bs-primary` |
| `action.primary-hover` | `colorPrimaryHover` | `…bg-fill-brand-hover` | `…bgColor-hover` | `…brand.bold.hovered` | `--bs-primary` + `:hover` (shade) |
| `on-action` | `colorTextLightSolid` | `--p-color-text-brand-on-bg-fill` | `--button-primary-fgColor-rest` | `color.text.inverse` | `--bs-btn-color` (`#fff`) |
| `surface.page` | `colorBgLayout` | `--p-color-bg` | `--bgColor-default` / `canvas.default` | `color.background.surface` | `--bs-body-bg` |
| `surface.card` | `colorBgContainer` | `--p-color-bg-surface` | `--bgColor-muted` / `canvas.subtle` | `color.background.surface.raised` | `--bs-card-bg` |
| `border.default` | `colorBorderSecondary` | `--p-color-border` | `--borderColor-muted` | `color.border` | `--bs-border-color` |
| `border.strong` | `colorBorder` | `--p-color-border-strong` | `--borderColor-default` | `color.border.bold` | `--bs-border-color` (darker) |
| `text.primary` | `colorText` | `--p-color-text` | `--fgColor-default` / `fg.default` | `color.text` | `--bs-body-color` |
| `text.secondary` | `colorTextSecondary` | `--p-color-text-secondary` | `--fgColor-muted` | `color.text.subtle` | `--bs-secondary-color` |
| `feedback.error` | `colorError` | `--p-color-text-critical` | `--fgColor-danger` / `danger.fg` | `color.text.danger` | `--bs-danger` |
| `feedback.success` | `colorSuccess` | `--p-color-text-success` | `--fgColor-success` / `success.fg` | `color.text.success` | `--bs-success` |
| `focus-ring` | `colorPrimaryBorder` (+ outline) | `--p-color-border-focus` | `--focus-outlineColor` / `accent.emphasis` | `color.border.focused` | `--bs-focus-ring-color` |

> Bootstrap also exposes `--bs-border-radius`, `--bs-body-font-family`, `$spacer`. Primer ships **both** functional vars (`--fgColor-*`, `--bgColor-*`) and the older `@primer/primitives` scale names (`fg.default`, `accent.emphasis`) — prefer the functional vars.

### Per-system notes

- **Ant Design 5 (`theme.token` + algorithm):** token-based theming via `ConfigProvider theme={{ token, algorithm }}`. Set `colorPrimary`, `borderRadius`, `fontFamily`, `controlHeight` from our tokens; `algorithm: theme.darkAlgorithm` for dark mode (align with `[data-theme]`). Component-level overrides under `theme.components`. Very opinionated motion/shadows — map to our `tokens/motion.json` + `tokens/shadows.json`.
- **Shopify Polaris (CSS custom properties):** consumes a fixed set of `--p-color-*` / `--p-space-*` / `--p-border-radius-*` design tokens. You theme by re-pointing those vars to our values within an `AppProvider`. Polaris is purpose-built for admin/commerce density — respect its spacing rhythm. Strong a11y baseline; still validate against our checklist.
- **GitHub Primer (`@primer/primitives`):** ships CSS variables + a React lib. Map roles to the **functional** layer (`--fgColor-*`, `--bgColor-*`, `--borderColor-*`); `data-color-mode="dark"` + `data-dark-theme` drive theming — align with our `[data-theme]`. Primer's scale is GitHub-flavored; expect to override accent + radius.
- **Atlassian Design System (`@atlaskit/tokens`):** role/intent token names (`color.background.brand.bold`, `color.text.subtle`) — near-1:1 with our semantics. Themed via the token package + `setGlobalTheme({ colorMode })`. Migration is mostly a name remap; keep the 8-state coverage where ADS components are sparse.
- **Bootstrap 5:** override Sass `$variables` (build-time) or `--bs-*` CSS vars (runtime); `data-bs-theme="dark"` for dark mode. Map base spacing (`$spacer`), `$border-radius`, `$primary`/`$danger`/etc., and `$font-family-base`. **Supplement focus-visible contrast and the error/loading/selected states** Bootstrap leaves thin. Full worked example: `frameworks/adapters/bootstrap.md`.
