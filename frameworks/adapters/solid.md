# Adapter: SolidJS

Follows the [Framework Adapter Protocol](../adapter-protocol.md). Fine-grained reactivity, `props` (no destructure — keep reactive), JSX. Tailwind or CSS Modules.

## Token layer
CSS custom properties on `:root`; consumed via Tailwind utilities or CSS Modules. Dark mode via `[data-theme="dark"]`. Runtime theme/density via a `createSignal`/context provider.

## Button (worked example)
```tsx
import { JSX, splitProps, Show } from 'solid-js'

type Props = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function Button(props: Props) {
  const [local, rest] = splitProps(props, ['variant', 'size', 'loading', 'children', 'class'])
  return (
    <button
      class={`btn btn--${local.variant ?? 'primary'} btn--${local.size ?? 'md'} ${local.class ?? ''}`}
      disabled={props.disabled || local.loading}
      aria-busy={local.loading}
      {...rest}
    >
      <Show when={local.loading}><span class="btn__spinner" aria-hidden="true" /></Show>
      {local.children}
    </button>
  )
}
```
Styles identical to the Vue/Svelte token-driven CSS (`--color-action-primary`, `--shadow-focus-ring`, `--size-control-*`, `--opacity-disabled`), with a `prefers-reduced-motion` guard.

## States & a11y
- `:focus-visible` → focus ring. Native `<button>` semantics; spread `rest` to preserve `aria-*`, `type`, handlers.

## Motion
Token CSS `transition`; Solid Transition Group for enter/exit with token durations. Honor reduced motion.
