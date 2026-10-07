# Harness score — what the kit enforces, measured

`RESULTS.md` records how well an agent does with the kit. This file records
something different and less flattering: how much of the kit **reaches** the
agent at all, and how much of its doctrine is enforced by something that runs
whether or not the model remembers to run it.

The two are easy to confuse. A 14/14 blind run proves the gates work on the one
install route the run used. It says nothing about the other two routes, nothing
about whether a rule fires when no skill happens to load, and nothing about
whether a number in a final answer was ever measured.

## How to read a score

Each indicator is normalised to 0..1 and the Harness Score is their mean.

An indicator that **cannot** be measured scores 0, and says so in its own words.
That zero means "there was no instrument", not "it was tested and failed" — and
not "it passed". Reading an unmeasured indicator as a pass is the exact failure
this repo's doctrine exists to prevent, so the distinction is kept in the table
rather than in a footnote.

Re-measure with the same commands. A score quoted without the command that
produced it is not a score.

---

## Baseline — 2026-10-05, commit `f2e2f7f`

| ID | Indicator | Score | Measured by |
|---|---|---|---|
| H1 | Install-path parity | **0.265** | `python3 scripts/measure_install_paths.py` |
| H2 | Invocation correctness | **0** (no instrument) | needs `claude plugin eval` |
| H3 | Enforcement coverage | **0.000** | counted below |
| H4 | Verification receipts | **0** (no instrument) | needs `scripts/gate.mjs` — built in Phase 3.1 |
| H5 | Blind first-pass, per route | **0.333** | `evals/RESULTS.md` |
| H6 | Critic catch rate | **0** (no instrument) | needs `tests/fixtures/critic/` — built in Phase 3.3 |
| H7 | Taste applied on page/app work | **0** (no instrument) | needs the page-and-app prompt set |
| | **Harness Score** | **0.086** | mean of H1..H7 |

Four of the seven are zero for want of an instrument. The score is therefore
mostly a statement about what has never been looked at.

### H1 — install-path parity: 0.265

```
Plugin surface: 25 file(s), 156 kit-file reference(s), 0 already variable-guarded.

  route          resolves    share
  ------------ ----------  -------
  plugin          0 / 156     0.0%
  init          124 / 156    79.5%
  skills-add      0 / 156     0.0%

  H1 (mean across the three routes) = 0.265
```

The 19 skills, 5 commands and 1 agent name 156 kit files between them. Not one
reference carries a path variable, so on the plugin route — the one the README
recommends first — every single one resolves against the user's own project,
where the kit is not. `npx skills add` copies the skill folders alone, so the
same references are missing there too.

`init` is the only route that mostly works, and 32 references still fail on it,
under `examples/`, `templates/` and `docs/`. The CLI's `AREAS` map has no entry
for any of them, so a skill that holds up `examples/golden/` as the quality bar
is pointing at nothing in an initialised project.

> **This number was published wrong first.** The initial commit of this file
> recorded H1 as 0.297 over 139 references. Three bugs in the instrument moved
> it: the `AREAS` parser read a nested map the CLI does not use (reporting `init`
> at 0%), prose like "SemVer for tokens/components" counted as a broken path, and
> a reference that had been *fixed* stopped matching the pattern entirely, so
> repairing one would have shrunk the denominator instead of moving it into the
> resolved column. The last of those is the dangerous one: it would have made any
> improvement look larger than it was. Both numbers in the table below come from
> the instrument as it stands now, run against both trees.

### H3 — enforcement coverage: 0.000

`validate_instruction_surface.py` counts **11 always-on rules** in `CLAUDE.md`.
The repo has no `hooks/` directory and no `hooks` key in `.claude/settings.json`,
so **0 of 11** fire without the model choosing to run a gate.

```
$ ls hooks/ ; grep -c hooks .claude/settings.json
no hooks/ dir
0
```

Every gate in the repo runs because a human typed a command or a skill told the
model to. That is the gap this indicator exists to close.

### H5 — blind first-pass, per route: 0.333

`evals/RESULTS.md` records four blind runs, all **14/14 on first submission**,
and every one of them scaffolded with `npx ux-ui-agent-skills new`. Zero blind
runs have gone through the plugin route or the `npx skills add` route.

