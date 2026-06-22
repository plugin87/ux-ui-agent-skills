# Restructure Plan — `ux-ui-skills`

Target: reshape the project toward the recommended Claude Code design-project
layout (reference image) while folding in the efficiency disciplines from
`mattpocock/skills`. Status: PLAN ONLY — not yet implemented. Approved direction:
Hybrid (2 tracks).

---

## The core tension

The reference image describes a **design product** layout (a project that *uses*
Claude to build real UI). This repo is a **knowledge / skill package** (the thing
that gets installed). They overlap only in the `.claude/` + `CLAUDE.md` region.

Hard constraint that shapes the whole plan:

- `CLAUDE.md` is 556 lines (~36KB), always-on every session.
- It references knowledge-folder paths (`components/`, `tokens/`,
  `accessibility/`, ...) in ~107 places.
- A literal 1:1 move of those folders into `.claude/rules/` would break all 107
  references plus every skill and script, and risk the published package.

Decision: do NOT move folders 1:1. Adopt the spirit in this repo (Track A) and
ship the literal reference layout where it actually belongs — a downstream
project starter (Track B).

---

## Reference layout to repo mapping

| Reference | Repo today | Action | Value / Risk |
|---|---|---|---|
| `CLAUDE.md` (session brief) | `CLAUDE.md` 36KB always-on | Slim to router + principles | High / Low |
| `CLAUDE.local.md` (prefs, gitignored) | none | Add + gitignore | Med / Low |
| `.mcp.json` (Figma/Notion/Drive) | none | Add (template form) | Med / Low |
| `.claude/rules/` (load when relevant) | top-level knowledge folders | Already rules by behavior (Router loads on demand) | — |
| `.claude/skills/` | 17 skills | Add user/model invocation split | Med / Low |
| `.claude/commands/` | none | Add slash commands | High / Low |
| `.claude/settings.json` | none (only skills/) | Add shared permissions | Med / Low |
| `design-tokens.json` (source of truth) | `tokens/*.json` | Already present and richer | — |
| `src/components/` (real UI) | `components/*.md` are specs; real code in `examples/` | Real code lives in `examples/` | — |
| `public/images/` | none | Add if prototyping | Low |
| `reference/` (real screens) | none | Add | Med / Low |

---

## Efficiency layer from `mattpocock/skills`

Matt Pocock targets four failure modes. This repo already nails the feedback-loop
one (the gates). The three missing wins:

1. **`CONTEXT.md` = ubiquitous language** (highest-value gap). A glossary of the
   project's domain terms lets the agent say "20 words where 1 will do" — cuts
   tokens and makes naming/navigation consistent. Directly attacks Verbosity.
2. **Slim `CLAUDE.md` = keep off main context.** 36KB always-on is a per-session
   tax. Push detail into rules/skills that load on demand. The Request Router
   already supports this.
3. **Split skills user-invoked vs model-invoked.** User-invoked orchestrate
   (`/redesign`, `/brandkit`); model-invoked are disciplines the agent reaches for
   (`design-tokens`, `a11y-audit`). Makes the skill index legible and correctly
   routed.
4. **Feedback loop = gates** (already present via `accuracy_report.mjs`) — wire it
   as a formal `/gate` command.

---

## Intelligence bar — the skill must be genius-tier at UX/UI

Restructuring is the means, not the goal. The goal is a skill that reasons about
UX/UI like a senior design architect — so the layout changes must each raise
intelligence, never just relocate files. Every phase is judged against this bar:

1. **Right knowledge, right moment.** Slimming `CLAUDE.md` and loading rules on
   demand is not only token thrift — it lets the agent hold the *relevant* depth
   for the task instead of a flat 36KB wall. Sharper recall, sharper decisions.
2. **Shared vocabulary = sharper reasoning.** `CONTEXT.md` is not glossary
   decoration; a precise domain language (the 8 states, token-by-intent, POUR,
   anti-slop) is what lets the agent name the problem correctly and therefore
   solve it correctly. Verbosity down, precision up.
3. **Taste is enforced, not asserted.** Genius UX/UI means beating the
   statistical defaults (the anti-slop doctrine) AND proving it: the gates stay
   always-on so "looks premium" is backed by real contrast, state, responsive,
   and render checks — never a claim.
4. **Disciplines the agent reaches for unprompted.** The model-invoked skills
   (a11y-audit, design-qa, design-tokens...) must trigger themselves at the right
   time, the way an expert instinctively checks contrast before shipping. The
   user/model split exists to make that reflex reliable.
