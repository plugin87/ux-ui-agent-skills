---
description: Run every objective gate this project can prove and report the real N/N. Use before claiming any screen or component is done.
---

Run the checks below in order, against this project. Report the real output of
each one, then a single `N/N` line. It is all or nothing: if a check fails, fix
it and re-run rather than reporting a partial pass.

`<harness>` means the component's `*.states.html` file, or the directory
`src/components/` to sweep all of them.

## Theme (the source of truth)

```
python3 scripts/validate_tokens.py   design-tokens.json
python3 scripts/validate_contrast.py design-tokens.json
node    scripts/build_tokens.mjs --in design-tokens.json --out src/theme.css
python3 scripts/validate_theme_refs.py src/theme.css src
python3 scripts/lint_hardcodes.py src
python3 scripts/check_no_emoji.py src public
```

## Rendered UI (every component harness)

```
node scripts/verify_states.mjs        src/components/<harness>
node scripts/verify_states.mjs --dark src/components/<harness>
node scripts/axe_audit.mjs            src/components/<harness>
node scripts/verify_responsive.mjs    src/components
node scripts/verify_responsive.mjs    src/components --scale=1.25
node scripts/verify_target_size.mjs   src/components
node scripts/verify_keyboard.mjs      src/components
node scripts/verify_reduced_motion.mjs src/components
node scripts/verify_overflow.mjs      src/components
node scripts/lint_intent.mjs          src/components
```

Modals and drawers add:

```
node scripts/verify_focustrap.mjs src/components/<harness> --open="#openBtn"
```

## Then look

The gates prove contrast, roles, sizes, and overflow. They do not prove the UI
works. Screenshot the harness in light and dark, click every control, and confirm
the state actually changed. A checkbox that passes axe and does not toggle is
still broken.

## Scope, stated honestly

This proves objective correctness: token consistency, WCAG 2.2 AA on a real
render in both themes, keyboard operability, target size, reduced motion,
responsive behaviour, no hardcoded values, no emoji. It does not prove taste.
Never report a number a gate did not just produce.

Note: `node scripts/accuracy_report.mjs` is the design kit's own aggregate gate
and expects the kit's example harnesses. In this project, the list above is the
gate.