Scored as routes-with-a-passing-blind-run over routes: 1 of 3.

The init route is already at its ceiling, so a harder brief is needed before
this indicator can move for the right reason rather than by adding routes alone.

### H2, H4, H6, H7 — no instrument exists

| ID | What is missing | Why it is 0 and not "pass" |
|---|---|---|
| H2 | An eval set of should-trigger and should-not-trigger prompts | Triggering has never been measured once. The six skills marked `invocation: user` are auto-invocable anyway, because `invocation` is not a field Claude Code reads |
| H4 | A gate wrapper that records what it measured | No run is recorded anywhere, so no number in any answer can be traced to a measurement |
| H6 | Seeded-defect fixtures and an answer key | The critic has never been scored against known defects |
| H7 | A page-and-app prompt set run in a fresh project | The owner reports taste is not applied at all in new projects; nothing has confirmed or refuted that |

---

## After 1.1 — skills carry the kit root

The 19 skills now express every kit-file reference as
`${CLAUDE_SKILL_DIR}/../../../<path>`.

**Verified before applying it**, as the plan requires, with a throwaway probe
skill asked to copy one line back verbatim. On both routes it reported an
absolute path, not the variable, which is the only proof that Claude Code
substitutes it in skill *content* rather than leaving it to the shell — the
shell environment has it unset on both:

| route | what the model received | probe |
|---|---|---|
| plugin, from a local marketplace, cwd `/tmp/probe-project` | `MARKER=/Users/plug/Development/ux-ui-agent-skills/.claude/skills/path-probe` | `PROBE_OK` |
| init, into an empty `/tmp/init-project` | `MARKER=/private/tmp/init-project/.claude/skills/path-probe` | `PROBE_OK` |

Because `plugin.json` points skills at `./.claude/skills`, a skill sits at
`<root>/.claude/skills/<name>/` on both routes, so `../../..` is the kit root on
both. The probe was deleted afterwards; it is not in the skill listing.

| route | before | after skills | after commands + agent |
|---|---|---|---|
| plugin | 0 / 156 (0.0%) | 133 / 156 (85.3%) | **156 / 156 (100%)** |
| init | 124 / 156 (79.5%) | 152 / 156 (97.4%) | **156 / 156 (100%)** |
| skills-add | 0 / 156 (0.0%) | 0 / 156 (0.0%) | **0 / 156 (0.0%)** |
| **H1** | **0.265** | **0.609** | **0.6667** |
| Harness Score | 0.086 | 0.135 | **0.143** |

Three more things the same work turned up, all of them the plan's 1.4 and
Cause 5, all now held by `tests/meta/registry.test.mjs`:

- `plugin.json` and `marketplace.json` both advertised **41** objective gates
  while the registry held 44 and the GitHub description said 43. Nothing read
  those two files, so nothing noticed. A marketplace listing is the first number
  many people ever see.
- `bin/cli.js` described its skills area as "10 runnable Claude skills" with 19
  installed. It is counted from the folder now, never typed.
- `package.json` `files` had no `.claude/agents/` entry, so every npm consumer
  got a `/critique` that delegates to an agent which was never shipped.

`engines` moved from `>=16` to `>=20`, matching what CI actually runs.

Only H1 moved; the other six are untouched.

The five commands became skills, so each has a `CLAUDE_SKILL_DIR` of its own.
They keep a command's behaviour through `disable-model-invocation: true`: the
user starts them, the model never does, and their descriptions stay out of the
listing budget the model's skill choice is drawn from. `plugin.json` no longer
carries a `commands` array.

A subagent gets no `CLAUDE_SKILL_DIR` at all, so `design-critic` takes the root
as `KIT=<absolute path>`, which the `critique` skill now passes verbatim in its
delegation message. The agent is told to say so and review without the scripts
if that line is missing, rather than guess a path or report a number it never
got back.

