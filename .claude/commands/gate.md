---
description: Run the one-command quality gate and report the real N/N result. Use before claiming any build/review is done.
---

Run the full quality gate and report the ACTUAL output — never a remembered or
reasoned number.

1. Run: `node scripts/accuracy_report.mjs`
   (tokens + contrast + spec + no-hardcode + theme-refs + no-emoji +
   real-render WCAG + state-aware, light and dark — all-or-nothing).
2. Report the exact `N/N` line it prints.
3. If it is not fully green:
   - List each failing check verbatim.
   - Fix the cause (do not suppress the check).
   - Re-run until green. Do not announce success between failures.
4. For any rendered HTML touched this session, also run the pixel-truth checks
   the gate cannot prove:
   - `node scripts/verify_states.mjs <file> [--dark]`
   - `node scripts/verify_responsive.mjs <file>`
   - RENDER-AND-LOOK: screenshot the harness, park the pointer off it, inspect
     every state, click each control to confirm the state changed.

Honest scope: these gates prove objective correctness (tokens, a11y, no drift).
They do not prove taste. Pair with `node scripts/taste_audit.mjs` + human review;
never claim auto-100% on aesthetics.
