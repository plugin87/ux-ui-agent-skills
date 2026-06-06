# Adapter: CSS-in-JS (styled-components / emotion / vanilla-extract / Panda)

Follows the [Framework Adapter Protocol](../adapter-protocol.md). For React (or any JS) apps that style via JS. Tokens become a typed `theme` object **and/or** CSS variables.

## Token layer — two strategies
1. **Runtime theme object** (styled-components / emotion): export a typed `theme`, pass via `<ThemeProvider>`, read `props.theme`. Dark mode = swap the theme object. Best for runtime brand/density switching.
2. **Zero-runtime + CSS vars** (vanilla-extract / Panda): generate CSS custom properties at build time via `createGlobalTheme` / Panda tokens; components reference `vars.color.actionPrimary`. Dark mode via a theme contract / `[data-theme]`. Best for performance.

> Prefer mapping to **CSS variables** under the hood even in runtime libs — it keeps dark mode and theming swap cheap and avoids re-render churn.

## Button (emotion example)
```tsx
import styled from '@emotion/styled'

export const Button = styled.button<{ variant?: 'primary'|'secondary'; size?: 'sm'|'md'|'lg' }>`
  display:inline-flex; align-items:center; gap: ${p => p.theme.space[2]};
  font: ${p => p.theme.text.label}; border:0; border-radius: ${p => p.theme.radius.button};
  cursor:pointer; transition: ${p => p.theme.transition.micro};
  background: ${p => p.theme.color.actionPrimary}; color: ${p => p.theme.color.onAction};
  block-size: ${p => p.theme.size.control[p.size ?? 'md']};
  padding-inline: ${p => p.theme.space[4]};
  &:hover { background: ${p => p.theme.color.actionPrimaryHover}; }
  &:focus-visible { outline:none; box-shadow: ${p => p.theme.shadow.focusRing}; }
  &:disabled { opacity: ${p => p.theme.opacity.disabled}; pointer-events:none; }
  @media (prefers-reduced-motion: reduce) { transition:none; }
`
```
For variants/states at scale, pair with `cva` or the lib's recipe API (Panda `cva`, vanilla-extract `recipes`).

## States & a11y
- Native element semantics; `:focus-visible` → focus-ring token; `aria-busy`/`disabled` for state. Type the theme so token typos are compile errors.

## Motion
Token durations/easings in `transition`; lib keyframes for enter/exit. Guard with reduced-motion media query.