> **The first figure published here for this step, 0.8932, was wrong**, and
> wrong in the direction that flatters. Two faults, both caught by distrusting a
> round number:
>
> 1. A guarded reference was treated as resolving on **every** route. A variable
>    fixes *where* the kit root is; it cannot conjure a kit that was never
>    copied. `npx skills add` installs the skill folder alone, so
>    `../../../scripts` points at nothing there no matter how it is spelled.
>    That alone had the whole exercise reading 1.0.
> 2. `$KIT` was not in the pattern, so the four agent references disappeared from
>    the denominator the moment they were fixed — the same class of fault as the
>    one already recorded above, in a new spelling.
>
> `skills-add` stays at 0.0% and will until the kit is actually reachable on that
> route. That is Phase 1.2, and it is a real gap, not a measurement artefact.

---

## After 1.2 and 1.3 — the kit notices when it is missing, and user-only is real

**1.2.** `npx skills add` copies the skill folders alone: no `scripts/`, no
`tokens/`, no `taste/`. Every skill that reads a kit file now opens with a check:

```
ls ${CLAUDE_SKILL_DIR}/../../../tokens >/dev/null 2>&1 && echo KIT_OK || echo KIT_MISSING
```

Verified both ways — `KIT_OK` in a normal install, `KIT_MISSING` against a tree
holding `.claude/skills/` and nothing else. On `KIT_MISSING` the skill names the
install that fixes it and stops, rather than proceeding from files it never
opened.

**H1 for `skills-add` stays 0.0%, deliberately.** The references still do not
resolve; what changed is that the failure is now loud instead of silent. Scoring
a louder failure as a resolved path would be exactly the kind of flattering
measurement this file keeps catching. Making that route actually work means
shipping the kit through it, which is a different fix.

**1.3.** All 19 skills carried `invocation: user|model`, a key Claude Code does
not read. Unknown frontmatter keys are ignored without an error, so the six
marked user-only had been auto-invocable for as long as the field existed, and
`claude plugin validate` passed the whole time.

| | before | after |
|---|---|---|
| skills whose user-only marking actually worked | **0 of 6** | 11 of 11 |
| skills in the model's listing | 24 | 13 |

Confirmed live: after the change the session's skill listing dropped the eleven
user-started skills and showed thirteen, which is also the Cause 4 saving — the
listing budget no longer carries entries the model must never pick.

`tests/meta/skill-frontmatter.test.mjs` pins the allowed frontmatter keys, so a
future typo cannot behave like a working field, and holds the inverse too: a
design skill accidentally hidden from the model is a skill that never runs.

---

## After Phase 1A — a skill owns the most common request, and taste is in context

**Cause 1.** "Design a page / screen / landing page / app" is the most common
request there is, and no skill claimed it: `design-code` wanted a stack named,
`design-component` works at the spec level, `apply-aesthetic` waits to be asked
for a look, `redesign` needs existing UI. Nothing matched strongly, so the model
picked a neighbouring skill or none. `design-screen` claims it, in English and
Thai, and runs the pipeline no single skill covered: taste preflight, doctrine,
direction into tokens, build, gate, render-and-look, critic. It also says when to
hand off rather than absorbing work that belongs elsewhere.

The trigger phrases live in `description`, not in a `when_to_use` field. That
field may well be real, but it has not been verified on this version, and
shipping an unverified key is precisely the `invocation` mistake this branch has
already had to undo once.

**Cause 2.** Taste was three files totalling 531 lines that a skill had to choose
to read, and `design-doctrine` mentioned it only to say the gates do not prove
it. A compact preflight is now in the body of both `design-doctrine` and
`design-screen`, so it is in context the moment either loads instead of depending
on a file read: the brief block to fill in, and the banned defaults to break.

The product template gained `.claude/rules/taste.md` and a design-work router in
its `CLAUDE.md`, because `new` deliberately skips the engine's own `CLAUDE.md`
and rules — which is where taste was routed from.

**Cause 5.** `AREAS` had no entry for `.claude/agents`, `examples/` or
`templates/`, so an initialised project had no critic to delegate to, no
reference output, and nothing for `/scaffold-project` to scaffold from.
`tests/cli/installed-references.test.mjs` now scaffolds a real project and opens
every file the installed skills name — 177 references — which caught three the
inferential measurement was reporting as fine.

| | before | after |
|---|---|---|
| skills claiming "design a page or app" | **0** | 1 |
| skills with the taste preflight in their body | 0 | 2 |
| template rule files about taste | 0 | 1 |
| kit references that open in a real `init` project | 174 of 177 | **177 of 177** |

