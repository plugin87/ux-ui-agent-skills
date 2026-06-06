# Adapter: Vanilla CSS + HTML

Follows the [Framework Adapter Protocol](../adapter-protocol.md). No framework, no build step. Semantic HTML + CSS custom properties. The baseline every web adapter builds on.

## Token layer
Emit all tokens as CSS custom properties on `:root` (this *is* the token output target). Dark mode via `[data-theme="dark"]` overrides and/or `@media (prefers-color-scheme: dark)`. Brand/density via additional `[data-theme="…"]` / `[data-density="compact"]` blocks.

```css
:root {
  --color-action-primary: #2563EB;
  --color-action-primary-hover: #1D4ED8;
  --color-on-action: #ffffff;
  --space-2: .5rem; --space-4: 1rem;
  --radius-button: .5rem;
  --size-control-md: 2.5rem;
  --opacity-disabled: .5;
  --transition-micro: 100ms cubic-bezier(0,0,.2,1);
  --shadow-focus-ring: 0 0 0 2px #fff, 0 0 0 4px #3b82f6;
}
[data-theme="dark"] { --color-on-action:#0a0a0f; /* re-point semantics */ }
```

## Button (worked example)
```html
<button class="btn btn--primary btn--md">Save changes</button>
```
```css
.btn { display:inline-flex; align-items:center; gap:var(--space-2);
  border:0; border-radius:var(--radius-button); cursor:pointer;
  font:var(--text-label); transition:var(--transition-micro); }
.btn--primary { background:var(--color-action-primary); color:var(--color-on-action); }
.btn--primary:hover { background:var(--color-action-primary-hover); }
.btn:focus-visible { outline:none; box-shadow:var(--shadow-focus-ring); }
.btn:disabled { opacity:var(--opacity-disabled); pointer-events:none; }
.btn--md { block-size:var(--size-control-md); padding-inline:var(--space-4); }
@media (prefers-reduced-motion: reduce) { .btn { transition:none; } }
```

## States & a11y
- Use real `<button>`/`<a>`/`<input>`. `:focus-visible` for the ring. `aria-busy`, `disabled`, `aria-pressed` for state. Logical properties (`block-size`, `padding-inline`) for RTL-readiness.

## Motion
CSS `transition`/`@keyframes` with token durations/easings; always wrap movement in a `prefers-reduced-motion: reduce` guard.
