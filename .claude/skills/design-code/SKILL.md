---
name: design-code
description: Generate production-ready, accessible, token-driven component code for ANY framework — React+Tailwind, Next.js, SwiftUI, Vue, Svelte, Angular, Solid, Web Components/Lit, React Native, Flutter, Jetpack Compose, vanilla CSS, or CSS-in-JS. Use when the user wants working UI code for a component or screen in a specific stack.
---

# Skill: Design Code

Render components into a target framework via the adapter system.

## Steps
1. Identify the **target framework** + styling method from the request (or ask).
2. Read `frameworks/adapter-protocol.md` (the universal contract: token resolution, component contract, styling, dark mode, motion + output rules).
3. Load the concrete adapter:
   - Full references: `frameworks/react-tailwind.md`, `frameworks/nextjs.md`, `frameworks/swiftui.md`.
   - Concise adapters: `frameworks/adapters/{vue,svelte,angular,solid,web-components-lit,react-native,flutter,jetpack-compose,vanilla-css,css-in-js}.md`.
   - **No file for the target?** Generate an adapter on the fly using the protocol's "author a new adapter" checklist.
4. Pull the component spec from `components/*` and the ARIA pattern from `accessibility/aria-patterns.md`.
5. Resolve all values to tokens (`tokens/*.json`); apply aesthetic direction if requested (`apply-aesthetic` skill).

## Output rules (mandatory)
Use tokens (never hardcode) · include a11y on every interactive element · handle all applicable of the 8 states · support dark mode at the semantic layer · mobile-first · honor reduced motion · **deliver complete files, no placeholders** (`workflows/redesign-audit.md` → Output Completeness).

## Verification (mandatory before declaring done)
Code is the highest-stakes output — self-check every time:
1. **No hardcoded values** — every color/size/radius/shadow/duration/**font** traces to a token (CSS var / theme key / asset). Run `scripts/lint_hardcodes.py` over the output; zero raw hex/px/ms AND zero raw Tailwind palette utilities (`bg-gray-500`, `text-blue-600`) — use semantic utilities/tokens (`bg-surface`, `text-primary`). Run `scripts/validate_theme_refs.py` so every `var(--…)` resolves to a defined theme token (no floating tokens). One allowed exception: 3rd-party theme-config (MUI/Mantine) mapping our tokens INTO their API.
2. **All applicable states present** — Default, Hover, Focus(-visible ring), Active, Disabled, Loading(+`aria-busy`), Error, Selected — or justified N/A.
3. **Accessibility wired** — correct role/ARIA per `accessibility/aria-patterns.md`, keyboard model, focus management, ≥24px target; verify contrast (`scripts/contrast.py`) for any new color pair.
4. **Dark mode + reduced motion + responsive** — semantic tokens swap; motion has a `prefers-reduced-motion` fallback; layout is mobile-first.
5. **Completeness** — full files, no `// ...`; if asked for N, deliver N. If any check fails, fix before returning (run `a11y-audit` if unsure).
6. **Single-theme consistency** — consume the project's ONE shared token theme (the root CSS-var layer); never define a per-page palette or new colors. Across multiple pages/screens, the same semantic tokens must drive every surface so the whole product stays visually identical and themeable from one place (CLAUDE.md → Single-Theme Consistency).
7. **One shared primitive layer** — build ONE reusable component per atom (`Button`, `Input`, `Modal`, `Badge` via `cva`/equivalent); never repeat utility-class clusters inline across files or hand-roll a div-as-modal per screen. Overlays reuse the single `Modal` primitive: focus trap, `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, Escape, **return focus on close**, backdrop (WCAG 2.4.3 + 2.1.2). See `examples/golden/Button.tsx` + `examples/golden/Modal.tsx`.
8. **Font loading** — NEVER `@import` web fonts in CSS (render-blocking). Use a framework loader (`next/font`) or `<link rel="preconnect">` + `<link rel="preload">` with `font-display: swap`; self-host when possible. Font family comes from a token (`--font-sans`), never a literal.
9. **Semantic token BY INTENT + consistency** — the token's *meaning* must match the action: destructive (Delete/Remove) → `action.destructive` (danger), **never** `action.primary`; secondary = neutral outline/transparent with dark text (**never a colored fill** → no dark-text-on-blue). The SAME action uses the SAME variant **everywhere** (a trigger button and its confirm button must match — not red in one place and blue in another). Gates don't catch this — you must.
10. **No emoji as icons** — use a real icon set (default **lucide**) as inline SVG with `currentColor`; never an emoji, including in JS that swaps a label (swap the `<svg>`, not a text/emoji string). Mentally run `scripts/lint_taste.py` (it flags emoji-as-icon).
11. **Destructive confirmation UX** — irreversible actions (delete account/data, anything stated "cannot be undone") need real friction per WCAG 3.3.4 / 3.3.6: a confirmation dialog whose **confirm button restates the action** ("Delete account", not "Delete"/"OK"/"Yes") and, for high-stakes, a **type-to-confirm** step. See `examples/sample-app/preview.html` and `content/voice-tone.md`.
12. **Taste pre-flight** — run the 12-point aesthetic check in `taste/design-taste.md` and, for any rendered HTML, `node scripts/taste_audit.mjs <file>` (render-based: flags timid type-scale contrast, uniform repetition, over-wide measure, palette sprawl). Taste is heuristic — treat findings as a strong signal and pair with a real screenshot review; it is NOT auto-provable like correctness.
13. **Run the gates, then report (mandatory).** Before declaring done, RUN `node scripts/verify_states.mjs <file>` + `--dark` (every element, default/hover/focus) and `node scripts/accuracy_report.mjs`; report their actual output. Never type a contrast number or "100%" you didn't just measure (CLAUDE.md → Verification Protocol).