H1 and the Harness Score are unchanged at **0.6667** and **0.143**: this phase
moves H7, and H7 has no instrument yet. Recording it as an improvement without
one would be the same mistake this file already documents three times.

---

## After 3.1 and 3.2 — the first things that run without being asked

Every gate in this repo ran because a human typed a command or a skill told the
model to. H3 was 0.000 for that reason: eleven always-on rules, nothing enforcing
any of them.

**3.1 — receipts.** `scripts/gate.mjs` runs any gate with `DS_REQUIRE_BROWSER=1`
always set and writes one JSON line per run: the gate, the file, the **SHA-256 of
that file at the moment it was measured**, the exit code, the numbers printed,
and when.

The hash is the whole mechanism. A receipt is evidence only while the file still
hashes the same:

```
$ node scripts/gate.mjs --check examples/sample-app/preview.html
OK: 1 live receipt(s) for examples/sample-app/preview.html

# ... edit the file ...
$ node scripts/gate.mjs --check examples/sample-app/preview.html
EXPIRED: it was measured, then edited. The old numbers no longer describe it.
```

That is exactly the moment a remembered number becomes a lie, and now it is
detectable rather than a matter of trust.

**3.2 — three hooks**, shipped to both routes: `hooks/hooks.json` with
`${CLAUDE_PLUGIN_ROOT}` for the plugin, the same scripts in
`.claude/settings.json` with `$CLAUDE_PROJECT_DIR` for `init`.

| hook | what it does | verified |
|---|---|---|
| SessionStart | says whether the render gates can run here at all, before anything is built | prints the verdict, never blocks, spawns no process |
| PostToolUse on Write/Edit | runs the browser-free gates on the file just written; exit 2 puts the findings in front of Claude | exit 2 on the slop fixture (63 hardcoded values, 12 emoji), exit 0 on a clean file |
| Stop | refuses to finish when a UI file was edited and has no live receipt | blocks after an edit, releases after a measured run, passes straight through on `stop_hook_active` |

**H3: 0.000 → 0.273.** Three of the eleven always-on rules now fire without the
model choosing to: no hardcoded values, no emoji, and never state a number you
did not measure. The other eight still depend on a gate somebody runs.

| | before | after |
|---|---|---|
| H3 enforcement coverage | 0.000 | **0.273** |
| H4 verification receipts | 0 (no instrument) | instrument exists; **first real measurement pending** |
| Harness Score | 0.143 | **0.182** |

H4 stays 0 on purpose. The wrapper exists, but no session has yet been scored on
how many of its stated numbers carry a live receipt, and scoring an indicator the
day its tooling lands — using the tooling's own existence as the evidence — is
the circularity this file keeps catching.

### The hook that did nothing

The first PostToolUse hook called `require` in an ES module. The
`ReferenceError` landed in a `catch`, the payload stayed empty, and it exited 0
on every edit — including a file with 63 hardcoded values and 12 emoji. A hook
that never fires is indistinguishable from a codebase with no findings, which
makes it the worst failure available to a mechanism whose entire job is to be
unskippable. `tests/meta/hooks.test.mjs` drives all three with real JSON on
stdin and asserts the exit codes, including that one.

---

## After 3.7 and 3.8 — three house rules, each with a gate

**3.7** is recorded in the commit; both rules now have a gate and a fixture.

**3.8, mobile-first.** The doctrine already said it. `tokens/breakpoints.json`
described its breakpoints as mobile-first, `CLAUDE.md` said "Mobile-first", and
the adapter protocol agreed. The examples said the opposite: **90 `max-width`
media queries against 9 `min-width`**, and agents copy examples far more readily
than they follow prose.

Counting cannot tell a desktop-first stylesheet from a mobile-first one with a
couple of narrow refinements, so `scripts/verify_mobile_first.mjs` does not
count. It removes every `@media` and `@container` rule and renders what is left
at 320px. A mobile-first page passes because its base already is the phone
layout; a desktop-first page cannot fit.

| | before | after |
|---|---|---|
| pages whose base layer fits a phone | 39 of 49 | **49 of 49** |
| worst base overflow | 204px (showcase) | 0 |

