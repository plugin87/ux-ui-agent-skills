# UX/UI Agent Skills

> Turn Claude into a **Senior Design Architect** with 15+ years of expertise in design systems, accessibility, and production-ready component engineering.

A comprehensive starter kit of structured instructions and design tokens that transform Claude into a UX/UI expert agent. Drop this into any project to get consistent, accessible, token-driven design outputs every time.

---

## What It Does

| Capability | Description |
|-----------|-------------|
| **Design Token Generation** | Produces DTCG-format JSON tokens (colors, typography, spacing, shadows, borders, breakpoints) with a 3-tier architecture: Primitive > Semantic > Component |
| **Component Design** | Designs components from Atoms to Templates following Atomic Design, with anatomy, variants, states, token mapping, and accessibility specs |
| **Code Generation** | Generates production-ready code for **React + Tailwind v4**, **Next.js 15**, and **SwiftUI 6** |
| **Accessibility Auditing** | Evaluates against WCAG 2.2 AA/AAA with prioritized findings (P0/P1/P2) |
| **Design Review** | Scores designs across 6 dimensions with Nielsen's 10 Heuristics and a structured findings table |
| **Design-to-Code Handoff** | Provides token mapping, 8-state documentation, edge case checklists, and animation specs |
| **Prototyping & Research** | Guides through a 5-level fidelity ladder, user journey mapping, and usability testing scripts |
| **Motion Design** | Tokenized durations, easing curves, transition presets, and reduced-motion strategy for accessible animation |
| **UX Writing** | Voice & tone system with error/empty-state formulas, microcopy patterns, and inclusive language guidelines |

---

## Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/plugin87/ux-ui-agent-skills.git
```

### 2. Copy into your project

```bash
cp -r ux-ui-agent-skills/ your-project/
```

Or use it standalone as a dedicated skill directory for Claude.

### 3. Start using

Open the project in **Claude Code** or any Claude-powered IDE. The `CLAUDE.md` file is automatically loaded, activating the agent persona with full access to all design system files.

**Example prompts:**

```
"Design a notification component with all states and accessibility"
"Review this login page against WCAG 2.2 and Nielsen's heuristics"
"Generate React + Tailwind code for a data table with sorting and pagination"
"Create a color token palette for a fintech brand using blue as the primary"
"Audit this form for accessibility issues — give me a prioritized findings table"
```

---

## Project Structure

```
.
├── CLAUDE.md                  # Agent persona & master instructions
│
├── tokens/                    # Design tokens (DTCG format)
│   ├── colors.json            # 3-tier color system (6 hues x 11 shades + semantic + component + dark mode)
│   ├── typography.json        # Major Third scale, 3 font families, 14 composite text styles
│   ├── spacing.json           # 4px base unit, 21 scale values + semantic aliases
│   ├── shadows.json           # 5-level elevation + inner + colored + focus ring
│   ├── borders.json           # Radius & width scales + semantic component radii
│   ├── breakpoints.json       # Mobile-first breakpoints + containers + grid + z-index
│   └── motion.json            # Durations + easings + transition presets + keyframes + reduced-motion
│
├── content/                   # UX writing & content design
│   └── voice-tone.md          # Voice & tone, error/empty-state copy, microcopy patterns, inclusive language
│
├── components/                # Component specifications (Atomic Design)
│   ├── atoms.md               # Button, Input, Label, Icon, Badge, Avatar, Checkbox, Radio, Toggle, Tooltip
│   ├── molecules.md           # Form Field, Search Bar, Card, Navigation Item, Alert, Dropdown
│   ├── organisms.md           # Header, Sidebar, Form, Data Table, Modal, Drawer
│   └── templates.md           # Dashboard, Auth, Settings, List/Detail layouts
│
├── accessibility/             # WCAG & ARIA references
│   ├── wcag-checklist.md      # WCAG 2.2 checklist (POUR principles, P0/P1/P2 priority)
│   └── aria-patterns.md       # WAI-ARIA patterns for 15+ interactive components
│
├── workflows/                 # Design process guides
│   ├── design-review.md       # Review rubric, Nielsen heuristics, audit process
│   ├── design-to-code.md      # Handoff workflow, state docs, edge cases, definition of done
│   └── prototyping.md         # Fidelity ladder, journey mapping, usability testing scripts
│
├── frameworks/                # Framework-specific implementation patterns
│   ├── react-tailwind.md      # React 19 + Tailwind v4 + TypeScript + cva
│   ├── nextjs.md              # Next.js 15 App Router patterns
│   └── swiftui.md             # SwiftUI 6 + Dynamic Type + platform adaptation
│
└── .agents/skills/            # Bundled design-taste skills (13) — visual judgment layer
    ├── gpt-taste, high-end-visual-design, minimalist-ui, industrial-brutalist-ui
    ├── design-taste-frontend, stitch-design-taste, brandkit
    ├── image-to-code, imagegen-frontend-web, imagegen-frontend-mobile
    └── redesign-existing-projects, full-output-enforcement
