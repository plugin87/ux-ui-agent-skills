# Contributing

This repo is an instruction layer for an AI agent, plus the gates that keep the
agent honest. Both halves matter: a rule nothing enforces drifts, and a gate that
only ever sees passing examples proves nothing.

## Pull requests are not merged here

Every line in this repository is written by its maintainer, and that is a
deliberate choice rather than an oversight. **Pull requests will not be merged.**
Asking anyone to meet a bar and then declining their work would waste their time,
so the policy is stated here instead of discovered at the end of a review.

What is genuinely wanted, and acted on:

- **A gate gap.** A case where a gate reports green on something that is wrong is
  the most valuable report there is. Open a gate-gap issue with the input and the
  output; the fix gets written here, and you are credited by name in the
  CHANGELOG entry that carries it.
- **A reproduction.** A screen, a token set, or a prompt where the kit produces
  something bad. Show the real output.
- **A proposal.** The idea, the reasoning, and what it would replace.

Credit for a reported idea goes in the CHANGELOG as "Reported by @name". That is
a real contribution and it is recorded as one; what does not happen is someone
else's code landing in the history.

If you want the kit to do something it does not, forking is welcome and the MIT
licence says so.

## The bar, for the maintainer and for anything proposed

```bash
node scripts/accuracy_report.mjs     # 47/47 or it fails - no partial credit
npm run test:gates                   # every gate must still REJECT a broken fixture
```

Both must be green before anything ships. Paste the real output; do not describe
it. If a run is red and you believe the gate is wrong, say so and show the output
anyway - a disputed gate is a conversation, a skipped gate is not.

## Setup

```bash
git clone https://github.com/plugin87/ux-ui-agent-skills.git
cd ux-ui-agent-skills
npm install                 # playwright — needed by 32 of the 47 gates, not dev-only
npx playwright install chrome
npm test                    # browser-free gates
npm run test:unit           # unit + CLI + registry consistency
```

You need Node 20+, Python 3, and real Chrome. Six gates launch
`channel: 'chrome'` on purpose: headless Chromium and Chrome do not always agree
on font metrics, and font metrics are where narrow layouts break.

Optional but useful: copy `.mcp.example.json` to `.mcp.json` if you want the
Figma MCP connection while working on the kit. It is deliberately not shipped.

## The rules that are not negotiable

1. **Zero emoji, anywhere.** Not in UI, code, JSON, copy, comments, or commit
   messages. Use a lucide icon as inline SVG, or plain words.
   `scripts/check_no_emoji.py` scans the product surface *and* the instruction
   files, and it fails the build.
2. **Never state a number you did not measure.** Contrast ratios, "WCAG pass",
   percentages: run the gate and quote it. "Not verified yet" is a complete and
   acceptable answer.
3. **Token by intent.** Destructive actions wear the danger variant in every
   place they appear. A blue Delete is a bug, and `scripts/lint_intent.mjs`
   treats it as one.
4. **One theme, one source of truth.** No hardcoded hex, px, or timing in
   component or page code. The one allowed exception carries an inline
   `ds-allow-hardcode` comment on the offending line, with a reason.
5. **Full files.** A partial output is a broken output. No `// ... rest unchanged`.

## Adding a gate

A gate is only trustworthy if it can still say no, so a new gate ships with the
input that breaks it:

1. The script in `scripts/`, with a docstring saying what it measures and what it
   cannot.
2. A fixture in `tests/fixtures/bad/` built to break exactly that thing, and a
   meta-test in `tests/meta/` asserting the gate exits 1 with the right reason.
   `rejects()` refuses a usage message, a `SKIPPED` line, and an exit 1 whose
   output does not match the signal - so a typo'd path cannot read as a catch.
3. A row in `scripts/accuracy_report.mjs`, and the count in
   `tests/meta/registry.test.mjs` bumped in the same commit. The README, CI and
   the manifests are held to that number automatically.
4. Proof it fails on the broken input and passes on `tests/fixtures/good/`.

Before trusting your own test, break the gate on purpose and watch the suite go
red. An assertion that has never failed has not been tested.

## Adding a component or a skill

Components meet the quality bar in `.claude/rules/components.md`: anatomy,
variants, sizes, the eight states, token mapping, and the ARIA pattern. Then add
a harness under `examples/component-states/` so the render gates can measure it,
and wire it into the router table in `CLAUDE.md`.

Skills live in `.claude/skills/<name>/SKILL.md` with `name`, `description`, and
`invocation`. Keep the description specific enough that the model knows when to
load it, and remember it is also what a plugin user browses.

## Versioning

SemVer, per `workflows/governance.md`:

| Bump | Meaning |
|---|---|
| Major | A renamed or removed token or prop, changed anatomy or default behaviour |
| Minor | A new token, component, variant, skill, or gate - additive |
| Patch | A fix, a contrast correction, docs |

Removing anything public needs a deprecation window of at least one minor cycle,
with the replacement documented.

## Pull requests

- One concern per PR. A gate fix and a new component are two PRs.
- Say what you measured, what you did not, and what you deliberately left open.
  "Still open" written down beats "fixed" implied.
- The commit message carries the reasoning; the diff carries the change.

## Reporting a gate that passed something it should not

That is the most valuable issue this repo can receive. Use the "Gate gap"
template and attach the smallest HTML file that reproduces it. A gate that says
yes to broken work is a worse bug than a gate that is missing.