Ten pages were desktop-first. The fixes were structural, not cosmetic: the
console grid and the app shell were built from a 12-column base stepped *down*
by `max-width`, so the base layer was a wide layout that only worked once a query
patched it. Four of the ten also exposed the same underlying bug, which is Cause
2 in the repo's own narrow-width rules and had been invisible until the queries
came off: `min-inline-size:0` lets a PANEL shrink and does nothing for the
implicit grid column inside it, which is `max-content` and sizes itself to the
widest child.

`max-width` is not banned, and `tests/fixtures/good/mobile-first.html` is the
fixture that proves it: a mobile-first page using two genuine narrow refinements,
which the gate must accept. `tests/fixtures/bad/desktop-first.html` is the one it
must reject.

**The refactor broke something, and the existing gates caught it.**
`verify_responsive` failed `trial.html` at 280px under a 1.25x root font, +26px.
The forest-plot axis centres each label on its tick, so the outermost hung half a
label past the edge — invisible until the layout stopped being wide enough to
hide it. The end labels anchor to the edge now. That failure is the argument for
running the whole suite rather than only the gate you just wrote.

Registry 47 -> 48.

---

## After 3.3 — the critic runs in a fork, and is scored for the first time

**The critic is a forked subagent now.** `/critique` carries `context: fork` and
`background: false`, so it runs in a context that never saw the conversation
that produced the work, and still returns its verdict in the turn that asked.
The reason is not isolation for its own sake: a critic holding the maker's
reasoning reviews the argument instead of the artifact, and it agrees.

It deliberately carries **no `agent:` field**. A plugin namespaces every
component under the plugin name, so this repo's critic is `design-critic` after
`npx ux-ui-skills init` and `ux-ui-agent-skills:design-critic` under a plugin
install. No single frontmatter value is correct on both routes, and a wrong one
is `invocation:` again - a field that looks right and silently does nothing. The
fork loads its brief from a `${CLAUDE_SKILL_DIR}`-relative path instead, which
resolves either way, and `tests/meta/skill-frontmatter.test.mjs` pins the
decision because `agent: design-critic` is the obvious-looking edit.

### The instrument

`tests/fixtures/critic/` holds four pages carrying **fourteen seeded defects**,
with `evals/critic-answer-key.json` naming each one and the rule it breaks.

The property the whole thing rests on: **every one of those four pages passes
every gate in this repo** - `measure_render`, `verify_states`, `axe_audit`,
`verify_keyboard`, `verify_target_size`, `verify_overflow`,
`verify_reduced_motion`, `verify_interactive`, `lint_intent`, `slop_tells
--strict`, `taste_audit --strict` and `verify_responsive --scale=1.25`, in light
and dark. A defect a gate can catch would measure the gate.
`tests/meta/critic-fixtures.test.mjs` re-proves that on every run, with
`DS_REQUIRE_BROWSER=1` so a missing browser fails instead of printing SKIPPED.

### The first run — H6: 0 -> 1.000

Four critics, one per page, each given only the page and the brief.

| fixture | seeded | caught |
|---|---|---|
| `dashboard-no-lead.html` | 3 | 3 |
| `empty-state-floating.html` | 3 | 3 |
| `list-identical.html` | 4 | 4 |
| `async-lies.html` | 4 | 4 |
| | **14** | **14** |

**Read this number with its three caveats, because 1.000 on a first run is
exactly the shape of a number that is measuring the wrong thing.**

1. **The fixtures and the key were written in the same session, by the same
   party, from the repo's own doctrine.** Every seeded defect is a textbook
   instance of a rule already in the critic's brief. A real screen's defects are
   subtler than "the toast says created and the list is unchanged". This scores
   whether the critic applies doctrine it has been handed, not whether it has
   taste.
2. **The keyword matcher scored 9/14 before it was calibrated against these same
   four critiques.** The five it missed were all caught in prose and missed on
   vocabulary: the key looked for "differentiator" and the critic wrote "nothing
   differentiates one row from the next"; it looked for "outruns the truth" and
   the critic wrote "Feedback may not outrun the data". So part of the 14/14 is a
   statement about the matcher. The hand-read count was 14/14 both before and
   after - that is the number, and the matcher was moved to agree with it.
