# Adapter: Bootstrap 5

Follows the [Framework Adapter Protocol](../adapter-protocol.md). Bootstrap ships opinionated components + a utility layer; theme it by overriding **Sass variables** (build-time) or **CSS variables** (`--bs-*`, runtime). This is also a partial interop target — see `design-systems/crosswalk.md`.

## Token layer
Two paths:
- **Sass (preferred)** — set `$primary`, `$border-radius`, `$font-family-base`, `$spacer`, `$body-bg`, etc. from our token values *before* `@import "bootstrap"`. Bootstrap regenerates its `--bs-*` vars + utilities from these.
- **CSS-var override (runtime)** — re-point `--bs-primary`, `--bs-body-bg`, `--bs-border-radius`, `--bs-body-color` to our values; good for theming a prebuilt bundle. Dark mode via `data-bs-theme="dark"` (Bootstrap 5.3 native) — align it with our `[data-theme="dark"]`.

```scss
// _theme.scss — map our tokens → Bootstrap Sass vars, then import
$primary:        #2563EB;  // {semantic.action.primary}
$danger:         #DC2626;  // {semantic.feedback.error}
$border-radius:  0.5rem;   // {semantic.radius.button}
$spacer:         1rem;     // 4px base * 4
$font-family-base: 'Inter', system-ui, sans-serif;
@import "bootstrap/scss/bootstrap";
```

## Button (worked example)
```html
<!-- Bootstrap classes; appearance driven by the overridden vars above -->
<button type="button" class="btn btn-primary">Save changes</button>
<button type="button" class="btn btn-primary" disabled aria-busy="true">
  <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
  Saving…
</button>
```

## States & a11y
- Bootstrap covers hover/active/`:focus-visible` and disabled, but **focus-ring contrast and 8-state completeness are on you** — verify the focus ring meets 3:1 against our surfaces and add error/loading/selected states where Bootstrap is silent.
- Use ARIA per `accessibility/aria-patterns.md`; Bootstrap's JS plugins (Modal, Dropdown, Offcanvas) handle focus trap + Escape — keep them, don't reinvent.
- Watch opinionated defaults (heavy shadows, 0.375rem radius, its own gray ramp) — override to our tokens rather than accepting them.

## Motion
Bootstrap transitions are CSS-var/Sass driven (`$transition-base`). Map to `tokens/motion.json`; it respects `prefers-reduced-motion` in 5.x — confirm for custom additions.
