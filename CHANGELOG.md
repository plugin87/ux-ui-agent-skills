# Changelog

Every release of [ux-ui-agent-skills](https://github.com/plugin87/ux-ui-agent-skills),
newest first. Versioning follows SemVer as defined in `workflows/governance.md`:
major renames or removes something public, minor is additive, patch is a fix.

The release workflow reads the section matching the tag out of this file and
uses it as the GitHub Release notes, so a release with no section here ships
with auto-generated notes instead.

---

### `v2.9.2`

Same kit as `v2.9.1`, which never reached the registry.

The `v2.9.1` tag published nothing: npm answered `E404` on the `PUT`, which reads
like "package not found" and means "that credential was rejected" - npm returns
404 rather than 401 so nobody can probe which private packages exist. The cause
was in the workflow log, `NODE_AUTH_TOKEN: XXXXX-XXXXX-XXXXX-XXXXX`:
`setup-node`'s `registry-url` writes an `.npmrc` containing
`_authToken=${NODE_AUTH_TOKEN}`, and with no secret set that expands to the
literal placeholder. npm finds a credential, uses it, and never mints an OIDC
one. A half-configured token is worse than none.

`registry-url` is gone and the job clears any auth line before publishing. This
release is cut from a tree that matches its tag exactly, rather than publishing
`2.9.1` from a later commit and leaving the tag and the tarball disagreeing.

---

### `v2.9.1`

Release plumbing only; the kit is unchanged from `v2.9.0`.

**npm publishes itself.** The publish job wanted an `NPM_TOKEN` repo secret that
was never set, which is the one thing that has ever failed on `main`: the
`v2.9.0` tag created its GitHub Release and stopped at the registry. It uses npm
Trusted Publishing now - GitHub mints a short-lived OIDC credential scoped to
this one workflow and npm trusts it because the package says to. Nothing to
create, rotate or leak, and no 2FA prompt, which is what made a scripted publish
impossible before.

`v2.9.0` went to the registry by hand, because its own tree still carried the
token-based workflow and could not publish itself. This release is the first one
the automation publishes.

**`main` stays one commit per change.** Squash is the only merge route, the
squash subject is the pull request title and the body is its description, and
merged branches delete themselves. `docs/BRANCHING.md` covers the half that
settings cannot enforce.

**The kit works without Claude Code.** `AGENTS.md` is an open convention read by
Codex, Cursor, Copilot, Jules, Aider, VS Code and about twenty more.
`npx ux-ui-agent-skills init --agent codex` installs it with the whole kit and
all 51 gates; `--agent both` installs both surfaces. The gates were always plain
Node and Python - only the instructions were Claude-specific.

Proven by running Codex CLI against a project installed that way, which found two
real defects in the first draft: the two house rules were present but unlabelled
and it named two different rules, and the file sent it at `accuracy_report.mjs`,
the kit's own self-test, where it scored 17/50 in a project that number says
nothing about. Both fixed, both held by `validate_agents_surface.py`. On the
re-run it reported a gate's `SKIPPED ... This measured NOTHING - not a pass`
verbatim rather than calling it a pass.

Honest about the loss: the three rules Claude Code enforces with hooks are
requests on that surface. The README says so in a table rather than implying
parity.

**Every render gate refuses a missing path.** Thirteen of fifteen took their
arguments straight to the browser; a path that did not exist threw inside
Playwright and exited 1 on macOS and **0 on Linux**, so a typo in a filename read
as a clean pass on CI. `scripts/_targets.mjs` checks first, in one place, and
exits 2 - "I could not look", which is not the same as "I looked and found
nothing".

**Five public numbers were wrong** and all five shared a cause: nothing read
them. 19 runnable skills against 25, 50 components against 52, 48 gates against
50, and `bin/cli.js` claiming 13 token files and 42 component specs against 14
and 52. The counts are derived from the folders now and held by
`tests/meta/registry.test.mjs`.

The objective gate goes from 50 to **51**.

---

### `v2.9.0`

**The kit now reaches the agent on every install route, and three rules fire
without being asked.** The objective gate goes from 42 to **50**.

**Every path resolved against the wrong directory.** The 19 skills, 5 commands
and the critic named 156 kit files between them, all as bare repo-root paths. On
the plugin route - the one the README recommends first - every one of them
resolved against the user's own project, where the kit is not. No error; the
model simply proceeded without the file. They are built from
`${CLAUDE_SKILL_DIR}` now, verified on both routes with a throwaway probe skill
before anything was changed: plugin 0% to 100%, init 79.5% to 100%.

`npx skills add` copies the skill folders alone, so the kit is genuinely absent
there. Every skill that reads a kit file now checks and says so, instead of
working from files it never opened.

**`invocation: user` never did anything.** Claude Code does not read that key and
ignores unknown frontmatter without an error, so the six skills marked user-only
had been auto-invocable the whole time. They carry `disable-model-invocation`
now, and the skill listing dropped from 24 entries to 13.

**`design-screen`** claims the most common request there is - "design a page,
screen, landing page or app" - which no skill previously did, in English and
Thai. It runs the pipeline no single skill covered: taste preflight, doctrine,
direction into tokens, build, gate, render-and-look, critic.

**Receipts and hooks.** `scripts/gate.mjs` records what each gate measured, with
the file's hash at the time: edit the file and the receipt expires, which is
exactly when a remembered number stops being true. Three hooks ship on both
routes - a session preflight that says whether the render gates can run at all, a
PostToolUse fast-gate set, and a Stop hook that refuses to finish a session that
edited UI and measured none of it.

**Three house rules, each with a gate and a broken fixture.** No native
`<select>`, which the kit's own docs had recommended and four examples used. No
colored border on one side only, widened from the left-only ban and measured on
the render. And mobile-first, where the doctrine already claimed what the
examples contradicted: 90 `max-width` queries against 9 `min-width`, and ten
pages whose base layer could not fit a phone once the queries came off.

**The React source is rendered and gated**, not just read as text. It found four
defects, the worst being that `examples/golden/Button.tsx` had not compiled for
months - its CSS sat in a block comment containing a nested comment - and nobody
noticed because nothing ever built it.

Fixes along the way: the critic was never in the npm package at all, `init` never
installed `examples/`, `templates/` or the agent, `bin/cli.js` claimed 10 skills
with 19 installed, and the plugin manifests advertised 41 gates while the
registry held 44 and the GitHub description said 43. All held by a test now.

`engines` moves to Node 20, matching CI. Pull requests are no longer accepted;
gate gaps, reproductions and proposals are, and are credited in the changelog.

---

### `v2.8.0`

**From 23 component harnesses to twenty whole product screens.** The demo could
show the parts worked and showed nobody what the kit actually builds. This
release is the answer to that, and it takes the objective gate from 38 to **42**.

**Atlas** (`examples/showcase/`) is a revenue console: a hero figure at 3x the
body size leading the page, a weekly bar chart, NRR and churn beside it, then
three deliberately different shapes - a donut, a ranked bar list, regional
sparklines - rather than three identical cards. Range tabs move the numbers and
the table headers really sort.

**Meridian Terminal** (`examples/terminal/`) is the density test: **ten chart
types on one screen** - candlesticks with volume and a moving average, an order
book with depth bars, a cumulative depth curve, time and sales, sparklines, a
stacked area, a P and L waterfall with connectors, a risk-return bubble chart, a
correlation matrix and a radial gauge. Every one is inline SVG drawn from
`--color-chart-*`; there is no chart library anywhere in the repo, and the
geometry is generated by a seeded walk rather than hand-placed.

**`examples/templates/` holds twenty industry screens.** A checkout, a sales
pipeline, a patient chart, retail banking, freight control, satellite mission
control, a distributed-tracing span waterfall, an audio workstation, an
air-traffic radar scope, a power-grid topology, a genomics lollipop plot, a
video editor, a security operations centre, a warehouse aisle heatmap, a
manufacturing line, ride dispatch, a **Marey train graph** where every crossing
is a real meet, a clinical trial readout on the light shell with
**Kaplan-Meier** curves and a **forest plot**, a fine-tuning run with a
**confusion matrix**, and a meteorology desk with a 28-member ensemble and real
**WMO wind barbs**. Two shared stylesheets came out of it: `_console.css` for
the dark operator consoles, `shell.css` for the light business screens.

**New skill: `/data-dashboard`** - the recipe for this class of screen. The
layout sequence that avoids the equal-card wall, fourteen chart geometries, the
accessibility contract per chart type, and every trap below with its measured
number.

**The gates found these:**

- A chart colour behind 12px white initials measured **2.65:1** in dark. A chart
  palette is tuned for large filled shapes, not text.
- Success green as chip text on a raised surface: **4.43:1**, four hundredths
  short of AA.
- Dense tables overflowing 280px at a 1.25x root font, a sidebar scroller
  widening the page because a grid item defaults to min-content, and two screens
  with no display type at all.

**These passed every gate and were still wrong, which is the argument for
rendering the thing and looking at it:**

- A **stacked area with dark wedges** between bands - the reversed baseline was
  indexed by position instead of by coordinate.
- A **correlation matrix that was not symmetric**, with a diagonal that was not
  1. An instant tell to anyone who reads one for a living.
- A **waterfall with no connectors**, so it read as floating bars.
- A training **loss curve that climbed**, because SVG y grows downward and the
  high loss has to map to y=0.
- Wind barbs **clipped and a quarter-turn off**: a barb rotates about its origin,
  so the viewBox must clear shaft plus pennant in every direction, and it points
  *into* the wind.
- A forest plot whose **null line and its own 1.0 tick were in different
  places**, because the axis strip and the plot strip had different widths.
- Two sets of bars **collapsed to flat lines** - a percentage `block-size`
  against an auto-height parent resolves to nothing.
- Kaplan-Meier **censoring ticks sharing an x with the event steps**, which made
  them indistinguishable from the curve's own verticals.
- A grid row **stretches its items**, so a short panel ends in a bordered void
  and two form controls in a row end up different heights. Both shells gain a
  `.fill` / `.spread` pair, and the rule is in `.claude/rules/components.md`.

**Gate and tooling changes:**

- **`axe_audit.mjs` was racing the page.** It flipped `data-theme` and ran axe
  immediately, sampling colours mid-transition. The sample app failed roughly
  one run in six. A flaky gate is worse than a missing one: it teaches everyone
  to re-run until green.
- **`verify_keyboard` did not understand native radio groups** - one radio is
  the tab stop and arrows move between them - and counted the others unreachable.
- **`verify_overflow` read a wrapped inline link as a 100% overlap**, because an
  inline element that breaks across lines has a bounding box spanning them all.
- **`verify_focustrap` refused a native `<dialog>` twice over**: it only matched
  `[role="dialog"]`, then read the one frame where a native modal parks focus on
  `<body>` as a leak. The leaky fixture still fails, so the gate did not get
  softer.
- **`lint_hardcodes` now also scans `examples/templates/`** - it only ever
  pointed at `examples/golden` and `examples/sample-app`, so the twenty
  templates were never checked. That is gate 42.
- `lint_hardcodes` stopped reporting two false positives: px and ms outside CSS
  scope (a wait time in a table cell is content), and values inside a multi-line
  CSS comment (prose about a bug is not the bug). Every `ds-allow-hardcode`
  marker is still read off the raw line, because an exception is itself a comment.

**Removed:** `examples/index-classic.html`, the previous front door. Nothing
gated it, so it had drifted to claiming "40 objective gates", "forty objective"
and "41 checks" on one page while linking five of the twenty templates.

The live demo is now **50 rendered pages**, and every public count - 42 checks,
19 skills, 138 design systems, 23 harnesses, 16 adapters, 20 templates - was
re-derived by counting rather than quoted from memory.

---


### `v2.7.1`

**The published package carried two files that were never in the repo.**
`scripts/__pycache__/contrast.cpython-312.pyc` and its sibling shipped in 2.7.0:
`.gitignore` keeps compiled Python bytecode out of git, and npm does not read
`.gitignore` when `files` is present - `files` is an allowlist of paths, and
everything sitting under an allowed directory travels with it, including
whatever the working tree happens to be carrying. Publishing the same commit
from a different machine would have produced a different tarball, silently.

- `files` now ends with `!**/__pycache__/**`, `!**/*.pyc`, `!**/.DS_Store`. The
  negations have to come **last** in the array; placed first, npm ignored them
  and the pyc files still packed - checked, not assumed.
- `tests/unit/package-contents.test.mjs` asserts the published set from
  `npm pack --dry-run --json`, the same command the registry sees: no bytecode,
  no `.DS_Store`, no `node_modules`, no nested tarballs, no README screenshots;
  every file a consumer needs present by name; and a file count inside a sane
  band so anything binary creeping in fails the build.

327 files to 325. Nothing else changed.

### `v2.7.0`

The release that stopped asking people to take its word for it. A design kit with
no images, no live demo, and no way to see the output before installing was
asking readers to trust a claim. Now they can look, and what they look at is the
same HTML the gates measure.

**You can see it now**

- **[Live demo](https://plugin87.github.io/ux-ui-agent-skills/)** - `examples/`
  is published to GitHub Pages: the reference app, 23 component harnesses, two
  aesthetic demos, a theme toggle. No build step, so what a visitor clicks is the
  file `accuracy_report.mjs` measured. The workflow refuses to deploy if any
  relative link on the index has no file behind it.
- **`npx ux-ui-agent-skills demo`** copies the rendered examples to a throwaway
  folder and opens them. Nothing is installed. `--no-open` and `--dry` for CI and
  the cautious.
- **Screenshots in the README**, generated by `scripts/screenshot_docs.mjs` from
  the real files with a fixed viewport, reduced motion and the pointer parked off
  the UI. `--check` runs in CI and holds the set together: nothing missing,
  nothing orphaned. It deliberately does not diff pixels - a PNG diff across
  Chrome versions is noise, not signal.
- **A before and after**, with the gate output printed under it. The left-hand
  page is a real file, `tests/fixtures/bad/slop-screen.html`, built line by line
  from the banned-defaults table in `taste/design-taste.md`: eight gates, nine
  findings, none of them a matter of taste. Every number in that table is pinned
  by `tests/meta/browser-gates.test.mjs`.
- **The blind runs moved above the fold.** Two agents that had never seen the kit
  scored 14/14, the same runs cost the kit seven defects that four familiar runs
  missed, and `/critique` then returned **rework** on output that passed every
  gate. The fixtures stay unedited in `evals/out/`; patching them would be editing
  the experiment.

**Gate 38, and a gate that was looking away**

- `examples/index.html`, the most public page in the repo, was the one page no
  gate touched. It is now check 38: render, states, axe, keyboard, target size,
  interactive, reduced motion, and 280px at a 1.25x root font, both themes.
- **`lint_intent` passed a blue Delete Account.** It resolved "primary" and
  "danger" from the page's own CSS variables and skipped any page that had
  neither, reporting "0 intent-bearing controls" and exiting 0 - green meaning
  "did not look". An untokenised page is exactly where intent gets chosen by
  convenience, so a destructive label filled with a saturated colour outside the
  danger hue range is now wrong-intent with or without a theme. Themed pages keep
  the identical token-distance logic; no verdict of theirs changed.
- **The kit no longer ships a third-party MCP server.** Installing the plugin
  locally and running `claude plugin details` reported `MCP servers (1) figma` -
  the repo's own `.mcp.json` was being picked up for everyone who installed it,
  running `npx -y figma-developer-mcp` on their machine. It ships as
  `.mcp.example.json` now. Re-tested from a local marketplace: `MCP servers (0)`.

**Honest scope, and numbers that cannot drift**

- "38 objective gates" now says what it covers: **28 of the 38 open a real
  browser** and measure rendered HTML, the other 10 read files, and framework
  source is reached by the file-reading checks only. A React component this kit
  generates is written to the rules but is **not** proven by that number until
  something renders it. The first draft of that sentence said "thirty-four" from
  memory; counting the array said 28, and it was corrected before it shipped.
- The `N/N` in the README's run line had drifted to 35 while the array held 37,
  because `registry.test.mjs` only pinned the bolded claim. It pins both halves
  of the run line now.

**Documentation split**

- README: 806 lines -> 359, a landing page that answers what this produces, what
  the gates catch, how to install, what is proven, and where everything else is.
- `CHANGELOG.md` (this file) and `docs/GUIDE.md` take the rest. `release.yml`
  reads release notes from the changelog now, verified by running the workflow's
  own awk against the new file.
- The split broke four links immediately, which is why `scripts/check_links.py`
  now runs in `npm test`: every relative link in the doc surface must resolve,
  anchors and external URLs skipped on purpose.
- Plugin usage is documented for real: what lands in a session, why
  `design-doctrine` has to exist, the management commands, and how to read the
  token cost `claude plugin details` prints.

**Community**

`CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, a pull-request template that asks for
pasted gate output, and four issue templates led by **"Gate gap - something
passed that should have failed"**, which is the most valuable report this
project can receive.

**Fixed while testing the CLI:** `--no-open` was not parsed at all, so the flag
fell through into the positional arguments and the browser opened anyway. That
fall-through was general - `init --forse` would have created a directory called
`--forse`. An unknown flag now exits 1 with a message.

### `v2.6.0`

Installable as a Claude Code plugin, a command that interrogates the brief before
anything is built, and a token build that was quietly shipping a theme no component
could render against.

**Installable as a plugin**

- `.claude-plugin/plugin.json` + `.claude-plugin/marketplace.json`, both passing
  `claude plugin validate`. Two lines in Claude Code and you get 18 skills, 5
  commands, and the `design-critic` agent in any project:
  `/plugin marketplace add plugin87/ux-ui-agent-skills`.
- **A plugin root `CLAUDE.md` is not loaded as project context** - the validator
  says so outright. So the doctrine travels as a skill: `design-doctrine` carries
  the verification protocol, the absolute no-emoji rule, the five non-negotiables,
  the decision framework, and the routing table. Without it a plugin install would
  have shipped the files and none of the rules.
- `validate_instruction_surface.py` now guards that second surface too: seven
  always-on rules must survive in `design-doctrine`, and `package.json`,
  `plugin.json` and `marketplace.json` must agree on the version. Both checks were
  proven by mutation - deleting the emoji ban from the skill fails the gate, and
  the version check caught a real 2.5.1/2.6.0 mismatch the moment it was written.

**`/grill-me` - interrogate the brief, not the output**

Four eval runs scored 14/14 on the gates and still came back from `/critique` as
rework, every finding a decision no gate can see. `/critique` attacks the result;
this attacks the brief: at most seven questions, asked in one round, only where
different answers change the build - and everything unasked becomes a written
assumption with its default and the cost if it is wrong. Output is a `BRIEF.md`
that a later reviewer can argue against.

**The token build was emitting colour and nothing else**

- `build_tokens.mjs --out` against the kit's own `tokens/` directory produced **85
  variables, all `--color-*`**. Every `--space-*`, `--text-*`, `--radius-*`,
  `--shadow-*` and `--font-*` was undefined. The cause: the non-colour groups were
  looked up inside `colors.json` only, which works for a single self-contained
  `design-tokens.json` and silently returns nothing for a multi-file directory.
  This is the exact failure the function's own comment says it exists to prevent,
  and CI ran the command on every push while checking only that it exited 0.
- Two more bugs surfaced once the groups resolved: every array was treated as a
  cubicBezier, so the font stack emitted as `cubic-bezier(Inter, system-ui, ...)`
  and every shadow as `cubic-bezier([object Object])`; and a reference resolving to
  an array (`{easing.ease-out}`) left its brace behind, so **every `--transition-*`
  was dropped**. `cssValue` now dispatches on the DTCG shape.
- A directory build now emits **231 variables**, including the chart palette from
  `data-viz.json`, which had never been emitted at all.
- Two regression tests assert the output, and the directory test fails against the
  old generator - checked by stashing the fix, not by assertion.
- **Still open, stated rather than claimed fixed:** 11 names the kit's own harnesses
  use do not exist in the token source under those names (`--color-action-danger`
  vs `action.destructive`, `--color-text-error` vs `feedback.error-text`,
  `--radius-pill`, `--duration-normal`, `--ease-emphasized`, and the inverse/brand
  surfaces). That is a token-API decision with SemVer consequences - emitting both
  names through a deprecation window, then removing the old ones in 3.0.0 - not a
  mechanical fix, so it is not bundled here.

**Housekeeping**

- `LICENSE` added. The repo declared MIT in `package.json` and linked a badge to a
  dead anchor for its whole life without ever shipping the licence text.
- Author is now the real name, in `LICENSE`, `package.json` and the README.
- Two scars from the v2.3.1 emoji purge repaired: a README line that ended
  mid-sentence ("consider giving it a "), and a journey map whose emotions had been
  replaced with redundant parentheticals and one mangled arrow.

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
- **`.mcp.example.json`** — an optional Figma MCP connection for working on this repo, secret-free (`${FIGMA_API_KEY}` env expansion). Copy it to `.mcp.json` if you want it. It ships as an example on purpose: a plugin root `.mcp.json` is picked up by the plugin, and installing a design kit must not silently register a third-party MCP server on someone's machine.
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
