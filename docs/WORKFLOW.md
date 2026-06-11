# How It Works — End-to-End Workflow

This document explains how the kit operates from both sides: the **consumer** (a designer/developer who installs it into a project and uses it through Claude) and the **maintainer** (who edits the knowledge files and ships releases).

> TL;DR — **Easy to use, smart on the inside, automated on release.** There is no runtime, no build step, and no dependency. The kit is a pure knowledge + instruction layer that Claude loads on demand.

---

## 1. What it actually is

This is **not a library you import or build** — it's a "brain" you plug into Claude (knowledge files + an instruction router). Once installed in a project, Claude in that project behaves like a Senior Design Architect: it answers design-system questions with real principles — design tokens, accessibility, and taste — and generates production-ready output.

```
A normal UI library          This kit
─────────────────────        ─────────────────────────────
import { Button }             you talk to Claude / run /skills
npm build                     no build, no runtime
ships JS/CSS to the browser   ships KNOWLEDGE to the model
```

---

## 2. Consumer workflow (real usage)

```
┌─ Install once ─────────────────────────────────────────┐
│  npx ux-ui-agent-skills init                            │
│  → copies the knowledge files + .claude/skills/ in      │
└────────────────────────────────────────────────────────┘
                          │
                          ▼
        You talk to Claude normally, or invoke a /skill
                          │
          ┌───────────────┴───────────────┐
          ▼                               ▼
  "build me a Button in React"     /design-tokens "make a purple palette"
          │                               │
          ▼                               ▼
┌─────────────────────────────────────────────────────────┐
│  Claude reads CLAUDE.md → the "Request Router"          │
│  matches your intent → knows exactly which files to load │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Loads only the relevant LAYERS and composes them:      │
│   tokens/  +  components/  +  accessibility/  +  taste/   │
│   +  frameworks/adapters/ (when you ask for a framework) │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
   Output: code / spec / review that is token-driven and
   accessible by default (no hardcoded colors, all 8 states,
   dark-mode aware, ARIA wired).
```

### The Request Router is the core

Claude does **not** read every file on every request (that would waste context). Instead, `CLAUDE.md` contains a routing table — Claude reads it and pulls only what the task needs:

| You ask for… | Claude loads |
|--------------|--------------|
| Generate / edit tokens | `tokens/*.json` + `scripts/validate_tokens.py` |
| A component spec | `components/*` + `accessibility/aria-patterns.md` |
| Code in any framework | `frameworks/adapter-protocol.md` → the matching adapter |
| A design review / audit | `workflows/design-review.md` + `taste/` |
| An accessibility check | `accessibility/*` + `scripts/contrast.py` |
| A specific look / vibe | `taste/` + one of 138 design systems |

This is what makes the kit feel "intelligent" — it self-routes instead of dumping a flat file list into context.

---

## 3. Three real scenarios

**A. A developer wants code**
```
You:    /design-code build a Card component in Vue
Claude: → router points to frameworks/adapters/vue.md + components/molecules.md
        → returns a .vue file using CSS-variable tokens, with
          hover/focus/disabled states and dark mode.
```

**B. A designer wants a specific look**
```
You:    /apply-aesthetic make it feel like Linear
Claude: → loads design-systems/library/linear-app + taste/
        → remaps tokens (color/shadow/radius/font), then re-checks contrast.
```

**C. QA before shipping**
```
You:    /a11y-audit does this screen pass WCAG?
Claude: → accessibility/wcag-checklist.md + runs scripts/contrast.py
        → returns a table: criterion + severity + exact fix.
```

The ten runnable skills: `design-tokens`, `design-component`, `design-code`, `design-review`, `a11y-audit`, `apply-aesthetic`, `redesign`, `migrate-design-system`, `prototype`, `ux-writing`.

---

## 4. Is it complex or hard to use?

| Perspective | Difficulty | Why |
|-------------|------------|-----|
| **Consumer (designer/dev)** | (on) Very easy | Just talk in plain language or type `/skill`. No config, no build, no API to memorize. The complexity is hidden inside the knowledge files. |
| **Install** | (on) One command | `npx ux-ui-agent-skills init` and you're done. |
| **Maintainer (releasing)** | (on) Easy now | A release is two commands (see §5). |
| **Contributor (adding a component/adapter)** | (partial) Moderate | Must follow the house style and wire the file into `CLAUDE.md`. `workflows/governance.md` is the guide. |

**Bottom line:** the intelligence lives in the files, so the hard part is *authoring the kit* (already done), not *using it*. Consumers have almost nothing to learn.

---

## 5. Maintainer workflow (the release pipeline)

```
Edit knowledge files → commit
        │
        ▼
  npm version patch                  ← bumps package.json + creates a git tag
  git push origin main --follow-tags ← pushes code + tag
        │
        ▼  (tag vX.Y.Z lands on GitHub)
┌──────────────────────────────────────────────┐
│  GitHub Action: .github/workflows/release.yml │
│   job 1 "release"  → creates a GitHub Release  │
│                      (notes pulled from the    │
│                       README changelog block)  │
│   job 2 "publish"  → guards tag == pkg version │
│                      → npm publish --provenance │
│                        (uses the NPM_TOKEN      │
│                         repo secret)            │
└──────────────────────────────────────────────┘
        │
        ▼
  GitHub Release is live   +   npm is updated   — automatically.
```

### Setup (one-time, already done)
- **Repo secret `NPM_TOKEN`** = an npm **Automation token** (bypasses 2FA so CI can publish).
- The workflow also supports **manual backfill**: Actions → *Release on tag* → *Run workflow* → enter an existing tag (this creates the Release only; it does **not** re-publish to npm).

### Day-to-day releasing
```bash
npm version patch          # or minor / major
git push origin main --follow-tags
```
That's the entire release. CI creates the GitHub Release and publishes to npm — no manual `gh` or `npm login`, no 2FA prompts.

> Before this pipeline existed, each of these steps was manual (npm login, 2FA, hand-writing release notes, creating the Release page). Now it's two commands.

---

## 6. Mental model

```
        CONSUMER SIDE                         MAINTAINER SIDE
   (uses Claude in a project)            (edits this repo, ships versions)

   talk / /skill  ─┐                      edit files ─┐
                   │                                  │
        CLAUDE.md (Request Router)            npm version + git push
                   │                                  │
        loads layers on demand                GitHub Action
                   │                                  │
   token-driven, a11y, on-brand          Release page + npm publish
        output                                  (automatic)
```

Easy at the edges, smart in the middle.
