# Adapter: Qwik

Follows the [Framework Adapter Protocol](../adapter-protocol.md). Qwik resumability + `component$` + lazy `$` event handlers; styling via scoped `useStylesScoped$` or CSS Modules.

## Token layer
CSS custom properties on `:root` (global, imported once). Dark mode via `[data-theme="dark"]`; runtime theme/density through a `useContext` signal that sets `data-*` on `<html>`. Tokens are static CSS, so they survive resumption with zero JS.

## Button (worked example)
```tsx
import { component$, Slot, type QwikIntrinsicElements } from '@builder.io/qwik'
import { useStylesScoped$ } from '@builder.io/qwik'

type Props = QwikIntrinsicElements['button'] & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = component$<Props>(({ variant = 'primary', size = 'md', loading, disabled, ...rest }) => {
  useStylesScoped$(STYLES)
  return (
    <button class={`btn ${variant} ${size}`} disabled={disabled || loading} aria-busy={loading} {...rest}>
      {loading && <span class="spinner" aria-hidden="true" />}
      <Slot />
    </button>
  )
})

const STYLES = `
  .btn { display:inline-flex; align-items:center; gap:var(--space-2);
    font:var(--text-label); border-radius:var(--radius-button);
    transition:var(--transition-micro); cursor:pointer; }
  .primary { background:var(--color-action-primary); color:var(--color-on-action); }
  .primary:hover { background:var(--color-action-primary-hover); }
  .btn:focus-visible { outline:none; box-shadow:var(--shadow-focus-ring); }
  .btn:disabled { opacity:var(--opacity-disabled); pointer-events:none; }
  .sm { block-size:var(--size-control-sm); padding-inline:var(--space-3); }
  .md { block-size:var(--size-control-md); padding-inline:var(--space-4); }
  .lg { block-size:var(--size-control-lg); padding-inline:var(--space-5); }
  @media (prefers-reduced-motion: reduce) { .btn { transition:none; } }
`
```

## States & a11y
- Native `<button>` semantics; custom triggers need `role`/`tabindex` + `onKeyDown$`. Focus ring via `:focus-visible` token. Event handlers are lazy (`$`) — fine for a11y as long as `disabled`/`aria-*` are server-rendered.

## Motion
Token-driven CSS transitions (no JS to resume). For orchestrated motion use a Web Animations call inside a `$` handler with token durations; honor `prefers-reduced-motion`.
