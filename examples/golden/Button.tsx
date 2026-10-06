// Button.tsx - golden reference. Token-driven, all 8 states, accessible, dark-mode safe.
// Styles live in ./components.css - every value a token from ./theme.css, zero hardcoded
// colours or sizes. They used to live in a trailing block comment in this file, which is
// how this file came to contain a nested /* ... */ and stop compiling: nothing ever built
// it. Rendered and gated by scripts/render_framework_source.mjs.
import { forwardRef, type ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "destructive";
  loading?: boolean;
  selected?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", loading = false, selected, disabled, className, children, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      // rest goes FIRST so the props below cannot be silently overwritten by a
      // caller. It used to go last, and <Button className="btn--secondary"> then
      // replaced "ds-btn" outright - the Cancel button in Settings.tsx rendered
      // with no button styling at all. A caller's className is merged, never swapped.
      {...rest}
      data-variant={variant}
      aria-pressed={selected}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={className ? `ds-btn ${className}` : "ds-btn"}
    >
      {loading && <span className="ds-spinner" aria-hidden="true" />}
      {children}
    </button>
  );
});
