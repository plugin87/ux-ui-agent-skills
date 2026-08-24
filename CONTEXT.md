# CONTEXT — Ubiquitous Language

The shared vocabulary for this design system. Use these exact terms in code,
specs, commits, and conversation. A precise word lets the agent name the problem
correctly and therefore solve it correctly — say the term, not a paragraph.

Rule: if a concept has a term here, use the term. If you invent a new core
concept, add it here in the same line + pointer form.

## Tokens and theming

- **3-tier tokens** — primitive (raw palette, never used directly) then semantic
  (purpose alias, used in design) then component (scoped to a component, used in
  code). Source: `tokens/*.json`, `.claude/rules/tokens-and-color.md` -> "Token System".
- **DTCG** — Design Tokens Community Group format: every token is `$type` +
  `$value`. Source: `tokens/`.
- **token by intent** — pick the token whose *meaning* matches the action, not
  one that merely resolves to the right color. Destructive -> `action.destructive`
  everywhere, never `action.primary`. Source: `CLAUDE.md` -> Non-Negotiables,
  `.claude/rules/tokens-and-color.md` -> "Color Usage Rules".
- **single-theme consistency** — one shared token theme drives every page; no
  per-page palette, no off-theme hex/px/timing. Source: `CLAUDE.md` ->
  Non-Negotiables, `.claude/rules/tokens-and-color.md` -> "Single-Theme
  Consistency".
- **dark-at-semantic** — dark mode swaps at the semantic layer; primitives stay
  fixed. Source: `tokens/colors.json` -> `dark`.

## States and components

- **the 8 states** — Default, Hover, Focus, Active, Disabled, Loading, Error,
  Selected. Interactive components define all that apply. Source: `CLAUDE.md` ->
  Non-Negotiables, `.claude/rules/components.md` -> "State Requirements",
  `tokens/states.json`.
- **component quality bar** — anatomy, variants, sizes, the 8 states, token
  mapping, accessibility. Source: `.claude/rules/components.md` -> "Component
  Quality Bar".
- **atomic design** — Atoms -> Molecules -> Organisms -> Templates -> Pages.
  Source: `components/`.

## Accessibility

- **POUR** — Perceivable, Operable, Understandable, Robust. The accessibility
  test for every decision. Source: `accessibility/wcag-checklist.md`.
- **target size** — 24x24px minimum (WCAG 2.5.8), 44x44px for primary actions.
- **focus ring** — visible focus indicator at 3:1 contrast via
  `shadow.focus-ring`. Source: `tokens/shadows.json`.
- **no color-only** — never convey information by color alone; pair with icon,
  text, or pattern.

## Quality and verification

- **gate** — a runnable check that produces a real pass/fail number. Never state
  a quality number you did not get from a gate. Source: `scripts/`, `CLAUDE.md` ->
  "Verification Protocol".
- **the one-command gate** — `node scripts/accuracy_report.mjs`: tokens +
  contrast + spec + no-hardcode + theme-refs + no-emoji + real-render WCAG +
  state-aware, light and dark. All-or-nothing N/N.
- **RENDER-AND-LOOK** — gates do not prove pixels; screenshot the harness, park
  the pointer off it, inspect every state, and click each control to assert the
  state actually changed. Source: `design-component` skill.
- **build with the gates** — generate against the rules, then gate, fix, re-run
  until green; do not announce success between failures.

## Taste

- **anti-slop doctrine** — every output must beat the statistical defaults that
  make UI look machine-generated. Source: `taste/design-taste.md`.
- **variance mandate** — deliberate variation over uniform repetition; uniformity
  is a slop tell. Source: `taste/design-taste.md`.
- **taste serves tier 4** — aesthetics is the lowest of the five priorities and
  never overrides User Needs, Accessibility, or Consistency. Source: `CLAUDE.md`
  -> "Decision Framework".
- **emoji ban** — zero emoji in any output (UI, code, JSON, copy, comments,
  commits). Use a lucide icon or plain words. Enforced by
  `scripts/check_no_emoji.py`.

## Harness

- **harness** — the Claude Code runtime: tools, permission modes, hooks,
  system-reminders. Source: `CLAUDE.md` -> "Harness".
- **Request Router** — the table mapping a request to the files + skill to load,
  so depth loads only when relevant. Source: `CLAUDE.md` -> "Request Router".
