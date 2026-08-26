<div align="center">

# UX/UI Agent Skills

### Turn Claude into a **Senior Design Architect** — 15+ years of expertise in design systems, accessibility, and production-ready component engineering.

A comprehensive kit of structured instructions, design tokens, runnable skills, and 138 brand-grade design systems that turn Claude into a UX/UI expert agent — targeting **any framework** and **any design system**. Drop it into any project for consistent, accessible, token-driven design outputs, every time.

<br>

[![Version](https://img.shields.io/badge/version-2.5.1-6366f1?style=for-the-badge)](https://github.com/plugin87/ux-ui-agent-skills/releases)
[![License: MIT](https://img.shields.io/badge/license-MIT-22c55e?style=for-the-badge)](#-license)
[![WCAG 2.2 AA→AAA](https://img.shields.io/badge/WCAG-2.2_AA→AAA-a855f7?style=for-the-badge)](#-accessibility-standards)

<br>

[![npm](https://img.shields.io/npm/v/ux-ui-agent-skills?style=flat-square&logo=npm&logoColor=white&color=cb3837)](https://www.npmjs.com/package/ux-ui-agent-skills)
[![npm downloads](https://img.shields.io/npm/dt/ux-ui-agent-skills?style=flat-square&logo=npm&logoColor=white&color=cb3837)](https://www.npmjs.com/package/ux-ui-agent-skills)
![Tokens](https://img.shields.io/badge/Design_Tokens-DTCG-fbbf24?style=flat-square)
![Skills](https://img.shields.io/badge/runnable_skills-17-14b8a6?style=flat-square)
![Gates](https://img.shields.io/badge/objective_gates-37-16a34a?style=flat-square)
![Design Systems](https://img.shields.io/badge/design_systems-138-f97316?style=flat-square)
![Frameworks](https://img.shields.io/badge/frameworks-any-8b5cf6?style=flat-square)
![Adapters](https://img.shields.io/badge/framework_adapters-16-22d3ee?style=flat-square)
![React 19](https://img.shields.io/badge/React-19-60a5fa?style=flat-square&logo=react)
![Next.js 15](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=nextdotjs)
![SwiftUI 6](https://img.shields.io/badge/SwiftUI-6-f472b6?style=flat-square&logo=swift)
![Tailwind v4](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwindcss)

</div>

---

## Version

**Current release: `v2.5.1`** · See the [Changelog](#-changelog) · [All releases](https://github.com/plugin87/ux-ui-agent-skills/releases)

> No build tools, dependencies, or runtime required — this is a pure instruction & knowledge layer for AI agents.

---

## What It Does

| Capability | Description |
|-----------|-------------|
| **Design Token Generation** | Produces DTCG-format JSON tokens (colors, typography, spacing, shadows, borders, breakpoints, motion) with a 3-tier architecture: Primitive → Semantic → Component |
| **Component Design** | Designs components from Atoms to Templates following Atomic Design, with anatomy, variants, states, token mapping, and accessibility specs |
| **Code Generation (any framework)** | Adapter Protocol targets **any** stack — React+Tailwind, Next.js, SwiftUI, Vue, Svelte, Angular, Solid, Web Components/Lit, React Native, Flutter, Jetpack Compose, vanilla CSS, CSS-in-JS — or generates a new adapter on demand |
| **Design-System Interop** | Maps to/from **any** design system (Material 3, Apple HIG, Fluent, Carbon, shadcn/ui, Radix…) via a role-based crosswalk |
| **Runnable Skills** | 17 invocable `/skills` (each declaring `invocation: user|model`) + 4 slash commands + real scripts: token and contrast validators, real-render and state-aware WCAG gates, axe-core a11y, focus-trap, RTL, target size, keyboard, reduced motion, overflow, token-by-intent, taste and slop audits, token build |
| **Accessibility Auditing** | Evaluates against WCAG 2.2 AA/AAA with prioritized findings (P0/P1/P2) |
| **Design Review** | Scores designs across 6 dimensions with Nielsen's 10 Heuristics and a structured findings table |
| **Prototyping & Research** | Guides through a 5-level fidelity ladder, user journey mapping, and usability testing scripts |
| **Motion Design** | Tokenized durations, easing curves, transition presets, and reduced-motion strategy for accessible animation |
| **UX Writing** | Voice & tone system with error/empty-state formulas, microcopy patterns, and inclusive language guidelines |
| **Design Taste** | Native anti-slop doctrine, aesthetic archetypes, and a library of **138 design systems** for layout variance, editorial typography, and premium visual direction |

---

## Quick Start

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
<summary><b>Example prompts</b></summary>

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

## How to Use

> **New here?** Read [**docs/WORKFLOW.md**](docs/WORKFLOW.md) for the full end-to-end picture — how the Request Router loads layers on demand, real usage scenarios, and the automated release pipeline.

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

Three slash commands round it out: `/gate` runs the whole gate and reports the real N/N, `/ship` adds the release checklist, and `/scaffold-project` starts a new product repo from the template.

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

## Proving It, and Admitting What Cannot Be Proven

The kit ships **37 objective gates** behind one command:

```bash
node scripts/accuracy_report.mjs     # 35/35 or it fails — no partial credit
```

Token validity, WCAG contrast on a real headless render in light *and* dark, every
element in default/hover/focus, axe roles and names, focus traps, RTL, responsive
at 280/320/414, target size, keyboard operability, reduced motion (including
content that only an animation reveals), silent text clipping, token-by-intent,
and zero emoji anywhere in the output or the instruction surface.

That is correctness. It is not quality, and the kit says so out loud:

| Question | Answer | How |
|---|---|---|
| Is it correct? | Measured, all or nothing | `node scripts/accuracy_report.mjs` -> a real `N/N` |
| Is it any good? | Judged, never scored | `/critique` — an adversarial `design-critic` that renders the work, argues for rejection, and cites evidence per finding |
| Does the kit transfer to a cold start? | Measured, one brief at a time | `evals/` — cold-start briefs, then `node evals/run.mjs <brief-id>` points 14 objective gates at what the agent produced |

`/critique` exists because a passing gate is never evidence of taste. It refuses to
review from source alone, screenshots at 1280 and 390 in both themes, clicks every
control, and returns a verdict with the three reasons a senior designer would send
the work back.

Runs are recorded in `evals/RESULTS.md` with their provenance attached — who built the output and whether they could see the kit while doing it — because a run without that context is not evidence of anything.

The eval suite exists because "the kit's own examples pass" is a weaker claim than
"an agent given only this kit and a brief produces work that passes". Building it
caught two real defects the 34-check gate had missed. See `evals/README.md`.

---

## Project Structure

```
.
├── CLAUDE.md                  # Agent persona, gates, router — the always-on brief (~270 lines)
├── CONTEXT.md                 # Ubiquitous language — shared domain vocabulary
├── CLAUDE.local.md            # Personal prefs (gitignored, per-machine)
├── .mcp.json                  # Project MCP servers (Figma) — no secrets, env-expanded
│
├── .claude/rules/             # Depth split out of CLAUDE.md, loaded only when relevant
│   └── tokens-and-color · typography-and-spacing · components · accessibility
│       frameworks · review-and-research · brand-and-operations
├── .claude/skills/            # Runnable skills — invoke via /name
│   └── design-tokens · design-component · design-code · design-review · a11y-audit
│       apply-aesthetic · redesign · migrate-design-system · prototype · ux-writing
├── .claude/commands/          # Custom slash commands — /gate · /ship · /scaffold-project
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

## Supported Frameworks — *any*

The [**Framework Adapter Protocol**](frameworks/adapter-protocol.md) defines a universal token→framework contract, so the agent can target a stack even with no dedicated file (it generates an adapter on demand).

**Full references**

| Framework | Version | Key Patterns |
|-----------|---------|-------------|
| **React + Tailwind** | React 19, Tailwind v4 | `forwardRef`, `cva`, `cn()`, CSS custom properties |
| **Next.js** | 15 (App Router) | Server/Client Components, `next/font`, `next/image`, Server Actions |
| **SwiftUI** | 6 (iOS 18+) | `ButtonStyle`, `ViewModifier`, `@ScaledMetric`, Dynamic Type |

**Concise adapters** — Vue 3 · Svelte 5 · Angular · SolidJS · Web Components (Lit) · React Native · Flutter · Jetpack Compose · vanilla CSS · CSS-in-JS (emotion/vanilla-extract/Panda)

---

## Design-System Interop — *any*

Adopt, build on, or migrate between external design systems via a role-based crosswalk ([interop-protocol](design-systems/interop-protocol.md) + [crosswalk](design-systems/crosswalk.md)). Curated tables: **Material Design 3 · Apple HIG · Fluent 2 · Carbon · shadcn/ui · Radix** (others derived on demand). Plus a **library of 138 brand-grade design systems** (apple, linear, stripe, vercel, notion, spotify, tesla…) under `design-systems/library/`.

---

## Accessibility Standards

All outputs follow **WCAG 2.2 Level AA** as a *minimum*:

- Color contrast: **4.5:1** (text), **3:1** (UI components)
- Keyboard navigable with visible focus indicators
- Screen reader compatible with proper ARIA roles and live regions
- Touch targets: **24×24px** minimum (WCAG 2.5.8)
- WCAG 2.2 criteria: Focus Not Obscured, Target Size, Accessible Authentication

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

## Customization

This is a **starter kit** — make it yours:

- **Brand colors** — edit `tokens/colors.json` primitives, then update semantic references
- **Typography** — swap font families in `tokens/typography.json` and framework files
- **Components** — add new components following the existing spec format in `components/`
- **Frameworks** — add new framework files in `frameworks/` (e.g., `vue.md`, `flutter.md`)
- **Workflows** — adapt review rubrics and checklists in `workflows/` to your team's process

---

## Requirements

- [Claude Code](https://claude.com/claude-code) CLI or any Claude-powered IDE
- A Claude model with sufficient context (Sonnet, Opus, or Haiku)

---

## Changelog

### `v2.5.1`

The release that checks the checkers. Every gate in this kit pointed at examples that already pass, which proves a gate says yes to good work and never that it can still say no. `tests/` supplies the other half, and building it turned up four places where a gate reported green without having looked at anything.

**`tests/` — negative fixtures, one per gate**

- `npm run test:gates` runs the full suite (needs Playwright and real Chrome); `npm run test:unit` runs the browser-free half. Runner is Node's built-in `node --test` — no new dependency.
- Every gate now has input built to break exactly the thing it measures: an emoji in UI, raw hex, a dangling alias, a sub-AA token pair, a floating `var()`, a button that only fails contrast on hover, a control with no accessible name, a 16x16 target with a crowded neighbour, a blue Delete, a 280px overflow, a toggle Enter and Space cannot operate, silently clipped text, content revealed only by an entrance animation, a dialog Tab walks out of, an `aria-sort` header that sorts nothing, a physical margin that will not mirror under RTL, the hardcoded indigo gradient, and a 1.5x type scale. Each must exit 1. `tests/fixtures/good/clean-panel.html` must survive all sixteen render gates in light and dark.
- A pass is not accepted on trust: `rejects()` requires exit status exactly 1 and refuses three near-misses that would otherwise read as a detection — a usage message (nine gates print one and exit 0 when handed nothing, so a typo'd path would look clean), a `SKIPPED` line, and an exit 1 whose output does not match the signal under test.
- The suite itself was verified by mutation, not assertion: `check_no_emoji` made to stop reporting its hits, `validate_contrast` made to stop failing a bad pair, and `verify_states` made to always exit 0 — each turned the suite red.
- `tests/README.md` records what is still not covered rather than implying it is: five scripts hardwire the repo root and ignore argv, `verify_keyboard.mjs` filters on tabbability before auditing so a `<div role="button">` with no `tabindex` is invisible to it, `build_tokens.mjs` has no failure mode at all, and taste remains unmeasurable.

**Four false greens, found and fixed**

- **A missing browser no longer reads as a pass.** Fourteen of the fifteen render gates printed `SKIPPED` and exited 0 when Playwright could not be imported — on a clean CI runner or a fresh install, `accuracy_report.mjs` would have reported 100% with fourteen gates having measured nothing. `DS_REQUIRE_BROWSER=1` turns that into exit 1, and `accuracy_report.mjs`, `evals/run.mjs` and CI's render job all set it. Without the flag the gates stay skippable for local convenience.
- **`validate_contrast.py` passed a token file containing no tokens.** A required pair whose tokens could not be resolved printed `?` and was skipped, so an empty or differently-shaped `design-tokens.json` produced "OK: all required contrast pairs pass". Its own docstring always promised that a missing token fails; now it does.
- **`check_no_emoji.py` and `lint_hardcodes.py` returned OK for a path that does not exist.** Scanning zero files read as clean, so a renamed directory in CI would have passed silently. Both now error on a missing path, and on a path that exists but holds nothing scannable.
- **Gate counts in prose had drifted and nothing checked them.** `ci.yml` said "12 objective gates" where the array had 14, and the README said "thirteen" and "34-check gate". `tests/meta/registry.test.mjs` now counts the real arrays and holds every claim in CI, the README and `accuracy_report.mjs` to them.

### `v2.5.0`

The release where the kit stopped taking its own word for anything. Enforcement went from **25 to 37 objective checks**, the always-on brief was cut in half, and the two things a gate genuinely cannot do — judge taste, and prove the kit works from a cold start — got real machinery instead of a disclaimer.

**Heads-up if you vendored `CLAUDE.md`**

- **`CLAUDE.md` is now ~276 lines, not 576.** Depth moved to `.claude/rules/` (7 files) and loads only when the work calls for it. Headings are unchanged, so pointers into them still resolve, but anyone who vendored the old single-file brief should re-copy: `npx ux-ui-agent-skills add claude rules`. Always-on and non-negotiable: the emoji ban, the gate protocol, token-by-intent, one-theme, the 8-state table, output completeness. `validate_instruction_surface.py` fails the build if one of them is ever demoted, if a rule file is orphaned, or if the brief regrows past its budget.
- **`init` installs a new area (`rules`)**, and the package now ships `templates/`, `.claude/rules/`, `.claude/commands/`.

**Enforcement: 25 -> 37 checks, still all-or-nothing**

- Five render-based gates for rules the kit preached and nothing checked: `verify_target_size.mjs` (WCAG 2.5.8 with the spec's real spacing / inline / label-hit-area exceptions), `verify_reduced_motion.mjs` (policy present, motion stopped, and **no content lost** — catches content only an entrance animation reveals), `verify_keyboard.mjs` (WCAG 2.1.1, ARIA-aware: roving `tabindex` and `aria-activedescendant` widgets judged by orphan-widget and dead-arrow signals, not by Tab), `lint_intent.mjs` (token **by intent**, measured on the render: a destructive action wearing `action.primary` fails), `verify_overflow.mjs` (silently clipped text and overlapping controls, with screen-reader-only text correctly exempt). `slop_tells.mjs` became a hard gate.
- Each was proven to FAIL on a deliberate violation before it was trusted, and together they found real bugs the previous 25 checks passed: a dead `prefers-reduced-motion` rule lost to CSS specificity, a harness with no motion policy at all, and three composite widgets that declared a roving-tabindex model with zero arrow-key handlers.
- **Responsive is proven against font metrics, not one machine.** `verify_responsive.mjs --scale` renders the same narrow widths under a larger root font: the proxy for another platform's wider fallback font (Linux Chromium measured a label 2px wider than macOS Chrome and broke a 280px layout that looked clean locally) and for a user with larger text. Every example now holds at 280px at 1.25x, and that run is a gate. Root causes worth knowing: an `<input>` keeps an intrinsic ~20-character width that sizes its grid column; a grid item keeps `min-width:auto` and can widen its own track; a `white-space:nowrap` tooltip has no upper bound; a `<table>` without `table-layout:fixed` is sized by its cells' min-content.
- New harness `edge-cases.html` renders what production actually contains: unbroken 60-character strings, empty and single-item collections, missing values, ten-digit counts, forty rows.

**Judgement, where measurement ends**

- **`/critique`** and the `design-critic` subagent. Its stance is adversarial by design: the work is mediocre until the render proves otherwise, **a passing gate is never evidence of taste**, and every finding must cite evidence — a file and line, a measured number, or something specific in a specific screenshot. It refuses to review from source alone, screenshots at 1280 and 390 in light and dark, clicks every control, and returns a verdict plus the three reasons a senior designer would send the work back.
- **The critique was run on the kit's own examples, and it returned `reject`.** What it found is fixed here, not filed: a `data-table` header that declared `aria-sort`, drew a chevron and sorted nothing; a datepicker day drawn as selected that never moved; an Export button styled like a live action with no handler; and an "Email notifications" control that was a `role="switch"` in name only, identical in both states, ignoring the kit's own Toggle spec. The reference app now leads with one hero metric instead of four equal cards, closes with a real footer instead of empty canvas, carries an elevation scale rather than one flat shadow, and every harness gained display type at `--text-4xl` (the doctrine's own 2.5x bar) and a closing note. `taste_audit` and `slop_tells` are now clean on every example, in both themes.
- **Gate 37, `verify_interactive.mjs`, exists because of that critique.** A control that declares `aria-sort` / `aria-pressed` / `aria-expanded` / `aria-checked` / `aria-selected`, or wears a state-bearing role, must change something on a real click - any attribute, any DOM mutation, or focus landing somewhere other than itself. `data-demo-state` opts a deliberate state *rendering* out, and has to be written by hand so the exemption is on the record. It caught the original bug, two more like it, and then an eval fixture written hours after the critique that named the failure mode.
- **`taste_audit` measures a real character now.** Its line-length check assumed `1ch` was half an em and therefore flagged `max-width: 65ch` - the width the kit itself recommends. It measures the element's own font instead.

**Evals: does the kit survive a cold start?**

- **`evals/`** — four cold-start briefs and `node evals/run.mjs <brief-id>`, which points fourteen objective gates at what an agent actually produced and prints the brief's requirements for human judgement. `--self-test` scores the reference app with the same gates and is itself a gate, so the harness cannot rot unnoticed. Building it exposed two real defects the full accuracy gate had missed: the reference app overflowed at 280px, and `verify_overflow` was flagging screen-reader-only text as silently clipped.

**Starting a real product with the kit**

- **`templates/product-design/`** is the recommended Claude Code design-project layout, ready to use: a lean always-on brief, `.claude/{rules,skills,commands,settings.json}`, a WCAG-verified `design-tokens.json` (light + dark), `src/components/`, `public/images/`, `reference/`. Scaffold with **`npx ux-ui-agent-skills new <dir>`** or `/scaffold-project`, and `validate_template.py` keeps it sound (layout complete, aliases resolve, required contrast pairs pass in both themes).
- **Scripts take a path**, so a product repo can gate its own single-file theme: `validate_tokens.py [file|dir]` (with explicit paths an unresolved alias FAILS), `validate_contrast.py [file]`, `build_tokens.mjs --in <file|dir>`. Verified end to end inside a freshly scaffolded repo.
- **Skills declare how they are invoked** — `invocation: user|model` across all 17 `SKILL.md`, regrouped in this README: six user-invoked skills that orchestrate a job, eleven model-invoked ones that are the discipline the agent applies while it works.

### `v2.4.0`
- **Project layout aligned to the recommended Claude Code design-project structure** (Phase A1 of `docs/restructure-plan.md`). Additive only — no knowledge folders moved, no path references changed, `accuracy_report` stays **25/25 = 100%**.
- **`CONTEXT.md` — ubiquitous language.** A shared domain glossary (3-tier tokens, the 8 states, POUR, gate, token-by-intent, anti-slop, RENDER-AND-LOOK) so the agent names the problem precisely and spends fewer tokens doing it.
- **Custom slash commands** under `.claude/commands/` — `/gate` (run the one-command gate, report the real N/N), `/ship` (pre-release gate + README/changelog checklist), `/scaffold-project` (generate a new design-product skeleton in the reference layout).
- **`.claude/settings.json`** — shared permissions (the scripts allowlist), checked into git so the team gates without per-call prompts.
- **`.mcp.json`** — project-scoped Figma MCP connection, secret-free (`${FIGMA_API_KEY}` env expansion).
- **`CLAUDE.local.md`** (gitignored) for personal preferences, and **`reference/`** for real screens the agent studies before an `image-to-code` / `redesign` / `design-review` pass.

### `v2.3.1`
- **Zero emoji, everywhere.** Purged every emoji / decorative pictograph from the entire repo — the agent instruction surface (CLAUDE.md, skills, component / workflow / content / accessibility specs, design-system library), the gate scripts' output, `cover.html`, `docs/`, and the README. Generated output was picking up emoji because the files the model reads were full of them; the instruction surface is now clean, so the model has nothing to imitate.
- **No-emoji rule is now global + absolute** — promoted from a narrow "no emoji as UI icons" note to a top-of-file ABSOLUTE rule covering UI, code, JSON, copy, comments, and commit messages. Replacements are lucide icons or plain words.
- **The gate now guards the instruction surface too.** `scripts/check_no_emoji.py` previously scanned only `examples/` + `taste/`; it now also scans CLAUDE.md, the skills, and the spec directories, so emoji cannot drift back in. `accuracy_report` stays **25/25 = 100%**.

### `v2.3.0`
- **22 component-states harnesses** — full set under `examples/component-states/`, each gated in light + dark: Button, Input, Modal, Tabs, Select/Combobox, Checkbox-Radio-Switch, Toast, Feedback, Navigation, Overlays, Misc, Card, Data Table, Drawer, Date Picker, File Upload, Search/Form-Field, Charts, Tree/Carousel/**Image carousel**/Divider, Command Palette, App Shell (header + sidebar landmarks), Context Menu. `accuracy_report` now **25/25 = 100%**.
- **Charts / data-viz** — Bar, Line+area, Donut, Sparkline, Scatter (`role="img"` + legend), animated on entry (`pathLength` line-draw, `scaleY` bars, staggered points) with `prefers-reduced-motion` parity.
- **lucide icon sprite** — `examples/component-states/icons.js` injects one `<symbol>` sprite; icons are referenced by name `<svg class="ico"><use href="#i-bell"/></svg>` — no per-use path, no network, offline + gate-safe. Every harness icon converted (hand-drawn approximations that rendered as broken glyphs are gone).
- **Responsive gate** — `scripts/verify_responsive.mjs` fails on any horizontal overflow at 280 / 320 / 414 px. Fixed fixed-width / unreset-list-padding / non-wrapping-flex / `minmax` traps across the set.
- **New theme tokens** — motion (`--duration-*`, `--ease-*`, `--transition-micro`), color-blind-aware chart palette (`--color-chart-1..6`), and a dark-aware `--color-surface-brand`.
- **Gate refinements** — `verify_states` holds graphical / icon-only controls to **3:1** (WCAG 1.4.11, not 4.5) and exempts disabled controls; `verify_focustrap` no longer false-passes a `display:none` `position:fixed` dialog (caught a drawer that never closed).
- **Verified patterns** — thin custom checkbox/radio (real `<input>` under a `pointer-events:none` box, check + dash as two `<path>` in one `<svg>`), smooth grid-rows accordion, `auto-fit` (not `auto-fill`) card grids, equal-height panels, mobile sidebar that pushes content down instead of overlapping.
- **`design-component` skill** — added "RENDER AND LOOK — gates don't prove pixels", responsive, motion, layout, icons-by-sprite, and graphical-control rules.


### `v2.2.5`
- **Input + Modal states harnesses** — `examples/component-states/input.html` (default/hover/focus/disabled/read-only/error/loading/filled, each with an associated `<label>`) and `modal.html` (focus trap + Escape + return-focus). Both gated by `verify_states` + `axe` + `measure_render` (+ `verify_focustrap` for the modal), light + dark. Added a verified `--color-text-error` token (light + dark). `accuracy_report` now **18/18 = 100%**.


### `v2.2.4`
- **Component accuracy — verify every state.** A component is "correct" only when every variant × state renders right, not just the resting default. New `examples/component-states/button.html` renders all variants × states (default/hover/focus/disabled/loading/selected) and is gated by `verify_states` + `axe` + `measure_render` (light + dark). `design-component` skill now mandates a states harness + running the gates. Wired into `accuracy_report` (now **16/16 = 100%**).


### `v2.2.3`
- **Focus-trap gate** — `scripts/verify_focustrap.mjs` opens a modal and verifies with a real keyboard that Tab stays trapped, role/`aria-modal`/name are present, and Escape closes + returns focus (WCAG 2.1.2 / 2.4.3). Proven to catch a leaking modal.
- **RTL gate** — `scripts/verify_rtl.mjs` renders LTR vs `dir="rtl"` and flags layout that overflows only when mirrored (the tell of physical left/right instead of logical properties).
- **Token build (real artifact)** — `scripts/build_tokens.mjs` (`npm run build:tokens`) resolves all DTCG aliases (incl. cross-file + dark) and emits a CSS-variable theme (`:root` + `[data-theme="dark"]`). 85 light + 17 dark color vars, fully resolved.
- All three wired into `accuracy_report` (now **15/15 = 100%**) and CI.


### `v2.2.2`
- **axe-core a11y gate** — `scripts/axe_audit.mjs` (`npm run test:axe`) runs axe-core (WCAG 2.0/2.1/2.2 A + AA) against rendered HTML, catching ARIA/role/label/landmark/name issues the contrast + state gates can't. Already caught a real missing-`<label>` bug in an example. Wired into `accuracy_report` (now 12 checks, 100%) and CI.
- CI render job now also runs the state-aware gate + axe across examples.


### `v2.2.1`
- **State-aware WCAG gate** — `scripts/verify_states.mjs` (`npm run test:states`) measures real computed contrast of every interactive element in **default / hover / focus** (light + dark), catching state bugs the resting-state gate missed (e.g. a secondary button picking up the primary fill on hover). Wired into `accuracy_report` (now 11 checks, 100%).
- **Verification Protocol** — new top-of-CLAUDE.md rule: never report a quality number you didn't measure; verify all states; run the gate before declaring done; build *with* the gates. `design-code` step 13 and `a11y-audit` now run the render gates instead of eyeballing.
- Fixed real hover-state AA failures in `examples/apple-demo`; added `examples/brandkit-demo` (generated OKLCH foundation, light+dark, every state AA).


### `v2.2.0`
- **2 new runnable skills (15 → 17)** — `image-to-code` (reference image/screenshot → infer the design system → token-driven, verified code) and `brandkit` (brief → complete primitive→semantic→component DTCG token foundation + theme.css, light + dark, WCAG-verified). Both native, fit the kit's gates.
- **Render-based taste audit** — `scripts/taste_audit.mjs` (`npm run taste`) measures structural slop tells from real computed styles: timid type-scale contrast, uniform repetition, over-wide measure, palette sprawl. Wired into the `design-code` taste pre-flight. Heuristic by design — a strong signal, not proof (taste is subjective).
- De-emoji'd the taste doctrine itself; router rows + skills list updated.


### `v2.1.0`
- **Accuracy report** — `npm run verify` (`scripts/accuracy_report.mjs`) runs every objective correctness gate as one all-or-nothing, reproducible check: token validity + alias resolution, WCAG contrast (token pairs), component-spec completeness, no hardcoded values (golden + sample), theme-ref resolution, no-emoji, and **real headless-Chrome WCAG measurement** (sample-app, light + dark). Prints `N/N = 100%` or the exact failures.
- **Block-level lint exemption** — `scripts/lint_hardcodes.py` supports `ds-allow-hardcode:start` / `:end` for justified illustration blocks (e.g. CSS product art), keeping the rest of the file strictly token-only.


### `v2.0.0` — Enforcement layer (breaking)

> **Breaking:** dark-mode token values changed (link, primary action) and `border.strong` now meets 3:1 — re-verify any snapshots/visual tests. The kit moves from *advisory* guidance to *enforced* gates.

**Theme consistency + real WCAG, enforced (driven by real-world audit feedback):**
- **Single-theme consistency** — every page renders from ONE shared token theme; CLAUDE.md rule + `examples/golden/` (theme.css with full color/type/spacing/breakpoint tokens, Button.tsx, Modal.tsx). `design-code`/`redesign` require consuming the one theme — no per-page palettes.
- **Hardcode linter catches real drift** — `scripts/lint_hardcodes.py` now flags raw hex/px/ms, **raw Tailwind palette utilities** (`bg-gray-500`, `text-blue-600`), and literal `font-family` (the 527-hardcode problem).
- **No floating tokens** — `scripts/validate_theme_refs.py` proves every `var(--…)` a component uses is defined in the theme (precision/consistency gate).
- **Real WCAG gate** — `scripts/validate_contrast.py` checks required text/action/**border** pairs in **light + dark**; fixed genuine dark-mode contrast bugs (link, primary action) and made `border.strong` meet 3:1 for essential control borders.
- **One Modal primitive** — golden `Modal.tsx` + hardened spec: focus trap, `role="dialog"`, `aria-modal`, return-focus on close (fixes the 0/14-focus-trap class of bug, WCAG 2.4.3 + 2.1.2).
- **One CI enforces all of it** — `.github/workflows/ci.yml` runs tokens + contrast + spec + hardcode + theme-ref + `npm test` on every push/PR. Drift, contrast regressions, off-theme colors, and floating tokens cannot merge.
- **5 new runnable skills** (10 → **15**) — `governance`, `token-build`, `figma-integration`, `design-qa`, `performance`; verification steps added to `design-code`/`prototype`/`ux-writing`; router rows for all newer knowledge.
- `validate_component_spec.py` + `lint_taste.py`; fixed `validate_tokens.py` cross-file aliases; atoms Button/Input document all 8 states.

### `v1.2.1`
- **Docs** — added [`docs/WORKFLOW.md`](docs/WORKFLOW.md): end-to-end how-it-works guide (Request Router, on-demand layer loading, real usage scenarios, automated release pipeline) + linked from the README
- **CI** — first release shipped fully automatically by the `release.yml` workflow (GitHub Release notes from this changelog + `npm publish --provenance` on tag push)

### `v1.2.0`
- **8 new component specs** — `data-display.md` (Calendar, Carousel, Tree) + `data-viz.md` (Bar, Line/Area, Pie/Donut, Sparkline, Scatter) → **50 components**; plus `components/icon-system.md`
- **Data-viz tokens** — `tokens/data-viz.json`: color-blind-aware (Okabe–Ito) categorical/sequential/diverging palettes + axis/grid/tooltip → **14 token files**
- ⟨⟩ **6 new framework adapters** — Qwik, Astro, **MUI**, Mantine, Chakra, Bootstrap → **16 adapters**
- **Extended interop crosswalks** — Ant Design 5, Shopify Polaris, GitHub Primer, Atlassian, Bootstrap (color-role tables + per-system notes)
- **Accessibility depth** — `cognitive.md` (load, plain language, dyslexia, reduced-data), `i18n-rtl.md` (logical properties, RTL mirroring, text expansion), `vision.md` (color blindness, low vision, forced-colors), `wcag-aaa.md` (AAA upgrade delta); +4 ARIA patterns (Carousel, Grid, Toolbar, Feed)
- **Ops & pipeline workflows** — `governance.md` (SemVer, contribution, deprecation), `token-build.md` (Style Dictionary / DTCG → multi-platform), `figma-integration.md` (token↔Variable sync, Figma MCP), `design-qa.md` (visual regression + a11y CI), `performance.md` (Core Web Vitals)

### `v1.1.0`
- **npm package** — install into any project with `npx ux-ui-agent-skills init` (zero-dependency CLI: `init` / `add` / `list`, `--force`/`--dry`)
- **Runnable skills** — 10 invocable `/skills` under `.claude/skills/` + real helper scripts (`validate_tokens.py`, `contrast.py`, `design_systems.py`, `scaffold_component.py`)
- **Intelligence layer** — Request Router in `CLAUDE.md`; **Framework Adapter Protocol** (target any framework) with 10 concise adapters; **Design-System Interop Protocol** + crosswalk (map to/from any design system)
- **Native design-taste** — `taste/` (anti-slop doctrine, aesthetic archetypes, motion choreography) + a **library of 138 brand-grade design systems**
- **6 new token categories** — gradients, opacity, blur, sizing, states, theming (multi-brand + density)
- **16 new component specs** — Tabs, Breadcrumb, Pagination, Stepper, Menu, Toast, Banner, Skeleton, Progress, Empty State, Combobox, Select, Slider, Date Picker, File Upload, Popover, Command Palette, Divider
- Removed the externally-bundled taste skills in favor of native, first-party content

### `v1.0.1`
- **Motion tokens** — `tokens/motion.json`: duration scale, easing curves, transition presets, keyframes, reduced-motion strategy
- **UX writing guide** — `content/voice-tone.md`: voice & tone system, error/empty-state formulas, microcopy patterns, inclusive language, pre-ship checklist
- Added `cover.html` repo cover image

### `v1.0.0`
- Initial release — agent persona, 6 token files, 26 components (Atomic Design), WCAG 2.2 + ARIA references, 3 workflow guides, 3 framework guides

---

## License

Released under the **[MIT License](https://opensource.org/licenses/MIT)**.

---

<div align="center">

If this kit helps you, consider giving it a 

</div>
