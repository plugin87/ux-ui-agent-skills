# Rule: Token architecture and colour

Loaded when generating, extending, auditing, or theming tokens, or when choosing a colour.

Split out of `CLAUDE.md` so it loads only when the work calls for it. The
headings below are unchanged, so any pointer to them still resolves.

---

## Token System

### Architecture: 3-Tier Token Hierarchy

```
┌─────────────────────────────────────────────┐
│ COMPONENT TOKENS (use in code)              │
│ button-bg-primary → {semantic.action.primary}│
├─────────────────────────────────────────────┤
│ SEMANTIC TOKENS (use in design)             │
│ action.primary → {primitive.blue.600}       │
├─────────────────────────────────────────────┤
│ PRIMITIVE TOKENS (never reference directly) │
│ blue.600 → #2563EB                          │
└─────────────────────────────────────────────┘
```

- **Primitives** — Raw values. The palette. Never used directly in components.
- **Semantic** — Purpose-based aliases. Used in designs and general styling.
- **Component** — Scoped to specific components. Used in component implementations.

All tokens use **DTCG format** (Design Tokens Community Group) with `$type`/`$value` properties. See:
- `tokens/colors.json` — 3-tier color system with 6 hues × 11 shades + semantic + component + dark mode
- `tokens/typography.json` — Major Third (1.25) modular scale + composite text styles
- `tokens/spacing.json` — 4px base unit scale + semantic spacing aliases
- `tokens/shadows.json` — 5-level elevation + inner + colored + focus ring
- `tokens/borders.json` — Radius scale + semantic radii + width scale
- `tokens/breakpoints.json` — Mobile-first breakpoints + container widths + grid + z-index
- `tokens/motion.json` — Duration scale + easing curves + transition presets + keyframes + reduced-motion strategy
- `tokens/gradients.json` — Semantic gradient presets (brand, surface, feedback, accent)
- `tokens/opacity.json` — Alpha scale (disabled, hover/pressed/selected overlays, scrim)
- `tokens/blur.json` — Backdrop / frosted-glass blur scale
- `tokens/sizing.json` — Control size scale + icon sizes + aspect ratios
- `tokens/states.json` — Semantic interaction-state tokens for the 8 component states
- `tokens/theming.json` — Multi-brand theme override map + density modes (compact/default/spacious)
- `tokens/data-viz.json` — Color-blind-aware chart palette (categorical/sequential/diverging) + axis/grid/tooltip tokens

### Naming Convention
```
{category}.{property}.{variant}-{state}
```
Examples: `semantic.text.primary`, `component.button.primary-bg-hover`, `semantic.feedback.error-text`

### Dark Mode Strategy
- Primitives stay the same — dark mode swaps at the **semantic** level
- Light mode: light surfaces + dark text. Dark mode: dark surfaces + light text.
- Override map defined in `tokens/colors.json` → `dark` section
- Implementation: CSS custom properties swapped via `[data-theme="dark"]` or `prefers-color-scheme`
- Test both modes for every component state

---

## Color Guidelines

### Contrast Requirements (WCAG 2.2)
| Element | Minimum Ratio | Example |
|---------|--------------|---------|
| Normal text (< 24px) | 4.5:1 | `text.primary` on `surface.page` = 15.4:1 (pass) |
| Large text (≥ 24px or ≥ 18.66px bold) | 3:1 | `text.secondary` on `surface.page` = 5.7:1 (pass) |
| UI components & graphical objects | 3:1 | `border.strong` on `surface.page` = 4.8:1 (pass) (use for essential control borders). `border.default` = 1.2:1 is decorative-only (dividers/card edges) |
| Focus indicators | 3:1 | Focus ring uses `shadow.focus-ring` double ring |

### Color Usage Rules
1. **Never use color as the only indicator** — always pair with icon, text, or pattern
2. **Feedback colors** — success (green), warning (amber), error (red), info (blue)
3. **Interactive colors** — all clickable elements use `action.primary` or `text.link`
4. **Limit palette** — 1 primary, 1 destructive, neutrals. Use accent colors sparingly.
5. **Colored shadows** — only on hover states for emphasis (see `tokens/shadows.json` → `colored`)
6. **Token BY INTENT (non-negotiable)** — pick the token whose *meaning* matches the action, not just any token that resolves:
   - **Destructive** actions (Delete, Remove, Revoke) → `action.destructive` / `component.button.destructive-bg` — **NEVER** `action.primary`. The same destructive action uses the **same** danger variant **everywhere** (trigger button AND its confirm-modal button — never red in one place and blue in another).
   - **Primary** = the one main affirmative action; **secondary** = neutral (transparent/outline, dark text — **never a colored fill**, so no dark-text-on-blue); **danger** = destructive.
   - Consistency rule: one action role → one variant across all pages. A blue "Delete" is a bug.
7. **No emoji, anywhere — not just as icons** (see the ABSOLUTE banner under Verification Protocol). Emoji are inconsistent across platforms and read as machine-generated slop. Never use one as an icon, bullet, status dot, rating face, section marker, or decoration — in UI, code, JSON, copy, comments, or commit messages. Use a real icon set (default: **lucide**) as inline SVG with `currentColor` via the Icon component (`components/icon-system.md`), or plain words. This includes JS that swaps button labels — swap the `<svg>`/icon, never inject an emoji string. Enforced by `scripts/check_no_emoji.py` (scans UI + taste + the agent instruction files).

### Color Generation (when creating new palettes)
Use **OKLCH color space** for perceptually uniform shade scales:
1. Define the brand hue (e.g., hue = 264 for purple)
2. Generate 11 shades from L=97% (50) to L=15% (950) with consistent chroma
3. Verify 500 shade meets 4.5:1 contrast on white for text use
4. Verify 600 shade meets 3:1 contrast on white for UI use

### Single-Theme Consistency (cross-page — non-negotiable)
Every page, screen, and component in a project MUST render from **one shared token theme** — never a per-page palette or ad-hoc colors. This is what keeps a 50-screen product visually identical and themeable from one place.

1. **One source of truth** — the project's `tokens/*.json` → a single CSS-variable layer (`:root` + `[data-theme="dark"]`) imported **once** at the app root. Every page references the same semantic tokens; none redefines colors.
2. **No off-theme values** — zero hardcoded hex/px/timing in component/page code. Enforced by `scripts/lint_hardcodes.py` (the one allowed exception: adapter theme-config that maps our tokens *into* a 3rd-party API, e.g. MUI/Mantine).
3. **Real WCAG, on the source** — the token theme itself passes WCAG 2.2 in **both** light and dark before any page ships. Enforced by `scripts/validate_contrast.py` (required text/action pairs fail the build; tertiary/decorative are advisory).
4. **One CI enforces all of it** — `.github/workflows/ci.yml` runs `validate_tokens` + `validate_contrast` + `validate_component_spec` + `npm test` on every push/PR. A page that introduces drift, a contrast regression, or an off-theme color cannot merge.

> Switching brand/theme = editing the token source once → every page updates. If a page "looks different," it's a bug: it bypassed the theme.
