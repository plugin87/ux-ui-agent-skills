# Aesthetic Systems — Archetypes + the Design-System Library

Taste is not one look — it is the ability to choose the *right* look for the brief and execute it with conviction. This file gives you two layers:

1. **Archetypes** — a small set of reusable aesthetic directions, each mapped to our token system. Use these to reason about *what kind* of design fits.
2. **The Library** — 138 concrete, named design-system specs in `design-systems/library/`. Use these when the brief points at a specific vibe (or a specific brand reference).

> Taste serves the **Aesthetics** tier of the Decision Framework. An archetype or library system may set the *visual direction* but must still pass every Accessibility, Consistency, and token rule. See [`taste/design-taste.md`](./design-taste.md) for the anti-slop doctrine and [`taste/motion-choreography.md`](./motion-choreography.md) for motion.

---

## How to Use This File

1. **Read the brief.** Infer audience, domain, and emotional tone. Don't apply a direction the brief didn't ask for.
2. **Pick a direction** — either an Archetype (below) or a named system from the Library catalog.
3. **Resolve to tokens.** Translate the chosen direction's color/type/space/radius/shadow/motion into our token files (`tokens/*.json`), overriding semantic tokens where needed (see the contract below).
4. **Render** through the target framework via the [Framework Adapter Protocol](../frameworks/adapter-protocol.md).
5. **Run the pre-flight aesthetic check** in `taste/design-taste.md` before shipping.

---

## The Archetypes

Each archetype is a *recipe*, not a brand. Settings reference our existing tokens.

### 1. High-End Agency (Linear / Apple-tier)
- **When:** premium products, launches, anything that must feel expensive.
- **Type:** large display scale (`6xl`–`7xl`), tight leading, wide measure; one UI sans.
- **Color:** off-black on warm/cool near-white; single restrained accent; calibrated low-chroma.
- **Space:** generous macro-whitespace; asymmetric grids; edge tension.
- **Depth:** hairline borders + subtle layered elevation; shadows rare.
- **Motion:** precise, fast, `ease-out`; scroll-reveals with restraint.
- **Library kin:** `linear-app`, `apple`, `vercel`, `stripe`, `superhuman`, `premium`.

### 2. Editorial Minimalism
- **When:** content, docs, marketing with a literary tone.
- **Type:** serif or refined sans for headings; strict 60–75ch measure; strong scale contrast.
- **Color:** paper/ink neutrals; one ink accent.
- **Space:** column grids, lots of air, baseline rhythm.
- **Depth:** flat; rules and whitespace separate, not boxes.
- **Library kin:** `editorial`, `warm-editorial`, `kami`, `notion`, `modern`, `wired`, `publication`.

### 3. Industrial Brutalism / Tactical
- **When:** data-heavy dashboards, dev tools, declassified-blueprint vibe.
- **Type:** monospace or grotesque; extreme scale contrast; mono kickers/labels.
- **Color:** utilitarian (black/white + one signal color); analog textures optional.
- **Space:** rigid modular grids, high density, visible structure.
- **Depth:** hard edges, thick borders, no soft shadows.
- **Library kin:** `brutalism`, `neobrutalism`, `mono`, `warp`, `voltagent`, `theverge`.

### 4. Warm Soft-SaaS
- **When:** friendly consumer/productivity apps, onboarding-heavy products.
- **Type:** rounded humanist sans; medium scale contrast.
- **Color:** warm neutrals + a friendly accent; soft pastels as support.
- **Space:** comfortable padding, soft radii (`radius.lg`+), bento grids.
- **Depth:** soft shadows allowed, chunky tactile elements optional.
- **Library kin:** `duolingo`, `lingo`, `friendly`, `intercom`, `zapier`, `xiaohongshu`.

### 5. Dark-Tech / Cinematic
- **When:** AI, crypto, gaming, infra — high-drama dark surfaces.
- **Type:** tight sans or mono; bright type on dark.
- **Color:** void-black surfaces, neon/gradient accents, desaturated supporting hues.
- **Space:** full-bleed media, dramatic hero scale.
- **Depth:** glow, gradient, glass — used once each, never stacked.
- **Library kin:** `elevenlabs`, `runwayml`, `cursor`, `revolut`, `spacex`, `cosmic`, `shopify`.

