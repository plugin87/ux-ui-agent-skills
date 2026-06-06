# Framework Adapter Protocol

The skill supports **any** UI framework — not by shipping one file per framework, but by defining a universal translation contract. An *adapter* is the concrete application of this protocol to one target. Three full reference adapters ship in `frameworks/` (`react-tailwind.md`, `nextjs.md`, `swiftui.md`); concise adapters for other popular targets live in `frameworks/adapters/`. When no adapter exists for a requested target, **generate one on the fly** using the checklist at the bottom.

> This protocol is *how to render*. It is orthogonal to *what to render* (`components/`), *what it looks like* (`tokens/`, `taste/`), and *whether it's usable* (`accessibility/`). Always compose all four.

---

## The Contract — 5 things every adapter resolves

### 1. Token Resolution
Map the 3-tier token system (`tokens/*.json`) to the target's theming primitive. Primitives never appear in components; components consume **semantic** or **component** tokens.

| Target style | Theming primitive | Dark mode |
|--------------|-------------------|-----------|
| CSS / utility / web | CSS custom properties (`--color-action-primary`) on `:root` + `[data-theme]` | swap vars under `[data-theme="dark"]` / `prefers-color-scheme` |
| CSS-in-JS / theme object | a typed `theme` object consumed by the styling lib | conditional theme object |
| Native (SwiftUI) | Asset Catalog color sets + `Color`/`Font` extensions | catalog "Any/Dark" appearances |
| Native (Compose/Flutter) | `MaterialTheme`/`ThemeData` color & type schemes | dark `ColorScheme` |
| Native (RN) | a JS theme object + `useColorScheme()` | scheme-driven object |

Rule: produce the token layer first, then components reference it. Never hardcode raw values in a component.

### 2. Component Contract
Every generated component must expose:
- **Variants** (e.g. primary/secondary/ghost/destructive) — driven by a typed prop.
- **Sizes** (sm/md/lg) with exact dimensions from `tokens/sizing.json`.
- **The 8 states** (default, hover, focus, active, disabled, loading, error, selected) per `CLAUDE.md` — render only those that apply.
- **Accessibility wiring** — role/name/state, keyboard model, focus management (`accessibility/aria-patterns.md`).
- **Composition** — ref forwarding / slots / children as the target idiomatically allows.

### 3. Styling Strategy
Pick the idiomatic mechanism and map our tokens onto it:
- Utility classes (Tailwind) · scoped styles (Vue/Svelte/Angular) · CSS Modules · CSS-in-JS (emotion/styled, vanilla-extract, Panda) · native style objects/modifiers.

### 4. Theming & Dark Mode
- Light/dark swap happens at the **semantic** layer (primitives are stable).
- Support multi-brand/density via `tokens/theming.json` where the target allows runtime theme switching.

### 5. Motion
- Map `tokens/motion.json` durations/easings to the target's animation API.
- Always gate on reduced-motion (`taste/motion-choreography.md` → "Implementation notes by target").

---

## Output Rules (all adapters inherit these)
1. Use design tokens — never hardcode color/size/space/motion.
2. Include accessibility on every interactive element.
3. Handle all applicable states.
4. Support dark mode via semantic tokens.
5. Mobile-first / breakpoint-aware (`tokens/breakpoints.json`).
6. Copy-paste ready — complete files, no placeholders (`workflows/redesign-audit.md` → Output Completeness).

---

## Checklist — author a new adapter on demand

When asked for a framework with no file:
1. **Identify** the framework's: component unit, styling mechanism, theming primitive, reactivity model, ref/slot idiom, and reduced-motion query.
2. **Token layer** — show how `tokens/*` become the target's theme (table row above).
3. **One worked component** — implement Button end-to-end (variants, sizes, 8 states, a11y, dark mode) as the template the rest follow.
4. **State + a11y mapping** — how focus-visible, disabled, aria/role are expressed.
5. **Motion** — how a transition token + reduced-motion is applied.
6. **Note gotchas** — SSR, hydration, scoped-style leakage, platform splits.

Keep it concise — this protocol carries the shared rules; the adapter only records what's *different* about the target.
