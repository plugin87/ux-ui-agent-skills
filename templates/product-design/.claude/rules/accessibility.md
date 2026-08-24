# Rule: what must pass before a screen merges

Loaded when you are auditing, or finishing a component or screen.

Accessibility sits second in the decision order, above consistency and above
aesthetics. A brand colour that fails contrast gets adjusted. Taste never wins
over POUR.

## The checks, and the gate that proves each one

| Check | Requirement | Proof |
|---|---|---|
| Contrast | 4.5:1 text, 3:1 UI and graphics, in light and dark | `verify_states.mjs` (also covers hover and focus) |
| Keyboard | Tab reaches it, Enter or Space operates it, composite widgets answer arrow keys | `verify_keyboard.mjs` |
| Focus visible | ring at 3:1, never obscured by a sticky header (2.4.11) | `verify_states.mjs` plus a look |
| Target size | 24x24 minimum, 44x44 for primary actions (2.5.8) | `verify_target_size.mjs` |
| Reduced motion | motion stops under `prefers-reduced-motion`, and no content disappears with it | `verify_reduced_motion.mjs` |
| Roles and names | correct role, accessible name, state announced | `axe_audit.mjs` |
| Focus trap | modals keep Tab inside, Escape closes, focus returns to the trigger | `verify_focustrap.mjs` |
| Responsive | no horizontal overflow at 280 / 320 / 414 | `verify_responsive.mjs` |
| Overflow | no silently clipped text, no overlapping controls | `verify_overflow.mjs` |
| RTL | logical properties, mirrors without breaking | `verify_rtl.mjs` |

Everything above runs in one command:

```
/gate
```

It is all or nothing. Report the real `N/N` line, never a number you did not
just measure.

## Things a gate cannot catch, so you check them by hand

- Colour is never the only signal. Add an icon, a label, or a pattern.
- Error text says what happened, why, and how to fix it.
- Heading levels do not skip, and there is exactly one h1.
- The reduced-motion path still shows every piece of content.
- A screen reader pass on anything custom: a listbox, a tree, a date picker.
- Click every control and confirm the state actually changed. A checkbox that
  passes axe and does not toggle is still broken.
