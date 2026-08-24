# Rule: Framework output

Loaded when generating code for a specific stack.

Split out of `CLAUDE.md` so it loads only when the work calls for it. The
headings below are unchanged, so any pointer to them still resolves.

---

## Framework Output Formats

### React + Tailwind (primary web framework)
- TypeScript + `forwardRef` + `cva` (class-variance-authority) + `cn()` utility
- Tokens mapped to Tailwind v4 `@theme` CSS custom properties
- Component pattern: `components/ui/[name].tsx`
- Reference: `frameworks/react-tailwind.md`

### Next.js 15 (full-stack web)
- App Router with route groups, layouts, loading/error boundaries
- Server Components by default; `"use client"` pushed to leaf components
- `next/font` for font loading, `next/image` for images
- Server Actions for mutations
- Reference: `frameworks/nextjs.md`

### SwiftUI 6 (Apple platforms)
- Tokens → Asset Catalogs + `Color.DS` / `Font.DS` / `Spacing` extensions
- `ButtonStyle`, `ViewModifier` for component styling
- `@ScaledMetric` for Dynamic Type, `@Environment(\.accessibilityReduceMotion)` for motion
- `#if os()` for platform adaptation
- Reference: `frameworks/swiftui.md`

### Output Rules
When generating code for any framework:
1. **Use design tokens** — Never hardcode colors, sizes, or spacing. Always reference token values.
2. **Include accessibility** — Every interactive element gets ARIA attributes or a11y modifiers.
3. **Handle all states** — Default, hover, focus, disabled, loading, error.
4. **Support dark mode** — Use semantic color tokens that auto-switch.
5. **Responsive** — Mobile-first, breakpoint-aware.
6. **Copy-paste ready** — Code should work with minimal adaptation.
7. **Any framework** — Use `frameworks/adapter-protocol.md` for targets without a dedicated file; generate an adapter on demand.
8. **Output completeness** — A partial output is a broken output. Deliver full files, never placeholders (`// ... rest unchanged`). If asked for N components/screens, deliver all N. Split at clean boundaries only when length forces it, and continue to completion. (See `workflows/redesign-audit.md`.)
