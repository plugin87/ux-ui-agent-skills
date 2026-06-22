---
description: Scaffold a new design-product project that matches the recommended Claude Code layout (the reference structure). Use when starting a fresh product/app that will be built with this design system.
---

Generate a new design-project skeleton from `templates/product-design/` (Track B
of `docs/restructure-plan.md`) into a target directory the user names.

The layout to produce (exactly the reference structure):

```
<target>/
  # CONTEXT CLAUDE LOADS
  CLAUDE.md              the brief Claude reads every session
  CLAUDE.local.md        your personal prefs, gitignored
  .mcp.json              Figma, Notion, Drive connections

  # TEAM TOOLKIT
  .claude/
    rules/               conventions, loaded only when relevant
    skills/              repeatable workflows, off main context
    commands/            your custom slash commands
    settings.json        shared permissions, checked into git

  # YOUR PROJECT
  design-tokens.json     source of truth: color, type, spacing
  src/components/        the real UI Claude reads and edits
  public/images/         real images so prototypes don't break
  reference/             real screens Claude studies for context
```

Steps:
1. Ask for the target directory if not given.
2. Copy `templates/product-design/` into it (create `.gitkeep` in empty folders).
3. Seed `design-tokens.json` from this repo's `tokens/` (a flattened starter, or
   point at the full `tokens/*.json` if the user wants the rich version).
4. Put a short `CLAUDE.md` brief in the target that references this skills package
   and the Decision Framework + Verification Protocol — do NOT copy the full
   36KB engine brief; the project brief stays lean by design.
5. Add `CLAUDE.local.md` to the target's `.gitignore`.
6. Remind the user to fill `reference/` with real screens and `.mcp.json` with
   their own connection tokens (never commit secrets).
