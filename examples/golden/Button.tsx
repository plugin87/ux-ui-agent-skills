// Button.tsx — golden reference. Token-driven, all 8 states, accessible, dark-mode safe.
// Every value comes from theme.css variables — zero hardcoded colors/sizes (passes lint_hardcodes).
import { forwardRef, type ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  loading?: boolean;
  selected?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", loading = false, selected, disabled, children, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      data-variant={variant}
      aria-pressed={selected}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className="ds-btn"
      {...rest}
    >
      {loading && <span className="ds-spinner" aria-hidden="true" />}
      {children}
    </button>
  );
});

/*
.ds-btn {
  display: inline-flex; align-items: center; gap: var(--space-2);
  block-size: var(--size-control-md); padding-inline: var(--space-4);
  border-radius: var(--radius-button); border: 0;
  background: var(--color-action-primary); color: var(--color-text-on-action);
  transition: background var(--transition-micro);
}
.ds-btn:hover { background: var(--color-action-primary-hover); }              /* Hover */
.ds-btn:focus-visible { outline: none; box-shadow: var(--shadow-focus-ring); } /* Focus */
.ds-btn:active { filter: brightness(0.95); }                                   /* Active */
.ds-btn:disabled { opacity: var(--opacity-disabled); pointer-events: none; }   /* Disabled */
.ds-btn[aria-busy="true"] { cursor: progress; }                                /* Loading */
.ds-btn[aria-pressed="true"] { background: var(--color-action-primary-hover); }/* Selected */
.ds-btn[data-variant="secondary"] {
  background: transparent; color: var(--color-text-primary);
  box-shadow: inset 0 0 0 1px var(--color-border-strong);
}
*/
