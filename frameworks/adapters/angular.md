# Adapter: Angular

Follows the [Framework Adapter Protocol](../adapter-protocol.md). Standalone components, signals, `ChangeDetectionStrategy.OnPush`, component-scoped styles.

## Token layer
CSS custom properties on `:root` (global stylesheet); consumed in component `styles`. Dark mode via `[data-theme="dark"]`. Runtime theme/density via an injectable `ThemeService` toggling the attribute + a signal.

## Button (worked example)
```ts
import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'ds-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button [class]="'btn btn--' + variant() + ' btn--' + size()"
            [disabled]="disabled() || loading()" [attr.aria-busy]="loading()">
      @if (loading()) { <span class="btn__spinner" aria-hidden="true"></span> }
      <ng-content />
    </button>`,
  styles: [`
    .btn { display:inline-flex; align-items:center; gap:var(--space-2);
      font:var(--text-label); border-radius:var(--radius-button);
      transition:var(--transition-micro); cursor:pointer; }
    .btn--primary { background:var(--color-action-primary); color:var(--color-on-action); }
    .btn--primary:hover { background:var(--color-action-primary-hover); }
    .btn:focus-visible { outline:none; box-shadow:var(--shadow-focus-ring); }
    .btn:disabled { opacity:var(--opacity-disabled); pointer-events:none; }
    .btn--sm{block-size:var(--size-control-sm);padding-inline:var(--space-3);}
    .btn--md{block-size:var(--size-control-md);padding-inline:var(--space-4);}
    .btn--lg{block-size:var(--size-control-lg);padding-inline:var(--space-5);}
    @media (prefers-reduced-motion: reduce){ .btn{transition:none;} }
  `],
})
export class ButtonComponent {
  variant = input<'primary'|'secondary'|'ghost'|'destructive'>('primary');
  size = input<'sm'|'md'|'lg'>('md');
  loading = input(false);
  disabled = input(false);
}
```

## States & a11y
- `:focus-visible` → focus-ring token. Use Angular CDK (`a11y`, `OverlayModule`, `FocusTrap`) for menus/dialogs/focus management.

## Motion
Token-driven CSS `transition`, or Angular Animations (`@angular/animations`) with token durations. Disable via `prefers-reduced-motion`.
