# Adapter: React Native

Follows the [Framework Adapter Protocol](../adapter-protocol.md). No CSS/DOM — tokens become a typed JS theme object; styles via `StyleSheet`. Accessibility via RN a11y props.

## Token layer
Export tokens as a typed TS object (mirror `tokens/*.json` values). Resolve dark mode with `useColorScheme()` selecting a light/dark token map. Density via swapping the active map. No CSS variables — components import the resolved theme (context provider recommended).

```ts
export const theme = {
  color: { actionPrimary: '#2563EB', onAction: '#fff', /* … from tokens/colors.json */ },
  space: { 2: 8, 3: 12, 4: 16, 5: 20 },        // tokens/spacing.json (px)
  radius: { button: 8 }, size: { control: { sm: 32, md: 40, lg: 48 } },
  opacity: { disabled: 0.5 }, motion: { fast: 100, base: 200 },
}
```

## Button (worked example)
```tsx
import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native'

export function Button({ variant='primary', size='md', loading, disabled, children, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={({ pressed }) => [
        s.btn, s[size], s[variant],
        pressed && s.pressed,
        (disabled || loading) && { opacity: theme.opacity.disabled },
      ]}
    >
      {loading && <ActivityIndicator />}
      <Text style={s.label}>{children}</Text>
    </Pressable>
  )
}
const s = StyleSheet.create({
  btn: { flexDirection:'row', alignItems:'center', gap: theme.space[2], borderRadius: theme.radius.button, paddingHorizontal: theme.space[4] },
  primary: { backgroundColor: theme.color.actionPrimary },
  label: { color: theme.color.onAction },
  pressed: { opacity: 0.9 },
  sm: { height: theme.size.control.sm }, md: { height: theme.size.control.md }, lg: { height: theme.size.control.lg },
})
```

## States & a11y
- `accessibilityRole`, `accessibilityState` (disabled/busy/selected), `accessibilityLabel`. Focus ring N/A on touch; provide clear pressed state. Minimum target 44×44 (`tokens/sizing.json`).
- Hover only on RN-Web/tvOS — never depend on it.

## Motion
`Animated`/Reanimated with token durations. Honor `AccessibilityInfo.isReduceMotionEnabled()` — fall back to opacity/instant.
