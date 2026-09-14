# Guide

The reference half of the documentation: how the skills compose, what the
repo contains, the token architecture, the frameworks and design systems it
targets, and how to set a new product project up. The [README](../README.md)
is the short version.

## Contents

- [Start a New Design Project](#start-a-new-design-project)
- [How to Use](#how-to-use)
- [Project Structure](#project-structure)
- [Token Architecture](#token-architecture)
- [Supported Frameworks — *any*](#supported-frameworks--any)
- [Design-System Interop — *any*](#design-system-interop--any)
- [Accessibility Standards](#accessibility-standards)
- [Design Review Output](#design-review-output)
- [Customization](#customization)
- [Look before installing](#look-before-installing)
- [Install from a clone](#install-from-a-clone)
- [Requirements](#requirements)

---

## Start a New Design Project


The kit is the engine. A product repo that uses it wants its own lean layout, and
`templates/product-design/` is that starter, shipped ready to copy:

```
your-product/
  CLAUDE.md              the brief Claude reads every session (lean, placeholders to fill)
  CLAUDE.local.md        your personal prefs, gitignored
  .mcp.json              Figma / Notion connections, env-expanded, no secrets
  .claude/
    rules/               components.md · tokens.md · accessibility.md — load only when relevant
    skills/              repeatable workflows your team adds
    commands/            /gate — the project's own all-or-nothing check
    settings.json        shared permissions, checked into git
  design-tokens.json     source of truth: color, type, spacing (light + dark, WCAG-verified)
  src/components/        the real UI Claude reads and edits
  public/images/         real images so prototypes do not break
  reference/             real screens Claude studies for context
```

In Claude Code, from a clone of this repo:

```text
/scaffold-project ../your-product
```

It copies the template, installs the engine areas next to it
(`npx ux-ui-agent-skills add tokens components taste accessibility workflows content
frameworks design-systems scripts skills`), and walks the placeholders with you.
The project brief stays short on purpose: it loads on every turn, so everything
that is not needed every turn lives in `.claude/rules/` or a skill.

The seeded theme is not a guess. `python3 scripts/validate_template.py` proves the
layout is complete, every alias resolves, and the required contrast pairs pass
WCAG 2.2 AA in both light and dark before a project starts from it.

---

---

## How to Use


> **New here?** Read [**docs/WORKFLOW.md**](WORKFLOW.md) for the full end-to-end picture — how the Request Router loads layers on demand, real usage scenarios, and the automated release pipeline.

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

Each `SKILL.md` carries an `invocation` field, so it is clear which ones you drive and which ones the agent reaches for on its own. Both kinds can be typed as a slash command.

**User-invoked — you start them, they orchestrate a whole job**

| Command | What it does |
|---------|--------------|
| `/brandkit` | A whole brand foundation from a brief: tokens, light + dark, one theme.css, WCAG-verified |
| `/redesign` | Audit-first upgrade of an existing UI without breaking it |
| `/image-to-code` | A screenshot or mockup becomes token-driven, accessible code |
| `/prototype` | Move up the fidelity ladder and plan the usability test |
| `/migrate-design-system` | Map to or from Material 3, Apple HIG, shadcn, Radix, and the rest |
| `/governance` | Version, contribute, deprecate: how the system is allowed to change |

**Model-invoked — the discipline the agent applies while it works**

| Command | What it does |
|---------|--------------|
| `/design-tokens` | Generate, extend, or validate DTCG tokens, palettes, multi-brand theming |
| `/design-component` | Spec a component: anatomy, variants, the 8 states, a11y |
| `/design-code` | Generate code for any framework via the Adapter Protocol |
| `/design-review` | Score a design across 6 dimensions plus Nielsen, with a findings table |
| `/a11y-audit` | WCAG 2.2 audit and contrast checks |
| `/apply-aesthetic` | Apply an archetype or one of 138 named design systems |
| `/design-qa` | Stand up the CI gates that keep regressions out |
| `/ux-writing` | Write or review buttons, errors, empty states, microcopy |
| `/token-build` | Tokens to CSS, Tailwind, iOS, Android, Compose |
| `/figma-integration` | Token to Figma Variable sync and component parity |
| `/performance` | Core Web Vitals, layout shift, animation cost |

Five slash commands round it out: `/grill-me` interrogates the brief before anything is built, `/gate` runs the whole gate and reports the real N/N, `/critique` hands the result to an adversarial reviewer, `/ship` adds the release checklist, and `/scaffold-project` starts a new product repo from the template.

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
python3 scripts/validate_contrast.py               # batch WCAG gate: token pairs, light + dark
python3 scripts/contrast.py "#1d1d1f" "#ffffff"    # WCAG contrast ratio for one pair
python3 scripts/validate_component_spec.py         # every component spec is complete
python3 scripts/lint_hardcodes.py src/             # no off-theme hex/px/timing (consistency)
python3 scripts/lint_taste.py page.html            # heuristic anti-slop taste check
python3 scripts/design_systems.py list             # browse the 138-system library
python3 scripts/scaffold_component.py "Date Picker" # emit a component spec stub
python3 scripts/validate_template.py               # the starter template stays sound
python3 scripts/validate_instruction_surface.py    # no always-on rule got demoted
node    evals/run.mjs --self-test                  # the cold-start scorer still works
```

These are the same gates CI runs (`.github/workflows/ci.yml`) — token validity, **WCAG contrast in light + dark**, spec completeness, and zero hardcoded values — so theme/color stays consistent across every page and accessibility is enforced, not assumed.

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

---

## Project Structure


```
.
├── CLAUDE.md                  # Agent persona, gates, router — the always-on brief (~270 lines)
├── CONTEXT.md                 # Ubiquitous language — shared domain vocabulary
├── CLAUDE.local.md            # Personal prefs (gitignored, per-machine)
├── .mcp.example.json          # Optional Figma MCP for THIS repo — copy to .mcp.json to use
│
├── .claude/rules/             # Depth split out of CLAUDE.md, loaded only when relevant
│   └── tokens-and-color · typography-and-spacing · components · accessibility
│       frameworks · review-and-research · brand-and-operations
├── .claude/skills/            # Runnable skills — invoke via /name
│   └── design-tokens · design-component · design-code · design-review · a11y-audit
│       apply-aesthetic · redesign · migrate-design-system · prototype · ux-writing
├── .claude/commands/          # Slash commands — /grill-me · /gate · /critique · /ship · /scaffold-project
├── .claude/settings.json      # Shared permissions (scripts allowlist), checked into git
├── .claude/agents/            # design-critic — the adversarial reviewer behind /critique
│
├── evals/                     # Cold-start briefs + run.mjs — 14 objective gates on produced work
│
├── reference/                 # Real screens the agent studies before designing/reviewing
│
├── templates/product-design/  # Starter layout for a NEW product repo — /scaffold-project
│   ├── CLAUDE.md · CLAUDE.local.md.template · .mcp.json · design-tokens.json
│   └── .claude/{rules,skills,commands,settings.json} · src/components · public/images · reference
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
├── taste/                     # Aesthetic judgment layer
│   ├── design-taste.md        # Anti-slop doctrine, banned defaults, pre-flight check
│   ├── aesthetic-systems.md   # Archetypes + catalog of 138 design systems
│   └── motion-choreography.md # Motion grammar + reduced-motion parity
│
├── design-systems/            # Interop + brand library
│   ├── interop-protocol.md    # Map to/from ANY design system
│   ├── crosswalk.md           # Material 3 · Apple HIG · Fluent · Carbon · shadcn · Radix
│   │                          # · Ant · Polaris · Primer · Atlassian · Bootstrap
│   └── library/<name>/        # 138 brand-grade DESIGN.md specs
│
├── content/                   # UX writing & content design
│   └── voice-tone.md          # Voice & tone, error/empty-state copy, microcopy, inclusive language
│
├── components/                # Component specs (Atomic Design) — 50 components
│   ├── atoms · molecules · organisms · templates
│   ├── navigation · feedback · forms-advanced · overlays
│   └── data-display · data-viz · icon-system
│
├── accessibility/             # WCAG & ARIA references + inclusive design
│   ├── wcag-checklist.md      # WCAG 2.2 checklist (POUR, P0/P1/P2)
│   ├── aria-patterns.md       # WAI-ARIA patterns for 19 components
│   ├── cognitive.md · vision.md · i18n-rtl.md   # cognitive · low-vision/CVD/forced-colors · RTL
│   └── wcag-aaa.md            # AAA upgrade delta
│
├── workflows/                 # Design process + ops/pipeline guides
│   ├── design-review.md · design-to-code.md · prototyping.md · redesign-audit.md
│   └── governance.md · token-build.md · figma-integration.md · design-qa.md · performance.md
│
└── frameworks/                # Implementation patterns — ANY framework
    ├── adapter-protocol.md    # Universal translation contract
    ├── react-tailwind.md · nextjs.md · swiftui.md   # full references
    └── adapters/              # vue · svelte · angular · solid · web-components-lit · qwik · astro
                               # mui · mantine · chakra · bootstrap
                               # react-native · flutter · jetpack-compose · vanilla-css · css-in-js
```

> [!NOTE]
> The **design-taste layer** (`taste/`) and the **138-system library** (`design-systems/library/`) set visual direction; the **system** (tokens, components, accessibility) keeps it correct. Taste serves the Aesthetics tier and never overrides accessibility. Skills under `.claude/skills/` run with agent permissions — review before use.

---

---

## Token Architecture


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

---

## Supported Frameworks — *any*


The [**Framework Adapter Protocol**](../frameworks/adapter-protocol.md) defines a universal token→framework contract, so the agent can target a stack even with no dedicated file (it generates an adapter on demand).

**Full references**

| Framework | Version | Key Patterns |
|-----------|---------|-------------|
| **React + Tailwind** | React 19, Tailwind v4 | `forwardRef`, `cva`, `cn()`, CSS custom properties |
| **Next.js** | 15 (App Router) | Server/Client Components, `next/font`, `next/image`, Server Actions |
| **SwiftUI** | 6 (iOS 18+) | `ButtonStyle`, `ViewModifier`, `@ScaledMetric`, Dynamic Type |

**Concise adapters** — Vue 3 · Svelte 5 · Angular · SolidJS · Web Components (Lit) · React Native · Flutter · Jetpack Compose · vanilla CSS · CSS-in-JS (emotion/vanilla-extract/Panda)

---

---

## Design-System Interop — *any*


Adopt, build on, or migrate between external design systems via a role-based crosswalk ([interop-protocol](../design-systems/interop-protocol.md) + [crosswalk](../design-systems/crosswalk.md)). Curated tables: **Material Design 3 · Apple HIG · Fluent 2 · Carbon · shadcn/ui · Radix** (others derived on demand). Plus a **library of 138 brand-grade design systems** (apple, linear, stripe, vercel, notion, spotify, tesla…) under `design-systems/library/`.

---

---

## Accessibility Standards


All outputs follow **WCAG 2.2 Level AA** as a *minimum*:

- Color contrast: **4.5:1** (text), **3:1** (UI components)
- Keyboard navigable with visible focus indicators
- Screen reader compatible with proper ARIA roles and live regions
- Touch targets: **24×24px** minimum (WCAG 2.5.8)
- WCAG 2.2 criteria: Focus Not Obscured, Target Size, Accessible Authentication

---

---

## Design Review Output


When reviewing designs, the agent scores across 6 weighted dimensions:

| Dimension | Weight | | Dimension | Weight |
|-----------|--------|---|-----------|--------|
| Visual Hierarchy | 20% | | Usability | 20% |
| Consistency | 20% | | Responsiveness | 10% |
| Accessibility | 20% | | Performance | 10% |

Findings are categorized: **Critical** (must fix) → **Major** (fix this sprint) → **Minor** (when convenient) → **Enhancement** (backlog).

---

---

## Customization


This is a **starter kit** — make it yours:

- **Brand colors** — edit `tokens/colors.json` primitives, then update semantic references
- **Typography** — swap font families in `tokens/typography.json` and framework files
- **Components** — add new components following the existing spec format in `components/`
- **Frameworks** — add new framework files in `frameworks/` (e.g., `vue.md`, `flutter.md`)
- **Workflows** — adapt review rubrics and checklists in `workflows/` to your team's process

---

---

## Look before installing

```bash
npx ux-ui-agent-skills demo [dest]     # default: ./ux-ui-demo
```

Copies the bundled `examples/` - the reference app, 23 component harnesses, two
aesthetic demos, all rendering from one token theme - and opens the index in a
browser. `--no-open` copies without launching anything, `--dry` reports what it
would copy and writes nothing. The folder is a throwaway: nothing is installed
into your project.

---

## Install from a clone

For working on the kit itself, or vendoring it into a monorepo:

```bash
git clone https://github.com/plugin87/ux-ui-agent-skills.git
cp -r ux-ui-agent-skills/ your-project/
```

The plugin and `npx` paths in the [README](../README.md#quick-start) are what
most projects want. See [CONTRIBUTING.md](../CONTRIBUTING.md) for the full
development setup, including the gates.

---

## Requirements


- [Claude Code](https://claude.com/claude-code) CLI or any Claude-powered IDE
- A Claude model with sufficient context (Sonnet, Opus, or Haiku)

---

---

Back to the [README](../README.md), the [changelog](../CHANGELOG.md), or the
[live demo](https://plugin87.github.io/ux-ui-agent-skills/).