### 6. Morphism & Effects
- **When:** a specific tactile gimmick is the point.
- **Use the matching library spec directly** rather than improvising: `glassmorphism`, `claymorphism`, `neumorphism`, `skeumorphism`, `gradient`, `neon`. These are effect-forward and carry strict execution rules in their `DESIGN.md`.

---

## Library Contract — mapping a `DESIGN.md` to our tokens

Every library spec follows the same shape: **Visual Theme → Color Palette & Roles → Typography → Spacing → Components → Motion**. To apply one:

| `DESIGN.md` section | Maps to |
|---------------------|---------|
| Color Palette & Roles (hex + role) | Override `semantic.*` in `tokens/colors.json` (primitives stay; re-point semantic aliases). Verify every pair against `accessibility/wcag-checklist.md` contrast — **a brand hex that fails contrast must be adjusted**. |
| Typography Rules (family, scale, weight) | Set families/scale in `tokens/typography.json`; keep our composite `textStyle` structure. |
| Spacing / layout | Map to `tokens/spacing.json` scale + `tokens/breakpoints.json` grid. |
| Radius / geometry | `tokens/borders.json`. |
| Elevation / shadow / effects | `tokens/shadows.json`, plus `tokens/blur.json` / `tokens/gradients.json` for morphism systems. |
| Motion | `tokens/motion.json` + `taste/motion-choreography.md`. |
| Components | Render via component specs in `components/` through the framework adapter. |

> **Non-negotiable:** library specs describe brand aesthetics, not accessibility. After applying one, re-run contrast, focus-visible, target-size, and reduced-motion checks. Taste never overrides POUR.

---

## The Library Catalog

There are **138 named design systems** in `design-systems/library/`. Each is a complete `DESIGN.md` spec (visual theme, color roles + hex, typography, spacing, components, motion). Load the one that matches the brief, then translate its values through the [Framework Adapter Protocol](../frameworks/adapter-protocol.md).


### AI & LLM (14)

- [`claude`](../design-systems/library/claude/DESIGN.md) — Anthropic's AI assistant. Warm terracotta accent, clean editorial layout.
- [`cohere`](../design-systems/library/cohere/DESIGN.md) — Enterprise AI platform. Vibrant gradients, data-rich dashboard aesthetic.
- [`elevenlabs`](../design-systems/library/elevenlabs/DESIGN.md) — AI voice platform. Dark cinematic UI, audio-waveform aesthetics.
- [`huggingface`](../design-systems/library/huggingface/DESIGN.md) — ML community hub. Sunny yellow accent, monospace identity, cheerful and dense.
- [`minimax`](../design-systems/library/minimax/DESIGN.md) — AI model provider. Bold dark interface with neon accents.
- [`mistral-ai`](../design-systems/library/mistral-ai/DESIGN.md) — Open-weight LLM provider. French-engineered minimalism, purple-toned.
- [`ollama`](../design-systems/library/ollama/DESIGN.md) — Run LLMs locally. Terminal-first, monochrome simplicity.
- [`openai`](../design-systems/library/openai/DESIGN.md) — Calm, near-monochrome system anchored in deep teal-black with generous white space and editorial typography.
- [`opencode-ai`](../design-systems/library/opencode-ai/DESIGN.md) — AI coding platform. Developer-centric dark theme.
- [`replicate`](../design-systems/library/replicate/DESIGN.md) — Run ML models via API. Clean white canvas, code-forward.
- [`runwayml`](../design-systems/library/runwayml/DESIGN.md) — AI video generation. Cinematic dark UI, media-rich layout.
- [`together-ai`](../design-systems/library/together-ai/DESIGN.md) — Open-source AI infrastructure. Technical, blueprint-style design.
- [`voltagent`](../design-systems/library/voltagent/DESIGN.md) — AI agent framework. Void-black canvas, emerald accent, terminal-native.
- [`x-ai`](../design-systems/library/x-ai/DESIGN.md) — Elon Musk's AI lab. Stark monochrome, futuristic minimalism.

