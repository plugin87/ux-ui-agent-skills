# Adapter: Chakra UI

Follows the [Framework Adapter Protocol](../adapter-protocol.md). Chakra (v3) is a React library themed via a **system** created from token definitions; style props + recipes consume them. Also an interop target — see `design-systems/crosswalk.md`.

## Token layer
Define our 3-tier tokens as Chakra **tokens** (primitives) + **semantic tokens** (roles that switch on color mode) — a near-1:1 fit with our architecture.

```tsx
import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

const config = defineConfig({
  theme: {
    tokens: {
      colors: { brand: { 500: { value: '#3B82F6' }, 600: { value: '#2563EB' } } },
      radii:  { button: { value: '0.5rem' } },       // {semantic.radius.button}
      spacing:{ 4: { value: '1rem' } },               // 4px base
      fonts:  { body: { value: 'Inter, system-ui, sans-serif' } },
    },
    semanticTokens: {
      colors: {
        'action.primary':       { value: { base: '{colors.brand.600}', _dark: '{colors.brand.500}' } },
        'action.primary-hover': { value: { base: '{colors.brand.700}', _dark: '{colors.brand.600}' } },
        'surface.page':         { value: { base: 'white', _dark: '{colors.gray.900}' } },
      },
    },
  },
})
export const system = createSystem(defaultConfig, config)
```

## Button (worked example)
```tsx
import { Button } from '@chakra-ui/react'

<Button bg="action.primary" _hover={{ bg: 'action.primary-hover' }}
        rounded="button" loading={isSaving} loadingText="Saving…">
  Save changes
</Button>
```

## States & a11y
- Semantic tokens auto-swap for dark mode — wire Chakra's color-mode to our `[data-theme]`.
- Chakra handles hover/active/disabled/loading; keep its focus-ring (`_focusVisible`) and verify 3:1. Build remaining states (error/selected) with semantic tokens.
- Components are built on Ark UI (accessible primitives) — still validate against `accessibility/aria-patterns.md`.

## Motion
Chakra exposes transition tokens + a `Collapse`/animation layer. Map durations/easings to `tokens/motion.json`; honor `prefers-reduced-motion`.