```

> **Design-taste skills** are bundled via [`npx skills add Leonxlnx/taste-skill`](https://github.com/Leonxlnx/taste-skill). This kit provides the **system** (tokens, components, accessibility, handoff); the taste skills add **visual judgment** (layout variance, editorial typography, motion). They run with full agent permissions — review before use.

---

## Token Architecture

The design token system follows a **3-tier hierarchy** using the [DTCG](https://design-tokens.github.io/community-group/format/) standard:

```
Component Tokens   button-bg-primary ─────► Semantic Tokens   action.primary ─────► Primitive Tokens   blue.600 = #2563EB
(use in code)                               (use in design)                         (raw palette)
```

- **Primitive** — Raw color/size values. Never referenced directly in components.
- **Semantic** — Purpose-based aliases (`action.primary`, `text.secondary`, `surface.card`).
- **Component** — Scoped to specific components (`button.primary-bg`, `input.border-focus`).

Dark mode works by swapping semantic tokens — primitives stay the same.

---

## Supported Frameworks

| Framework | Version | Key Patterns |
|-----------|---------|-------------|
| **React + Tailwind** | React 19, Tailwind v4 | `forwardRef`, `cva`, `cn()`, CSS custom properties |
| **Next.js** | 15 (App Router) | Server/Client Components, `next/font`, `next/image`, Server Actions |
| **SwiftUI** | 6 (iOS 18+) | `ButtonStyle`, `ViewModifier`, `@ScaledMetric`, Dynamic Type |

---

## Accessibility Standards

All outputs follow **WCAG 2.2 Level AA** as a minimum:

- Color contrast: 4.5:1 (text), 3:1 (UI components)
- Keyboard navigable with visible focus indicators
- Screen reader compatible with proper ARIA roles and live regions
- Touch targets: 24x24px minimum (WCAG 2.5.8)
- Includes 2.2-specific criteria: Focus Not Obscured, Target Size, Accessible Authentication

---

## Design Review Output

When reviewing designs, the agent scores across 6 weighted dimensions:

| Dimension | Weight |
|-----------|--------|
| Visual Hierarchy | 20% |
| Consistency | 20% |
| Accessibility | 20% |
| Usability | 20% |
| Responsiveness | 10% |
| Performance | 10% |

Findings are categorized as **Critical** (must fix) > **Major** (fix this sprint) > **Minor** (when convenient) > **Enhancement** (backlog).

---

## Customization

This is a **starter kit** — customize it for your project:

- **Brand colors**: Edit `tokens/colors.json` primitives, then update semantic references
- **Typography**: Swap font families in `tokens/typography.json` and framework files
- **Components**: Add new components following the existing spec format in `components/`
- **Framework**: Add new framework files in `frameworks/` (e.g., `vue.md`, `flutter.md`)
- **Workflows**: Adapt review rubrics and checklists in `workflows/` to your team's process

---

## Requirements

- [Claude Code](https://claude.com/claude-code) CLI or any Claude-powered IDE
- Claude model with sufficient context (Sonnet, Opus, or Haiku)

No build tools, dependencies, or runtime required — this is a pure instruction/knowledge layer.

---

## License

MIT

---

<p align="center">
  Built with Claude Code
</p>
