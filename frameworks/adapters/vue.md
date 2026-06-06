# Adapter: Vue 3

Follows the [Framework Adapter Protocol](../adapter-protocol.md). Vue 3 + `<script setup>` + scoped styles (or Tailwind). TypeScript throughout.

## Token layer
CSS custom properties on `:root` (same as web), consumed in scoped `<style>` or Tailwind. Dark mode via `[data-theme="dark"]`. For runtime brand/density switching, expose tokens through a `provide/inject` theme or a Pinia store.

## Button (worked example)
```vue
<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
}>(), { variant: 'primary', size: 'md' })
</script>

<template>
  <button
    :class="['btn', `btn--${variant}`, `btn--${size}`]"
    :disabled="disabled || loading"
    :aria-busy="loading"
    :data-loading="loading || undefined"
  >
    <span v-if="loading" class="btn__spinner" aria-hidden="true" />
    <slot />
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex; align-items: center; gap: var(--space-2);
  font: var(--text-label); border-radius: var(--radius-button);
  transition: var(--transition-micro); cursor: pointer;
}
.btn--primary { background: var(--color-action-primary); color: var(--color-on-action); }
.btn--primary:hover { background: var(--color-action-primary-hover); }
.btn:focus-visible { outline: none; box-shadow: var(--shadow-focus-ring); }
.btn:disabled { opacity: var(--opacity-disabled); pointer-events: none; }
.btn--sm { block-size: var(--size-control-sm); padding-inline: var(--space-3); }
.btn--md { block-size: var(--size-control-md); padding-inline: var(--space-4); }
.btn--lg { block-size: var(--size-control-lg); padding-inline: var(--space-5); }
@media (prefers-reduced-motion: reduce) { .btn { transition: none; } }
</style>
```

## States & a11y
- `:focus-visible` → `--shadow-focus-ring`. `:disabled`/`aria-busy` for loading.
- Native `<button>` gives role/keyboard for free. For non-button triggers add `role` + `@keydown.enter/.space`.

## Motion
Map `tokens/motion.json` to CSS `transition`; gate on `prefers-reduced-motion`. For component transitions use `<Transition>`/`<TransitionGroup>` with token durations.