### Automotive (6)

- [`bmw`](../design-systems/library/bmw/DESIGN.md) — Luxury automotive. Dark premium surfaces, precise German engineering aesthetic.
- [`bugatti`](../design-systems/library/bugatti/DESIGN.md) — Hypercar brand. Cinema-black canvas, monochrome austerity, monumental display type.
- [`ferrari`](../design-systems/library/ferrari/DESIGN.md) — Luxury automotive. Chiaroscuro editorial, Ferrari Red accents, cinematic black.
- [`lamborghini`](../design-systems/library/lamborghini/DESIGN.md) — Supercar brand. True black surfaces, gold accents, dramatic uppercase typography.
- [`renault`](../design-systems/library/renault/DESIGN.md) — French automotive. Vibrant aurora gradients, NouvelR typography, bold energy.
- [`tesla`](../design-systems/library/tesla/DESIGN.md) — Electric automotive. Radical subtraction, full-viewport photography, near-zero UI.

### Backend & Data (8)

- [`clickhouse`](../design-systems/library/clickhouse/DESIGN.md) — Fast analytics database. Yellow-accented, technical documentation style.
- [`composio`](../design-systems/library/composio/DESIGN.md) — Tool integration platform. Modern dark with colorful integration icons.
- [`hashicorp`](../design-systems/library/hashicorp/DESIGN.md) — Infrastructure automation. Enterprise-clean, black and white.
- [`mongodb`](../design-systems/library/mongodb/DESIGN.md) — Document database. Green leaf branding, developer documentation focus.
- [`posthog`](../design-systems/library/posthog/DESIGN.md) — Product analytics. Playful hedgehog branding, developer-friendly dark UI.
- [`sanity`](../design-systems/library/sanity/DESIGN.md) — Headless CMS. Red accent, content-first editorial layout.
- [`sentry`](../design-systems/library/sentry/DESIGN.md) — Error monitoring. Dark dashboard, data-dense, pink-purple accent.
- [`supabase`](../design-systems/library/supabase/DESIGN.md) — Open-source Firebase alternative. Dark emerald theme, code-first.

### Bold & Expressive (8)

- [`bold`](../design-systems/library/bold/DESIGN.md) — Strong visual presence with heavyweight typography, high-contrast colors, and commanding layouts.
- [`brutalism`](../design-systems/library/brutalism/DESIGN.md) — Raw, anti-design aesthetic inspired by concrete architecture with unadorned elements, jarring layouts, and functional minimalism.
- [`colorful`](../design-systems/library/colorful/DESIGN.md) — Vibrant, high-contrast palettes and gradients for engaging, memorable, and modern user experiences.
- [`dramatic`](../design-systems/library/dramatic/DESIGN.md) — High-contrast, theatrical design with bold layouts, immersive visuals, and unconventional compositions that command attention.
- [`energetic`](../design-systems/library/energetic/DESIGN.md) — Dynamic, vibrant style with thick borders, geometric shapes, high-contrast colors, and expressive typography conveying motion and vitality.
- [`expressive`](../design-systems/library/expressive/DESIGN.md) — Vibrant, personality-driven design with bold colors, playful graphics, and dynamic layouts that balance creativity with structure.
- [`neobrutalism`](../design-systems/library/neobrutalism/DESIGN.md) — Modern take on brutalism with bold borders, vivid accent colors, and raw, high-contrast layouts on warm surfaces.
- [`vibrant`](../design-systems/library/vibrant/DESIGN.md) — Lively, colorful design with bold playful typography, warm accents, and dynamic visual energy.

### Creative & Artistic (11)

