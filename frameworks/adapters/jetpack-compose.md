# Adapter: Jetpack Compose (Android)

Follows the [Framework Adapter Protocol](../adapter-protocol.md). Tokens become a `MaterialTheme` color/typography scheme plus a `CompositionLocal` for spacing/radius/motion. Kotlin.

## Token layer
Map colors → `ColorScheme` (light + dark), type → `Typography`, and provide a custom `LocalDsTokens` `CompositionLocal` for spacing/radius/size/opacity/motion. Dark mode = `isSystemInDarkTheme()` selecting the dark `ColorScheme`.

```kotlin
data class DsTokens(
  val space4: Dp = 16.dp, val radiusButton: Dp = 8.dp,
  val controlMd: Dp = 40.dp, val opacityDisabled: Float = 0.5f,
)
val LocalDsTokens = staticCompositionLocalOf { DsTokens() }
```

## Button (worked example)
```kotlin
@Composable
fun DsButton(
  text: String,
  onClick: () -> Unit,
  modifier: Modifier = Modifier,
  loading: Boolean = false,
  enabled: Boolean = true,
) {
  val t = LocalDsTokens.current
  Button(
    onClick = onClick,
    enabled = enabled && !loading,
    shape = RoundedCornerShape(t.radiusButton),
    contentPadding = PaddingValues(horizontal = t.space4),
    modifier = modifier
      .heightIn(min = t.controlMd)
      .semantics { role = Role.Button; if (loading) stateDescription = "Loading" },
  ) {
    if (loading) CircularProgressIndicator(strokeWidth = 2.dp, modifier = Modifier.size(16.dp))
    else Text(text)
  }
}
```

## States & a11y
- `enabled = false` disables + dims. `Modifier.semantics { role = Role.Button; contentDescription/stateDescription }`. Focus handled by Compose focus system; min touch target 48dp (Material) — meets `tokens/sizing.json`.

## Motion
`animate*AsState` / `AnimatedVisibility` with token durations + mapped `Easing`. Honor reduced motion via `LocalAccessibilityManager`/system setting → snap to target.
