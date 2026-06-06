# Adapter: Web Components (Lit)

Follows the [Framework Adapter Protocol](../adapter-protocol.md). Framework-agnostic custom elements via Lit. Works inside any framework or none.

## Token layer
Define CSS custom properties on `:root` in light DOM (global). They **pierce shadow DOM**, so components inside the shadow root can read `var(--color-action-primary)` directly — this is the key to theming web components. Dark mode via `[data-theme="dark"]` on the host page. Expose per-component overrides as documented custom properties.

## Button (worked example)
```ts
import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('ds-button')
export class DsButton extends LitElement {
  @property() variant: 'primary'|'secondary'|'ghost'|'destructive' = 'primary'
  @property() size: 'sm'|'md'|'lg' = 'md'
  @property({ type: Boolean }) loading = false
  @property({ type: Boolean }) disabled = false

  static styles = css`
    button { display:inline-flex; align-items:center; gap:var(--space-2);
      font:var(--text-label); border-radius:var(--radius-button);
      transition:var(--transition-micro); cursor:pointer; border:0; }
    .primary { background:var(--color-action-primary); color:var(--color-on-action); }
    .primary:hover { background:var(--color-action-primary-hover); }
    button:focus-visible { outline:none; box-shadow:var(--shadow-focus-ring); }
    button:disabled { opacity:var(--opacity-disabled); pointer-events:none; }
    .sm{block-size:var(--size-control-sm);padding-inline:var(--space-3);}
    .md{block-size:var(--size-control-md);padding-inline:var(--space-4);}
    .lg{block-size:var(--size-control-lg);padding-inline:var(--space-5);}
    @media (prefers-reduced-motion: reduce){ button{transition:none;} }
  `
  render() {
    return html`<button class="${this.variant} ${this.size}"
      ?disabled=${this.disabled || this.loading} aria-busy=${this.loading}>
      ${this.loading ? html`<span aria-hidden="true"></span>` : ''}<slot></slot>
    </button>`
  }
}
```

## States & a11y
- Focus ring via `:focus-visible` inside shadow root. For composite widgets, manage `delegatesFocus: true` or forward ARIA; remember the accessibility tree crosses shadow boundaries — label with `aria-label`/`aria-labelledby` carefully.

## Motion
Token CSS `transition`/Web Animations API; honor `prefers-reduced-motion`. See `frameworks/adapters/css-in-js.md` is not needed — styles are encapsulated CSS.
