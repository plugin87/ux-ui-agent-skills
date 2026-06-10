// Modal.tsx - golden reference for the ONE shared overlay primitive.
// Build this once; reuse for every dialog. Never hand-roll a div-as-modal per screen.
// Covers WCAG 2.4.3 (focus order) + 2.1.2 (no keyboard trap-out): focus trap, Escape,
// aria-modal, labelledby, return-focus on close, backdrop. Token-driven (no hardcoded values).
import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  titleId: string;
  children: ReactNode;
};

export function Modal({ open, onClose, titleId, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    returnTo.current = document.activeElement as HTMLElement;
    const node = ref.current!;
    const sel =
      'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';
    const focusables = () => Array.from(node.querySelectorAll<HTMLElement>(sel));
    focusables()[0]?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") return onClose();
      if (e.key !== "Tab") return;
      const f = focusables();
      if (f.length === 0) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      returnTo.current?.focus(); // return focus on close
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="ds-modal-backdrop" onClick={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="ds-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

/*
.ds-modal-backdrop {
  position: fixed; inset: 0; display: grid; place-items: center;
  background: var(--color-scrim); z-index: var(--z-modal);
}
.ds-modal {
  background: var(--color-surface-card); color: var(--color-text-primary);
  border-radius: var(--radius-lg); padding: var(--space-6);
  max-inline-size: var(--bp-sm); box-shadow: var(--shadow-overlay);
}
@media (prefers-reduced-motion: no-preference) {
  .ds-modal { animation: ds-pop var(--transition-micro); }
}
*/
