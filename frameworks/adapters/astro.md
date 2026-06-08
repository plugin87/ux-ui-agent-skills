# Adapter: Astro

Follows the [Framework Adapter Protocol](../adapter-protocol.md). Astro components are HTML-first with scoped `<style>` and zero client JS by default; interactivity arrives via islands (React/Vue/Svelte/Solid) hydrated with `client:*` directives.

## Token layer
Global CSS custom properties imported once in the root layout (`<style is:global>` or an imported `tokens.css`). Dark mode via `[data-theme="dark"]`; theme toggle is a tiny inline script (it must run pre-hydration to avoid flash — set `data-theme` on `<html>` in `<head>`).

## Button (worked example — static, zero JS)
```astro
---
interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}
const { variant = 'primary', size = 'md', disabled } = Astro.props
---
<button class={`btn ${variant} ${size}`} disabled={disabled}>
  <slot />
</button>

<style>
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
</style>
```

## Interactive components (islands)
Stateful widgets (Modal, Combobox, Tabs) are framework islands. Author them with the matching adapter (`react-tailwind.md`, `vue.md`, `svelte.md`, `solid.md`) and hydrate selectively: `client:idle` for non-critical, `client:visible` for below-fold, `client:load` for above-fold interactive. They consume the same CSS variable token layer.

## States & a11y
- Static Astro markup is plain accessible HTML — use real `<button>`/`<a>`, label everything. Focus management for overlays lives in the hydrated island, not the `.astro` shell. Avoid hydrating purely-presentational components.

## Motion
CSS transitions need no hydration. Astro's View Transitions (`<ClientRouter />`) for page transitions — wrap in `@media (prefers-reduced-motion: reduce)` and use token durations.