- [`artistic`](../design-systems/library/artistic/DESIGN.md) — High-contrast, expressive style with creative typography and bold color choices for visually striking interfaces.
- [`cafe`](../design-systems/library/cafe/DESIGN.md) — Cozy cafe-inspired interface with warm tones, soft typography, and clean layouts for a relaxed browsing experience.
- [`cosmic`](../design-systems/library/cosmic/DESIGN.md) — Futuristic sci-fi aesthetic with dark themes, vibrant neon accents, and immersive spatial elements.
- [`creative`](../design-systems/library/creative/DESIGN.md) — Playful, character-driven design with expressive typography and bold graphics for landing pages and creative projects.
- [`doodle`](../design-systems/library/doodle/DESIGN.md) — Hand-drawn, sketch-like style with doodles, handwritten fonts, and imperfect lines for a playful, informal feel.
- [`editorial`](../design-systems/library/editorial/DESIGN.md) — Magazine-inspired editorial layout with refined serif typography, structured grids, and elegant reading experiences.
- [`fantasy`](../design-systems/library/fantasy/DESIGN.md) — Game-inspired fantasy aesthetic with bold, premium visuals, rich color palettes, and immersive thematic elements.
- [`friendly`](../design-systems/library/friendly/DESIGN.md) — Approachable, intuitive design with rounded elements, ample whitespace, and soft pastel color palettes.
- [`lingo`](../design-systems/library/lingo/DESIGN.md) — Playful, minimal design with bright colors, rounded shapes, tactile 3D borders, and friendly illustrations for approachable interfaces.
- [`publication`](../design-systems/library/publication/DESIGN.md) — Print-inspired visual language for books, magazines, and reports with editorial grids and expressive typography.
- [`storytelling`](../design-systems/library/storytelling/DESIGN.md) — Narrative-driven design using visuals, copy, and interaction to guide users through engaging, emotionally resonant journeys.

### Design & Creative (7)

- [`airtable`](../design-systems/library/airtable/DESIGN.md) — Spreadsheet-database hybrid. Colorful, friendly, structured data aesthetic.
- [`canva`](../design-systems/library/canva/DESIGN.md) — Visual creation platform. Vivid purple-blue gradient, generous spacing, friendly geometry.
- [`clay`](../design-systems/library/clay/DESIGN.md) — Creative agency. Organic shapes, soft gradients, art-directed layout.
- [`figma`](../design-systems/library/figma/DESIGN.md) — Collaborative design tool. Vibrant multi-color, playful yet professional.
- [`framer`](../design-systems/library/framer/DESIGN.md) — Website builder. Bold black and blue, motion-first, design-forward.
- [`miro`](../design-systems/library/miro/DESIGN.md) — Visual collaboration. Bright yellow accent, infinite canvas aesthetic.
- [`webflow`](../design-systems/library/webflow/DESIGN.md) — Visual web builder. Blue-accented, polished marketing site aesthetic.

### Developer Tools (8)

- [`cursor`](../design-systems/library/cursor/DESIGN.md) — AI-first code editor. Sleek dark interface, gradient accents.
- [`expo`](../design-systems/library/expo/DESIGN.md) — React Native platform. Dark theme, tight letter-spacing, code-centric.
- [`github`](../design-systems/library/github/DESIGN.md) — Code-forward platform. Functional density, blue-on-white precision, Primer foundations.
- [`lovable`](../design-systems/library/lovable/DESIGN.md) — AI full-stack builder. Playful gradients, friendly dev aesthetic.
- [`raycast`](../design-systems/library/raycast/DESIGN.md) — Productivity launcher. Sleek dark chrome, vibrant gradient accents.
- [`superhuman`](../design-systems/library/superhuman/DESIGN.md) — Fast email client. Premium dark UI, keyboard-first, purple glow.
- [`vercel`](../design-systems/library/vercel/DESIGN.md) — Frontend deployment. Black and white precision, Geist font.
- [`warp`](../design-systems/library/warp/DESIGN.md) — Modern terminal. Dark IDE-like interface, block-based command UI.

### E-Commerce & Retail (5)

- [`airbnb`](../design-systems/library/airbnb/DESIGN.md) — Travel marketplace. Warm coral accent, photography-driven, rounded UI.
- [`meta`](../design-systems/library/meta/DESIGN.md) — Tech retail store. Photography-first, binary light/dark surfaces, Meta Blue CTAs.
- [`nike`](../design-systems/library/nike/DESIGN.md) — Athletic retail. Monochrome UI, massive uppercase type, full-bleed photography.
- [`shopify`](../design-systems/library/shopify/DESIGN.md) — E-commerce platform. Dark-first cinematic, neon green accent, ultra-light type.
- [`starbucks`](../design-systems/library/starbucks/DESIGN.md) — Global coffee retail brand. Four-tier green system, warm cream canvas, full-pill buttons.

