# Adapter: Svelte 5

Follows the [Framework Adapter Protocol](../adapter-protocol.md). Svelte 5 runes (`$props`, `$state`) + scoped styles.

## Token layer
CSS custom properties on `:root`; consumed in component `<style>` (scoped, no leakage). Dark mode via `[data-theme="dark"]`. Runtime theme/density via a `$state` store or context.

## Button (worked example)
```svelte
<script lang="ts">
  let { variant = 'primary', size = 'md', loading = false, disabled = false, children } = $props<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
    size?: 'sm' | 'md' | 'lg'
    loading?: boolean; disabled?: boolean; children: any
  }>()
</script>

<button class="btn {variant} {size}" disabled={disabled || loading} aria-busy={loading}>
  {#if loading}<span class="spinner" aria-hidden="true"></span>{/if}
  {@render children()}
</button>

<style>
  .btn {
    display: inline-flex; align-items: center; gap: var(--space-2);
    font: var(--text-label); border-radius: var(--radius-button);
    transition: var(--transition-micro); cursor: pointer;
  }
  .primary { background: var(--color-action-primary); color: var(--color-on-action); }
  .primary:hover { background: var(--color-action-primary-hover); }
  .btn:focus-visible { outline: none; box-shadow: var(--shadow-focus-ring); }
  .btn:disabled { opacity: var(--opacity-disabled); pointer-events: none; }
  .sm { block-size: var(--size-control-sm); padding-inline: var(--space-3); }
  .md { block-size: var(--size-control-md); padding-inline: var(--space-4); }
  .lg { block-size: var(--size-control-lg); padding-inline: var(--space-5); }
  @media (prefers-reduced-motion: reduce) { .btn { transition: none; } }
</style>
```

## States & a11y
- `:focus-visible` → focus ring token. Native `<button>` semantics; for custom triggers use `role`, `tabindex`, `on:keydown`.

## Motion
Token-driven CSS `transition`; Svelte `transition:`/`animate:` directives with token durations. Honor `prefers-reduced-motion` (check via `matchMedia` in a rune or CSS media query).
