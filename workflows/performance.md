# Performance & Web Vitals

Performance is an accessibility and UX concern — a slow, janky, or layout-shifting UI fails users on low-end devices and slow networks first. Design and build to the budget; measure against Core Web Vitals.

---

## Core Web Vitals targets

| Metric | Good | What it measures | Design/build levers |
|--------|------|------------------|---------------------|
| **LCP** (Largest Contentful Paint) | ≤ 2.5s | Loading — largest element painted | Prioritize hero text/image, `next/image` or responsive `srcset`, preload critical font, server-render above-fold |
| **INP** (Interaction to Next Paint) | ≤ 200ms | Responsiveness — input → paint | Keep main thread free, debounce, defer non-critical JS, avoid heavy synchronous handlers |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | Visual stability | Reserve space (skeletons sized to content, width/height on media, `aspect-ratio` tokens), no inserting content above existing |

## Loading strategy

- **Render above-fold first.** Server Components / SSR for the initial view; push `"use client"` to leaf interactive components (CLAUDE.md Next.js rules).
- **Code-split** by route and by heavy widget (chart, date picker, command palette). Lazy-load below-fold and behind-interaction components — Astro islands (`frameworks/adapters/astro.md`) and Qwik resumability (`frameworks/adapters/qwik.md`) make this the default.
- **Fonts:** **NEVER `@import` web fonts in CSS** — it's render-blocking (a chained request the browser finds late). Use `<link rel="preconnect">` + `<link rel="preload">` in `<head>`, or a framework loader (`next/font`); self-host when possible. Always `font-display: swap`, preload the one critical weight, subset to used glyphs, prefer variable fonts. Respect `prefers-reduced-data` (`accessibility/cognitive.md`) — skip heavy webfonts.
- **Images:** modern formats (AVIF/WebP), responsive sizes, lazy-load below-fold, explicit dimensions to prevent CLS.

## Avoiding layout shift

- Size skeletons (`components/feedback.md`) to the **final** content dimensions.
- Use `aspect-ratio` (`tokens/sizing.json`) for media containers so space is reserved before load.
- Never inject banners/ads/toasts that push content down — overlay or reserve space.

## Animation performance

- Animate **only `transform` and `opacity`** (GPU-composited) — never `width`/`height`/`top`/`left`/`box-shadow` in loops (triggers layout/paint). See `taste/motion-choreography.md`.
- `will-change` sparingly and only during the animation; remove after.
- Keep UI transitions 100–300ms (CLAUDE.md Motion); honor `prefers-reduced-motion`.

## Runtime cost of the design system

- **Token CSS variables are nearly free** — a static stylesheet, no JS to resume (a reason we default to CSS-var tokens across adapters).
- Prefer CSS over JS for state styling (`:hover`/`:focus-visible`/`[data-state]`) to keep INP low.
- Tree-shake component libraries; import per-component, not the whole barrel. Watch CSS-in-JS runtime cost (`frameworks/adapters/css-in-js.md`) — prefer zero-runtime/compiled where INP matters.

## Verification
- Lighthouse / field data (CrUX) meets LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 on a mid-tier mobile profile.
- Throttle to slow 4G + 4× CPU — does the first interaction still feel responsive?
- Do skeletons and media reserve space (zero CLS on load)?
