<div align="center">

# 🎨 UX/UI Agent Skills

### Turn Claude into a **Senior Design Architect** — 15+ years of expertise in design systems, accessibility, and production-ready component engineering.

A comprehensive kit of structured instructions, design tokens, runnable skills, and 138 brand-grade design systems that turn Claude into a UX/UI expert agent — targeting **any framework** and **any design system**. Drop it into any project for consistent, accessible, token-driven design outputs, every time.

<br>

[![Version](https://img.shields.io/badge/version-1.1.0-6366f1?style=for-the-badge)](https://github.com/plugin87/ux-ui-agent-skills/releases)
[![License: MIT](https://img.shields.io/badge/license-MIT-22c55e?style=for-the-badge)](#-license)
[![WCAG 2.2 AA](https://img.shields.io/badge/WCAG-2.2_AA-a855f7?style=for-the-badge)](#-accessibility-standards)

<br>

[![npm](https://img.shields.io/npm/v/ux-ui-agent-skills?style=flat-square&logo=npm&logoColor=white&color=cb3837)](https://www.npmjs.com/package/ux-ui-agent-skills)
[![npm downloads](https://img.shields.io/npm/dt/ux-ui-agent-skills?style=flat-square&logo=npm&logoColor=white&color=cb3837)](https://www.npmjs.com/package/ux-ui-agent-skills)
![Tokens](https://img.shields.io/badge/Design_Tokens-DTCG-fbbf24?style=flat-square)
![Skills](https://img.shields.io/badge/runnable_skills-10-14b8a6?style=flat-square)
![Design Systems](https://img.shields.io/badge/design_systems-138-f97316?style=flat-square)
![Frameworks](https://img.shields.io/badge/frameworks-any-8b5cf6?style=flat-square)
![React 19](https://img.shields.io/badge/React-19-60a5fa?style=flat-square&logo=react)
![Next.js 15](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=nextdotjs)
![SwiftUI 6](https://img.shields.io/badge/SwiftUI-6-f472b6?style=flat-square&logo=swift)
![Tailwind v4](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwindcss)

</div>

---

## 📌 Version

**Current release: `v1.1.0`** · See the [Changelog](#-changelog) · [All releases](https://github.com/plugin87/ux-ui-agent-skills/releases)

> No build tools, dependencies, or runtime required — this is a pure instruction & knowledge layer for AI agents.

---

## ✨ What It Does

| Capability | Description |
|-----------|-------------|
| 🎯 **Design Token Generation** | Produces DTCG-format JSON tokens (colors, typography, spacing, shadows, borders, breakpoints, motion) with a 3-tier architecture: Primitive → Semantic → Component |
| 🧩 **Component Design** | Designs components from Atoms to Templates following Atomic Design, with anatomy, variants, states, token mapping, and accessibility specs |
| ⟨⟩ **Code Generation (any framework)** | Adapter Protocol targets **any** stack — React+Tailwind, Next.js, SwiftUI, Vue, Svelte, Angular, Solid, Web Components/Lit, React Native, Flutter, Jetpack Compose, vanilla CSS, CSS-in-JS — or generates a new adapter on demand |
| 🔌 **Design-System Interop** | Maps to/from **any** design system (Material 3, Apple HIG, Fluent, Carbon, shadcn/ui, Radix…) via a role-based crosswalk |
| ⚡ **Runnable Skills** | 10 invocable `/skills` + real scripts (validate tokens, WCAG contrast checker, design-system browser, component scaffolder) |
| ♿ **Accessibility Auditing** | Evaluates against WCAG 2.2 AA/AAA with prioritized findings (P0/P1/P2) |
| ⭐ **Design Review** | Scores designs across 6 dimensions with Nielsen's 10 Heuristics and a structured findings table |
| 🧪 **Prototyping & Research** | Guides through a 5-level fidelity ladder, user journey mapping, and usability testing scripts |
| 🎞️ **Motion Design** | Tokenized durations, easing curves, transition presets, and reduced-motion strategy for accessible animation |
| ✍️ **UX Writing** | Voice & tone system with error/empty-state formulas, microcopy patterns, and inclusive language guidelines |
| 🎭 **Design Taste** | Native anti-slop doctrine, aesthetic archetypes, and a library of **138 design systems** for layout variance, editorial typography, and premium visual direction |

---

## 🚀 Quick Start

### Option A — Install with `npx` (recommended)

Drop the kit into any project, no clone needed:

```bash
npx ux-ui-agent-skills init          # full kit into the current folder
npx ux-ui-agent-skills add tokens taste design-systems   # just some areas
npx ux-ui-agent-skills list          # see all areas
```

Flags: `--force` (overwrite existing files) · `--dry` (preview, change nothing).

### Option B — Clone

```bash
git clone https://github.com/plugin87/ux-ui-agent-skills.git
cp -r ux-ui-agent-skills/ your-project/
```

**Then start using** — open the project in **Claude Code** or any Claude-powered IDE. `CLAUDE.md` loads automatically, activating the agent persona with full access to every tokens / components / taste / design-system file and the runnable `/skills`.

<details>
<summary><b>💡 Example prompts</b></summary>

<br>

```text
"Design a notification component with all states and accessibility"
"Review this login page against WCAG 2.2 and Nielsen's heuristics"
"Generate React + Tailwind code for a data table with sorting and pagination"
"Create a color token palette for a fintech brand using blue as the primary"
"Audit this form for accessibility issues — give me a prioritized findings table"
"Write the empty state and error copy for the onboarding flow"
"Spec the motion for the modal open/close with reduced-motion fallback"
```

</details>

---

## 🎮 How to Use

There are **three ways** to drive the kit. Use whichever fits the moment.

### 1. Just ask (zero commands)

`CLAUDE.md` loads automatically, so plain requests already route to the right knowledge. Describe what you want and the agent self-routes via the built-in **Request Router**:

```text
"Generate a Svelte button with all states and dark mode"
"Make this landing page feel like Linear"
"Migrate our Material 3 colors into this token system"
```

### 2. Run a skill explicitly (`/skill`)

Type a slash command to invoke a capability directly. Each skill loads only the files it needs and can run its own scripts.

| Command | What it does |
|---------|--------------|
| `/design-tokens` | Generate / extend / validate DTCG tokens, palettes, multi-brand theming |
| `/design-component` | Spec a component (anatomy, variants, 8 states, a11y) |
| `/design-code` | Generate code for **any** framework via the Adapter Protocol |
| `/design-review` | Score a design (6 dimensions + Nielsen) with a findings table |
| `/a11y-audit` | WCAG 2.2 audit + contrast checks |
| `/apply-aesthetic` | Apply an archetype or one of 138 design systems |
| `/redesign` | Audit-first upgrade of an existing UI without breaking it |
| `/migrate-design-system` | Map to/from Material 3, Apple HIG, shadcn, Radix, etc. |
| `/prototype` | Move up the fidelity ladder + plan usability testing |
| `/ux-writing` | Write/review buttons, errors, empty states, microcopy |

```text
/design-code  a pricing card in Vue, dark-mode aware
/apply-aesthetic  stripe   →  make the dashboard feel like Stripe
/a11y-audit  this checkout form
/migrate-design-system  from Material 3 to our tokens
```

### 3. Run the scripts (real, no dependencies)

Plain `python3` — useful in the terminal or CI:

```bash
python3 scripts/validate_tokens.py                 # validate token JSON + alias refs
python3 scripts/contrast.py "#1d1d1f" "#ffffff"    # WCAG contrast ratio + pass/fail
python3 scripts/design_systems.py list             # browse the 138-system library
python3 scripts/design_systems.py show apple        # inspect one system
python3 scripts/scaffold_component.py "Date Picker" # emit a component spec stub
```

### Typical flow

```text
1. /apply-aesthetic linear      → set the visual direction (tokens re-pointed)
2. /design-component Combobox    → spec it with states + a11y
3. /design-code  Combobox in React + Tailwind   → production code
4. /a11y-audit                   → verify contrast, keyboard, focus
5. /design-review                → score + findings before ship
```

> **Tip:** skills compose. `apply-aesthetic` always re-verifies contrast through `a11y-audit`; `redesign` calls `design-review` + `a11y-audit` automatically.

---

## 📂 Project Structure

```
.
├── CLAUDE.md                  # Agent persona & master instructions
│
├── .claude/skills/            # ⚡ Runnable skills — invoke via /name
│   └── design-tokens · design-component · design-code · design-review · a11y-audit
│       apply-aesthetic · redesign · migrate-design-system · prototype · ux-writing
│
├── scripts/                   # Real helper scripts (python3, no deps)
│   ├── validate_tokens.py     # JSON + alias validation for tokens/
│   ├── contrast.py            # WCAG 2.2 contrast-ratio checker
│   ├── design_systems.py      # Browse/search the 138-system library
│   └── scaffold_component.py  # Emit a component spec stub
│
├── tokens/                    # Design tokens (DTCG format) — 13 files
│   ├── colors · typography · spacing · shadows · borders · breakpoints · motion
│   └── gradients · opacity · blur · sizing · states · theming
│
├── taste/                     # 🎭 Aesthetic judgment layer
│   ├── design-taste.md        # Anti-slop doctrine, banned defaults, pre-flight check
│   ├── aesthetic-systems.md   # Archetypes + catalog of 138 design systems
│   └── motion-choreography.md # Motion grammar + reduced-motion parity
│
├── design-systems/            # 🔌 Interop + brand library
│   ├── interop-protocol.md    # Map to/from ANY design system
│   ├── crosswalk.md           # Material 3 · Apple HIG · Fluent · Carbon · shadcn · Radix
│   └── library/<name>/        # 138 brand-grade DESIGN.md specs
│
├── content/                   # UX writing & content design
│   └── voice-tone.md          # Voice & tone, error/empty-state copy, microcopy, inclusive language
│
├── components/                # Component specs (Atomic Design) — 42 components
│   ├── atoms · molecules · organisms · templates
│   └── navigation · feedback · forms-advanced · overlays
│
├── accessibility/             # WCAG & ARIA references
│   ├── wcag-checklist.md      # WCAG 2.2 checklist (POUR, P0/P1/P2)
│   └── aria-patterns.md       # WAI-ARIA patterns for 15+ components
│
├── workflows/                 # Design process guides
│   ├── design-review.md · design-to-code.md · prototyping.md
│   └── redesign-audit.md      # Audit-first redesign + output completeness
│
└── frameworks/                # Implementation patterns — ANY framework
    ├── adapter-protocol.md    # Universal translation contract
    ├── react-tailwind.md · nextjs.md · swiftui.md   # full references
    └── adapters/              # vue · svelte · angular · solid · web-components-lit
                               # react-native · flutter · jetpack-compose · vanilla-css · css-in-js
```

> [!NOTE]
> The **design-taste layer** (`taste/`) and the **138-system library** (`design-systems/library/`) set visual direction; the **system** (tokens, components, accessibility) keeps it correct. Taste serves the Aesthetics tier and never overrides accessibility. Skills under `.claude/skills/` run with agent permissions — review before use.

---

## 🎨 Token Architecture

The design token system follows a **3-tier hierarchy** using the [DTCG](https://design-tokens.github.io/community-group/format/) standard:

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│  COMPONENT TOKENS   │ ──► │  SEMANTIC TOKENS    │ ──► │  PRIMITIVE TOKENS   │
│  button-bg-primary  │     │  action.primary     │     │  blue.600 = #2563EB │
│  (use in code)      │     │  (use in design)    │     │  (raw palette)      │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
```

| Tier | Role | Example |
|------|------|---------|
| **Primitive** | Raw color/size values — never referenced directly | `blue.600`, `space.4` |
| **Semantic** | Purpose-based aliases — used in design | `action.primary`, `text.secondary`, `surface.card` |
| **Component** | Scoped to specific components — used in code | `button.primary-bg`, `input.border-focus` |

> Dark mode works by swapping **semantic** tokens — primitives stay the same.

---

## 🧰 Supported Frameworks — *any*

The [**Framework Adapter Protocol**](frameworks/adapter-protocol.md) defines a universal token→framework contract, so the agent can target a stack even with no dedicated file (it generates an adapter on demand).

**Full references**

| Framework | Version | Key Patterns |
|-----------|---------|-------------|
| **React + Tailwind** | React 19, Tailwind v4 | `forwardRef`, `cva`, `cn()`, CSS custom properties |
| **Next.js** | 15 (App Router) | Server/Client Components, `next/font`, `next/image`, Server Actions |
| **SwiftUI** | 6 (iOS 18+) | `ButtonStyle`, `ViewModifier`, `@ScaledMetric`, Dynamic Type |

**Concise adapters** — Vue 3 · Svelte 5 · Angular · SolidJS · Web Components (Lit) · React Native · Flutter · Jetpack Compose · vanilla CSS · CSS-in-JS (emotion/vanilla-extract/Panda)

---

## 🔌 Design-System Interop — *any*

Adopt, build on, or migrate between external design systems via a role-based crosswalk ([interop-protocol](design-systems/interop-protocol.md) + [crosswalk](design-systems/crosswalk.md)). Curated tables: **Material Design 3 · Apple HIG · Fluent 2 · Carbon · shadcn/ui · Radix** (others derived on demand). Plus a **library of 138 brand-grade design systems** (apple, linear, stripe, vercel, notion, spotify, tesla…) under `design-systems/library/`.

---

## ♿ Accessibility Standards

All outputs follow **WCAG 2.2 Level AA** as a *minimum*:

- ✅ Color contrast: **4.5:1** (text), **3:1** (UI components)
- ✅ Keyboard navigable with visible focus indicators
- ✅ Screen reader compatible with proper ARIA roles and live regions
- ✅ Touch targets: **24×24px** minimum (WCAG 2.5.8)
- ✅ WCAG 2.2 criteria: Focus Not Obscured, Target Size, Accessible Authentication

---

## ⭐ Design Review Output

When reviewing designs, the agent scores across 6 weighted dimensions:

| Dimension | Weight | | Dimension | Weight |
|-----------|--------|---|-----------|--------|
| Visual Hierarchy | 20% | | Usability | 20% |
| Consistency | 20% | | Responsiveness | 10% |
| Accessibility | 20% | | Performance | 10% |

Findings are categorized: **🔴 Critical** (must fix) → **🟠 Major** (fix this sprint) → **🟡 Minor** (when convenient) → **🔵 Enhancement** (backlog).

---

## 🛠️ Customization

This is a **starter kit** — make it yours:

- **Brand colors** — edit `tokens/colors.json` primitives, then update semantic references
- **Typography** — swap font families in `tokens/typography.json` and framework files
- **Components** — add new components following the existing spec format in `components/`
- **Frameworks** — add new framework files in `frameworks/` (e.g., `vue.md`, `flutter.md`)
- **Workflows** — adapt review rubrics and checklists in `workflows/` to your team's process

---

## 📋 Requirements

- [Claude Code](https://claude.com/claude-code) CLI or any Claude-powered IDE
- A Claude model with sufficient context (Sonnet, Opus, or Haiku)

---

## 📝 Changelog

### `v1.1.0`
- 📦 **npm package** — install into any project with `npx ux-ui-agent-skills init` (zero-dependency CLI: `init` / `add` / `list`, `--force`/`--dry`)
- ⚡ **Runnable skills** — 10 invocable `/skills` under `.claude/skills/` + real helper scripts (`validate_tokens.py`, `contrast.py`, `design_systems.py`, `scaffold_component.py`)
- 🧠 **Intelligence layer** — Request Router in `CLAUDE.md`; **Framework Adapter Protocol** (target any framework) with 10 concise adapters; **Design-System Interop Protocol** + crosswalk (map to/from any design system)
- 🎭 **Native design-taste** — `taste/` (anti-slop doctrine, aesthetic archetypes, motion choreography) + a **library of 138 brand-grade design systems**
- ➕ **6 new token categories** — gradients, opacity, blur, sizing, states, theming (multi-brand + density)
- 🧩 **16 new component specs** — Tabs, Breadcrumb, Pagination, Stepper, Menu, Toast, Banner, Skeleton, Progress, Empty State, Combobox, Select, Slider, Date Picker, File Upload, Popover, Command Palette, Divider
- 🧹 Removed the externally-bundled taste skills in favor of native, first-party content

### `v1.0.1`
- ➕ **Motion tokens** — `tokens/motion.json`: duration scale, easing curves, transition presets, keyframes, reduced-motion strategy
- ➕ **UX writing guide** — `content/voice-tone.md`: voice & tone system, error/empty-state formulas, microcopy patterns, inclusive language, pre-ship checklist
- 🎨 Added `cover.html` repo cover image

### `v1.0.0`
- 🎉 Initial release — agent persona, 6 token files, 26 components (Atomic Design), WCAG 2.2 + ARIA references, 3 workflow guides, 3 framework guides

---

## 📄 License

Released under the **[MIT License](https://opensource.org/licenses/MIT)**.

---

<div align="center">

If this kit helps you, consider giving it a ⭐

</div>