### Editorial & Print (1)

- [`kami`](../design-systems/library/kami/DESIGN.md) — Editorial paper system: warm parchment canvas, ink-blue accent, serif-led hierarchy. Built for resumes, one-pagers, white papers, portfolios, slide decks — anything that should feel like high-quality print rather than UI. Multilingual by design (EN · zh-CN · ja).

### Editorial · Studio (1)

- [`atelier-zero`](../design-systems/library/atelier-zero/DESIGN.md) — A magazine-grade, collage-driven visual system: warm paper canvas, surreal.

### Fintech & Crypto (7)

- [`binance`](../design-systems/library/binance/DESIGN.md) — Crypto exchange. Bold yellow accent on monochrome, trading-floor urgency.
- [`coinbase`](../design-systems/library/coinbase/DESIGN.md) — Crypto exchange. Clean blue identity, trust-focused, institutional feel.
- [`kraken`](../design-systems/library/kraken/DESIGN.md) — Crypto trading. Purple-accented dark UI, data-dense dashboards.
- [`mastercard`](../design-systems/library/mastercard/DESIGN.md) — Global payments network. Warm cream canvas, orbital pill shapes, editorial warmth.
- [`revolut`](../design-systems/library/revolut/DESIGN.md) — Digital banking. Sleek dark interface, gradient cards, fintech precision.
- [`stripe`](../design-systems/library/stripe/DESIGN.md) — Payment infrastructure. Signature purple gradients, weight-300 elegance.
- [`wise`](../design-systems/library/wise/DESIGN.md) — Money transfer. Bright green accent, friendly and clear.

### Layout & Structure (4)

- [`bento`](../design-systems/library/bento/DESIGN.md) — Modular grid layout with card-like blocks, clear hierarchy, soft spacing, and subtle visual contrast for organized, scannable interfaces.
- [`levels`](../design-systems/library/levels/DESIGN.md) — Conversion-focused design that removes friction and guides users toward action through clarity, trust, and speed.
- [`perspective`](../design-systems/library/perspective/DESIGN.md) — Spatial depth design with isometric views, vanishing points, and layered elements that guide attention through 3D-like realism.
- [`spacious`](../design-systems/library/spacious/DESIGN.md) — Generous whitespace, consistent padding, and grid-based layouts for clean, readable, and breathing interfaces.

### Media & Consumer (12)

- [`apple`](../design-systems/library/apple/DESIGN.md) — Consumer electronics. Premium white space, SF Pro, cinematic imagery.
- [`ibm`](../design-systems/library/ibm/DESIGN.md) — Enterprise technology. Carbon design system, structured blue palette.
- [`nvidia`](../design-systems/library/nvidia/DESIGN.md) — GPU computing. Green-black energy, technical power aesthetic.
- [`pinterest`](../design-systems/library/pinterest/DESIGN.md) — Visual discovery. Red accent, masonry grid, image-first.
- [`playstation`](../design-systems/library/playstation/DESIGN.md) — Gaming console retail. Three-surface channel layout, quiet-authority display type, cyan hover-scale.
- [`spacex`](../design-systems/library/spacex/DESIGN.md) — Space technology. Stark black and white, full-bleed imagery, futuristic.
- [`spotify`](../design-systems/library/spotify/DESIGN.md) — Music streaming. Vibrant green on dark, bold type, album-art-driven.
- [`theverge`](../design-systems/library/theverge/DESIGN.md) — Tech editorial media. Acid-mint and ultraviolet accents, Manuka display, rave-flyer story tiles.
- [`uber`](../design-systems/library/uber/DESIGN.md) — Mobility platform. Bold black and white, tight type, urban energy.
- [`vodafone`](../design-systems/library/vodafone/DESIGN.md) — Global telecom brand. Monumental uppercase display, Vodafone Red chapter bands.
- [`wired`](../design-systems/library/wired/DESIGN.md) — Tech magazine. Paper-white broadsheet density, custom serif display, mono kickers, ink-blue links.
- [`xiaohongshu`](../design-systems/library/xiaohongshu/DESIGN.md) — Lifestyle UGC social platform. Singular brand red, generous radius, content-first.

