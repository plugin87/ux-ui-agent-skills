# Adapter: Mantine

Follows the [Framework Adapter Protocol](../adapter-protocol.md). Mantine is a React component library themed through a `theme` object + CSS variables it generates (`--mantine-*`). Also an interop target — see `design-systems/crosswalk.md`.

## Token layer
Build a Mantine `theme` from our tokens and pass to `MantineProvider`. Mantine emits CSS variables you can further override. Map: our primitive scales → `theme.colors` (10-shade tuples), `action.primary` → `primaryColor` + `primaryShade`, type scale → `fontSizes`/`headings`, spacing → `spacing`, radius → `radius`, shadows → `shadows`.

```tsx
import { createTheme, MantineProvider } from '@mantine/core'

const theme = createTheme({
  primaryColor: 'brand',
  primaryShade: { light: 6, dark: 5 },
  colors: {
    // 10 shades, light → dark — generated from our primitive blue scale
    brand: ['#EFF6FF','#DBEAFE','#BFDBFE','#93C5FD','#60A5FA','#3B82F6','#2563EB','#1D4ED8','#1E40AF','#1E3A8A'],
  },
  defaultRadius: 'md',        // map to {semantic.radius.button}
  radius: { md: '0.5rem' },
  spacing: { md: '1rem' },    // 4px base
  fontFamily: 'Inter, system-ui, sans-serif',
})

export const App = () => (
  <MantineProvider theme={theme} defaultColorScheme="auto">{/* … */}</MantineProvider>
)
```

## Button (worked example)
```tsx
import { Button } from '@mantine/core'

<Button color="brand" loading={isSaving} loaderProps={{ type: 'oval' }}>
  Save changes
</Button>
```

## States & a11y
- Mantine handles hover/active/disabled/loading and focus rings (its `focusRing` setting — keep `'auto'` so keyboard users get the ring; verify 3:1 against our surfaces).
- Dark mode via `defaultColorScheme="auto"` + `useMantineColorScheme()` — wire to our `[data-theme]` if mixing with non-Mantine surfaces.
- Components (Modal, Combobox, Menu) are built on accessible primitives; still validate against `accessibility/aria-patterns.md`. Override opinionated spacing/radius defaults to our tokens.

## Motion
Mantine uses CSS transitions + the `Transition` component. Supply token durations/easings; respect `prefers-reduced-motion` (`theme.respectReducedMotion: true`).
