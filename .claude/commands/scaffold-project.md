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

The fast path, when the kit is installed or reachable via npx:

```
npx ux-ui-agent-skills new <target>
```

That does steps 2 and 3 below in one call (template copied, `CLAUDE.local.md`
un-suffixed, engine areas installed without overwriting the lean brief). Then pick
up at step 4. The manual steps are spelled out so the same result can be produced
by hand from a clone.

Steps:
1. Ask for the target directory if not given. Create it if it does not exist.
2. Copy every file of `templates/product-design/` into it, preserving the tree.
   Two rules on the copy:
   - `CLAUDE.local.md.template` lands as `CLAUDE.local.md` (the suffix exists
     only so the kit's own gitignore cannot swallow the file).
   - `.gitkeep` stays in `.claude/skills/`, `.claude/commands/`,
     `src/components/`, `public/images/`, and `reference/` so the empty folders
     survive the first commit.
   The template already ships `.gitignore` (which ignores `CLAUDE.local.md`),
   `.mcp.json`, `.claude/settings.json`, and three rules files
   (`components.md`, `tokens.md`, `accessibility.md`).
3. Install the engine next to it so the gates the brief references actually run:

   ```
   npx ux-ui-agent-skills add tokens components taste accessibility \
       workflows content frameworks design-systems scripts skills
   ```

   Use `add`, not `init`: `init` also writes the full engine `CLAUDE.md` over the
   lean project brief. The project brief stays short by design, and the engine
   knowledge loads from the copied folders when a task needs it.
4. Install the render gates' one dependency in the target: `npm i -D playwright`.
   Skipping this is silent: every render gate prints `SKIPPED` and exits 0.
5. Fill in the placeholders in `CLAUDE.md` with the user: product, primary user,
   stack, icon set, vocabulary. Leave nothing in angle brackets behind.
6. Point `design-tokens.json` at the brand: replace the `primitive.brand` ramp,
   keep the semantic and component tiers, then prove it still passes:

   ```
   python3 scripts/validate_contrast.py
   ```

7. Remind the user to fill `reference/` with real screens and `public/images/`
   with real imagery, and to set the MCP env vars (`FIGMA_API_KEY`, ...) in their
   own shell. Never write a secret into `.mcp.json`.

Verify before handing over: the target tree matches the layout above, and

```
python3 scripts/validate_template.py
```

passes against the source template.