### Modern & Minimal (10)

- [`clean`](../design-systems/library/clean/DESIGN.md) — Simplicity-focused design with ample whitespace, legible typography, and a limited color palette to reduce visual clutter.
- [`contemporary`](../design-systems/library/contemporary/DESIGN.md) — Current-era minimalist design with bento grids, dark mode support, and high-performance accessible layouts.
- [`flat`](../design-systems/library/flat/DESIGN.md) — Two-dimensional minimalist style with vibrant colors, clean typography, and no 3D effects for fast, user-friendly interfaces.
- [`minimal`](../design-systems/library/minimal/DESIGN.md) — Stripped-back design emphasizing whitespace, clean typography, and restrained color for maximum clarity and focus.
- [`modern`](../design-systems/library/modern/DESIGN.md) — Contemporary editorial style with serif typography, minimal palettes, and clean layouts for polished digital products.
- [`mono`](../design-systems/library/mono/DESIGN.md) — Monospace-driven, matrix-inspired design with high-contrast elements, compact density, and a hacker-chic aesthetic.
- [`refined`](../design-systems/library/refined/DESIGN.md) — Carefully curated, modern minimal style with elegant serif typography and understated, sophisticated palettes.
- [`shadcn`](../design-systems/library/shadcn/DESIGN.md) — Shadcn/ui-inspired design with minimal, clean components, monochrome palette, and utility-first patterns.
- [`simple`](../design-systems/library/simple/DESIGN.md) — Straightforward, no-frills design with clean typography, neutral colors, and intuitive layouts that stay out of the way.
- [`sleek`](../design-systems/library/sleek/DESIGN.md) — Modern minimalist aesthetic with clean lines, intentional color palette, subtle interactions, and consistent spacing.

### Morphism & Effects (6)

- [`claymorphism`](../design-systems/library/claymorphism/DESIGN.md) — Soft, rounded 3D-like shapes mimicking malleable clay with playful, puffy elements and colorful surfaces.
- [`glassmorphism`](../design-systems/library/glassmorphism/DESIGN.md) — Frosted glass effect with translucent layers, subtle blur, and luminous borders for depth and modern elegance.
- [`gradient`](../design-systems/library/gradient/DESIGN.md) — Smooth color transitions and gradient-rich surfaces for modern, playful interfaces with visual depth.
- [`neon`](../design-systems/library/neon/DESIGN.md) — Electric neon glow effects with high-contrast color pairings for bold, attention-grabbing interfaces.
- [`neumorphism`](../design-systems/library/neumorphism/DESIGN.md) — Soft, extruded UI elements with inner and outer shadows on monochromatic surfaces for a tactile, embedded look.
- [`skeumorphism`](../design-systems/library/skeumorphism/DESIGN.md) — Real-world mimicry with textured surfaces, 3D effects, and familiar physical metaphors for intuitive digital interfaces.

### Productivity & SaaS (10)

- [`arc`](../design-systems/library/arc/DESIGN.md) — "The browser that browses for you." Translucent surfaces, gradient warmth, sidebar-first layout.
- [`cal`](../design-systems/library/cal/DESIGN.md) — Open-source scheduling. Clean neutral UI, developer-oriented simplicity.
- [`discord`](../design-systems/library/discord/DESIGN.md) — Voice / chat platform. Deep blurple, dark-first surfaces, playful accent moments.
- [`duolingo`](../design-systems/library/duolingo/DESIGN.md) — Language-learning platform. Bright owl green, chunky shadows, gamified joy.
- [`intercom`](../design-systems/library/intercom/DESIGN.md) — Customer messaging. Friendly blue palette, conversational UI patterns.
- [`linear-app`](../design-systems/library/linear-app/DESIGN.md) — Project management. Ultra-minimal, precise, purple accent.
- [`mintlify`](../design-systems/library/mintlify/DESIGN.md) — Documentation platform. Clean, green-accented, reading-optimized.
- [`notion`](../design-systems/library/notion/DESIGN.md) — All-in-one workspace. Warm minimalism, serif headings, soft surfaces.
- [`resend`](../design-systems/library/resend/DESIGN.md) — Email API. Minimal dark theme, monospace accents.
- [`zapier`](../design-systems/library/zapier/DESIGN.md) — Automation platform. Warm orange, friendly illustration-driven.

