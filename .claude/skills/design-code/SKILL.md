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
1. **No hardcoded values** — every color/size/radius/shadow/duration traces to a token (CSS var / theme key / asset). Mentally run `scripts/lint_hardcodes.py` over the output; zero raw hex/px/ms outside the token layer (third-party theme-config adapters like MUI/Mantine that map our tokens INTO their API are the one allowed exception).
2. **All applicable states present** — Default, Hover, Focus(-visible ring), Active, Disabled, Loading(+`aria-busy`), Error, Selected — or justified N/A.
3. **Accessibility wired** — correct role/ARIA per `accessibility/aria-patterns.md`, keyboard model, focus management, ≥24px target; verify contrast (`scripts/contrast.py`) for any new color pair.
4. **Dark mode + reduced motion + responsive** — semantic tokens swap; motion has a `prefers-reduced-motion` fallback; layout is mobile-first.
5. **Completeness** — full files, no `// ...`; if asked for N, deliver N. If any check fails, fix before returning (run `a11y-audit` if unsure).
6. **Single-theme consistency** — consume the project's ONE shared token theme (the root CSS-var layer); never define a per-page palette or new colors. Across multiple pages/screens, the same semantic tokens must drive every surface so the whole product stays visually identical and themeable from one place (CLAUDE.md → Single-Theme Consistency).
