# Adapter: MUI (Material UI)

Follows the [Framework Adapter Protocol](../adapter-protocol.md). MUI is the React implementation of Material Design, themed through `createTheme` + `ThemeProvider`; styling via the `sx` prop, `styled()`, or theme overrides. For the underlying design language see Material 3 in `design-systems/crosswalk.md`.

## Token layer
Build an MUI `theme` from our tokens. Map: `action.primary` → `palette.primary.main` (+`.dark`/`.light`/`.contrastText`), feedback → `palette.error/warning/success/info`, surfaces → `palette.background.default/paper` + `palette.text.primary/secondary`, type scale → `typography`, 4px base → `spacing`, radius → `shape.borderRadius`, elevation → `shadows[]`. Dark mode via `palette.mode` (or CSS-vars theme + `colorSchemes` in v6) — align with our `[data-theme]`.

```tsx
import { createTheme, ThemeProvider } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary:   { main: '#2563EB', dark: '#1D4ED8', contrastText: '#fff' }, // {semantic.action.*}
    error:     { main: '#DC2626' },
    background: { default: '#fff', paper: '#F8FAFC' },
    text:      { primary: '#0F172A', secondary: '#475569' },
  },
  shape:   { borderRadius: 8 },            // {semantic.radius.button}
  spacing: 4,                               // 4px base unit
  typography: { fontFamily: 'Inter, system-ui, sans-serif' },
})

export const App = () => <ThemeProvider theme={theme}>{/* … */}</ThemeProvider>
```

## Button (worked example)
```tsx
import { Button } from '@mui/material'
import { Save } from '@mui/icons-material'

<Button variant="contained" color="primary" startIcon={<Save />}
        loading={isSaving} loadingPosition="start">
  Save changes
</Button>
```
Map our variants: `primary → variant="contained"`, `secondary → variant="outlined"`, `ghost → variant="text"`, `destructive → color="error"`.

## States & a11y
- MUI covers hover/active/disabled/focus and ripple; keep `:focus-visible` rings and verify 3:1 against our surfaces. Add error/selected states via `sx`/theme overrides where MUI is implicit.
- Components (Dialog, Menu, Autocomplete, Select) ship accessible focus trap + keyboard handling — keep them; still validate against `accessibility/aria-patterns.md`.
- Disable the ripple (`disableRipple`) if it conflicts with reduced-motion expectations; override Material's opinionated elevation/spacing to our tokens.

## Motion
MUI uses `theme.transitions` (`create`, `duration`, `easing`). Map to `tokens/motion.json`; MUI respects `prefers-reduced-motion` for transitions — confirm for custom `keyframes`.
