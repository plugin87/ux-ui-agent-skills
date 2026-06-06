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