### Professional & Corporate (10)

- [`ant`](../design-systems/library/ant/DESIGN.md) — Structured, enterprise-focused design system emphasizing clarity, consistency, and efficiency for data-dense web applications.
- [`application`](../design-systems/library/application/DESIGN.md) — App dashboard with purple-themed aesthetic, top-bar navigation, card-based layouts, and developer-first workflows.
- [`corporate`](../design-systems/library/corporate/DESIGN.md) — Professional, brand-aligned design with structured grids, minimalist layouts, and consistent enterprise patterns.
- [`dashboard`](../design-systems/library/dashboard/DESIGN.md) — Dark-themed cloud-platform aesthetic with modular grids, glass-like panels, and strong data hierarchy for productivity dashboards.
- [`elegant`](../design-systems/library/elegant/DESIGN.md) — Graceful, refined aesthetic with delicate typography, minimal palettes, and polished layouts that exude sophistication.
- [`enterprise`](../design-systems/library/enterprise/DESIGN.md) — Clean, high-contrast enterprise design for data-driven workflows with intuitive drag-and-drop patterns and structured layouts.
- [`luxury`](../design-systems/library/luxury/DESIGN.md) — High-end dark aesthetic with bold headings, monochromatic palette, and premium feel for luxury brand experiences.
- [`material`](../design-systems/library/material/DESIGN.md) — Google's Material Design with layered surfaces, dynamic theming, built-in motion, and responsive cross-platform patterns.
- [`premium`](../design-systems/library/premium/DESIGN.md) — Apple-inspired premium aesthetic with precise spacing, modern typography, and a refined, polished visual language.
- [`professional`](../design-systems/library/professional/DESIGN.md) — Polished, business-ready design with modern typography, structured layouts, and a trustworthy visual identity.

### Retro & Nostalgic (4)

- [`dithered`](../design-systems/library/dithered/DESIGN.md) — Dot-pattern rendering technique that simulates shades with a limited palette for nostalgic, retro, high-contrast visuals.
- [`paper`](../design-systems/library/paper/DESIGN.md) — Paper-textured, print-inspired design with minimal colors, clean serif/sans typography, and tactile surface qualities.
- [`retro`](../design-systems/library/retro/DESIGN.md) — Throwback design with vintage-inspired typography, high-contrast retro palettes, and nostalgic visual elements.
- [`vintage`](../design-systems/library/vintage/DESIGN.md) — 1950s-1990s nostalgia with skeuomorphic touches, grainy textures, retro color palettes, and pixel-style typography.

### Starter (2)

- [`default`](../design-systems/library/default/DESIGN.md) — A clean, product-oriented default. Use when the brief doesn't call for a specific aesthetic.
- [`warm-editorial`](../design-systems/library/warm-editorial/DESIGN.md) — A serif-led magazine aesthetic. Terracotta accent on warm off-white paper.

### Themed & Unique (4)

- [`agentic`](../design-systems/library/agentic/DESIGN.md) — Conversational AI-first interface with minimal controls, clear outcomes, and delegated task flows for agentic workflows.
- [`futuristic`](../design-systems/library/futuristic/DESIGN.md) — Forward-looking design with tech-inspired typography, modern layouts, and a sleek, innovation-driven aesthetic.
- [`pacman`](../design-systems/library/pacman/DESIGN.md) — Retro arcade-inspired design with pixel fonts, dotted borders, playful high-contrast colors, and 8-bit game aesthetics.
- [`tetris`](../design-systems/library/tetris/DESIGN.md) — Classic block-game inspired design with playful colors, bold display fonts, and compact, high-energy layouts.
