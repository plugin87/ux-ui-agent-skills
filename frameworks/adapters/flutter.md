# Adapter: Flutter

Follows the [Framework Adapter Protocol](../adapter-protocol.md). Tokens become a `ThemeData`/`ThemeExtension`; widgets read from `Theme.of(context)`. Dart, null-safe.

## Token layer
Encode tokens as a `ThemeExtension` so they're typed and theme-switchable. Map colors → `ColorScheme`, type → `TextTheme`, plus a custom extension for spacing/radius/motion. Dark mode = a second `ThemeData` with a dark `ColorScheme`; Flutter switches via `MaterialApp.themeMode`.

```dart
@immutable
class DsTokens extends ThemeExtension<DsTokens> {
  final Color actionPrimary, onAction;
  final double space4, radiusButton, controlMd, opacityDisabled;
  const DsTokens({required this.actionPrimary, required this.onAction,
    required this.space4, required this.radiusButton, required this.controlMd, required this.opacityDisabled});
  // copyWith + lerp omitted for brevity (implement both)
  @override DsTokens copyWith() => this;
  @override DsTokens lerp(ThemeExtension<DsTokens>? o, double t) => this;
}
```

## Button (worked example)
```dart
class DsButton extends StatelessWidget {
  final String label; final VoidCallback? onPressed; final bool loading;
  const DsButton({super.key, required this.label, this.onPressed, this.loading = false});

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context).extension<DsTokens>()!;
    return Semantics(
      button: true, enabled: onPressed != null && !loading,
      child: FilledButton(
        onPressed: loading ? null : onPressed,
        style: FilledButton.styleFrom(
          backgroundColor: t.actionPrimary, foregroundColor: t.onAction,
          minimumSize: Size(0, t.controlMd),
          padding: EdgeInsets.symmetric(horizontal: t.space4),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(t.radiusButton)),
        ),
        child: loading
          ? SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
          : Text(label),
      ),
    );
  }
}
```

## States & a11y
- Disabled = `onPressed: null` (Flutter dims + blocks). `Semantics(button:true, enabled, label)` for screen readers. Focus ring via `FocusableActionDetector`/default Material focus. Min tap target 48×48 (Material) — meets `tokens/sizing.json`.

## Motion
`AnimatedContainer`/implicit animations or `AnimationController` with token `Duration`s and `Curves` (map easings). Honor `MediaQuery.of(context).disableAnimations` → instant/opacity.