5. **Decision hierarchy is non-negotiable.** User Needs > Accessibility >
   Consistency > Aesthetics > DX. Taste serves tier 4 only and never overrides
   POUR. This ordering is what separates expert judgment from pretty output.

Acceptance for the whole restructure: a cold-start agent, given only this layout,
produces work that passes every gate AND survives a senior design critique — not
one or the other.

## Track A — reshape this repo toward the spirit (no path breakage)

### Phase A1 — add the missing pieces (lowest risk, do first)

| New file | Contents | Inspired by |
|---|---|---|
| `CONTEXT.md` | Ubiquitous-language glossary: `3-tier tokens`, `the 8 states`, `POUR`, `gate`, `anti-slop / variance mandate`, `token by intent`, `RENDER-AND-LOOK`, `harness`. One line each + source-file pointer | mattpocock CONTEXT.md |
| `.claude/commands/gate.md` | Run `node scripts/accuracy_report.mjs`, report the real N/N line | feedback loop |
| `.claude/commands/ship.md` | gate then verify_responsive then (if green) release checklist per release-readme-rule | |
| `.claude/commands/scaffold-project.md` | Generate the Track B template into a target folder | |
| `.claude/settings.json` | Shared permissions: allow `node scripts/*`, `python3 scripts/*`; committed to git | "shared permissions, checked into git" |
| `.mcp.json` | Figma (plus Notion/Drive if used), in template/placeholder form — tokens are per-machine | "Figma, Notion, Drive connections" |
| `CLAUDE.local.md` | Sample personal prefs; add to `.gitignore` | "gitignored" |
| `reference/` | Folder + `README.md` explaining: drop real screens/screenshots here for the agent to study | "real screens Claude studies" |

### Phase A2 — slim `CLAUDE.md` (highest value: keep-off-main-context)

- Keep always-on in `CLAUDE.md`: persona, Decision Framework, Verification
  Protocol + emoji ban, Request Router table, File Reference Map.
- Move long detail to on-demand files (either thin `.claude/rules/*.md` OR leave
  in the existing knowledge folders and let the Router point at them — leaving
  them is zero path-break): Token System detail, Color / Typography / Spacing /
  Component guidelines, Accessibility standards, Framework output formats.
- Target: CLAUDE.md down to ~150-200 lines; detail loads when a skill is invoked.
- Risk guard: critical rules (emoji ban, the gate protocol) MUST stay always-on
  in CLAUDE.md — never demote them.

### Phase A3 — split skills user-invoked vs model-invoked

- Add frontmatter `invocation: user` / `invocation: model` to the 17 SKILL.md.
- Group them in README:
  - User-invoked (orchestrate): redesign, brandkit, image-to-code, prototype,
    migrate-design-system, governance.
  - Model-invoked (discipline): design-tokens, design-component, design-code,
    a11y-audit, apply-aesthetic, design-qa, design-review, ux-writing,
    token-build, figma-integration, performance.
- Optional Phase A4: add `.claude/rules/` as thin pointer files into the existing
  knowledge folders — gets the reference name without moving anything real.

---

## Track B — starter template that matches the image exactly

Create `templates/product-design/` with the literal reference layout. The three
group labels below (CONTEXT CLAUDE LOADS / TEAM TOOLKIT / YOUR PROJECT) are
conceptual headers from the reference image, carried into the template README and
as comments — not folders. Annotations are reproduced verbatim from the image.

```
product-design/

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
  public/images/         real images so prototypes don't break  (.gitkeep)
  reference/             real screens Claude studies for context (.gitkeep)
```

Match check: every file and the ordering equal the reference image. `.gitkeep` is
added only so the two empty folders can be committed; it does not alter the shape.

- Wired to `/scaffold-project` (from Phase A1) to generate into a new project.
- Add a README section: "How to start a new design project."

---

## Order of work and verification

1. A1 (add files — safe)
2. B (template — separate folder, does not touch the engine)
3. A3 (frontmatter)
4. A2 (slim CLAUDE.md — riskiest, do last)

Every phase closes with the existing gates and must be green before it counts as
done:

- `node scripts/accuracy_report.mjs` (reports the real N/N)
- `python3 scripts/check_no_emoji.py` (CLAUDE.md and skills are already in scope)

No rewrite of the 107 path references; the published package stays intact.

---

## Why not the literal 1:1 move

Cost: rewrite 107 path refs + every skill + scripts + CI; risk breaking a
published package; payoff is a rename that downstream users never see. Track B
delivers the exact reference layout in the place where it has meaning (the user's
own project), without touching the engine.