3. **Calibrating a matcher on the runs it scores is circular**, and it is only
   acceptable here because the controls still hold: a critique that merely quotes
   the page ("an h1 reading Welcome, a Debug mode checkbox, the eyebrow says
   SECTION 01") still scores **0/4**, and an empty file scores 0/4. The signals
   got wider, not weaker. The next genuinely independent measurement is defects
   seeded by someone else.

### The instrument caught the skill that built it

The first full gate run after this landed failed, and the failure was H1:
install-path parity dropped from **1.000 to 0.9884** on both the plugin and the
init route. `measure_install_paths.py` named the two references exactly:

```
.claude/skills/critique/SKILL.md:111  tests/fixtures/critic
.claude/skills/critique/SKILL.md:113  evals/score_critic.mjs
```

The new skill told the reader how to score the critic, naming two paths that
ship with a clone and with neither install - `tests/` and `evals/` are outside
both the npm package and the plugin. A paragraph next to them said so, which is
not a fix: a path inside an installed skill that resolves on no route is a dead
reference whatever the prose beside it claims.

The guidance was maintainer-only and did not belong in a skill that installs
into someone else's project. It moved here. H1 is back to 1.000 on both real
routes.

Worth saying plainly, because it is the argument for keeping instruments
pointed at yourself: the thing that caught this was built two phases earlier to
measure a different problem, and it caught a defect in the phase that was adding
a critic.

### What the critics found that nobody seeded

A stronger signal than the catch rate, because none of it was in the key:

- `dashboard-no-lead.html` - the label outranks the number (`h3` 17px/700 over a
  28px/400 value); page padding, grid gap and card padding are all 16px so
  nothing groups; body measure is 97 characters because `72ch` undersizes against
  real mixed-case text.
- `list-identical.html` - `color-scheme` is never declared, so in dark mode the
  UA paints a light checkbox and the **unchecked** debug toggle is the
  highest-contrast element on the page, reading as "on"; the `<caption>` and the
  Number column both scroll away with the overflow, so the identity column
  truncates to "000".
- `async-lies.html` - four of five buttons have no handler at all; at 390 two
  cards in the same row carry buttons of 74px and 50px because one label wraps.

Three of those are findings about the fixtures I wrote, which is the correct
direction for this to run.

### Harness Score

| | baseline | after 3.2 | after 3.3 |
|---|---|---|---|
| H1 install-path parity | 0.265 | 0.6667 | 0.6667 |
| H2 invocation correctness | 0 | 0 | 0 |
| H3 enforcement coverage | 0.000 | 0.273 | 0.273 |
| H4 verification receipts | 0 | 0 | 0 |
| H5 blind first-pass | 0.333 | 0.333 | 0.333 |
| H6 critic catch rate | 0 | 0 | **1.000** |
| H7 taste on page/app work | 0 | 0 | 0 |
| **Harness Score** | **0.086** | **0.182** | **0.325** |

0.325 / 0.086 = **3.78x** against the baseline, which clears the plan's 1.5x bar
on arithmetic. It should not be quoted yet. H6 is one of seven indicators and it
is the only one at its ceiling, so it moves the mean more than any other single
number could - and it is also the weakest of the seven for the reasons above.
H2, H4 and H7 are still zero for want of an instrument, which is what the score
is really saying.

---

## Re-measuring

```bash
node evals/measure_harness.mjs            # every indicator, computed
node evals/measure_harness.mjs --json     # the same, machine-readable

# H6: critique each fixture, save as critique-<fixture>.md, then
node evals/score_critic.mjs critique-*.md
```

`measure_harness.mjs` replaced the hand-assembled table below, and the first
thing it did was contradict it: this file recorded H3 as **3 of 11 rules
enforced** while the always-on list had grown and the real figure was 3 of 9. A
number that was true when it was typed and wrong by the time anyone read it is
the reason the table is computed now. Indicators that need a paid run are read
from `harness-measurements.json`, which records the commit each was measured at
and marks an entry STALE once HEAD moves past it.

H6 is re-measured by running `/critique` against each page in
`tests/fixtures/critic/` and scoring what came back. Read the printed excerpts
before quoting the number; the scorer says so itself, and the first run proved
why.

The rest become measurable as their instruments land. Record each new baseline
in this file on the day the instrument first runs, so a later improvement is
compared against a real starting number and not against a zero that only meant
"we had not looked yet".
