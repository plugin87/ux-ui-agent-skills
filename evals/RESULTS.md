# Eval results

One row per run. A run is only worth recording with its provenance attached: who
built the output, and whether they could see the kit's internals while doing it.

| Date | Brief | Provenance | Objective | Requirements | Notes |
|---|---|---|---|---|---|
| 2026-08-25 | `billing-settings` | In-session (contaminated, see below) | **14/14**; 8/13 on the first submission | 6/6 by hand | Five gate failures on the first pass, all real |
| 2026-08-25 | `first-run-empty` | In-session (contaminated) | **14/14** first submission | 5/5 by hand | Clean pass, and that is the point: see "what a repeat run proves" |
| 2026-08-25 | `data-density` | In-session (contaminated) | **14/14**; 10/13 first, then caught again by gate 14 | 5/5 by hand | Header contrast, then a sort header that declared `aria-sort` and sorted nothing |
| 2026-08-25 | `notification-center` | In-session (contaminated) | **14/14**; 11/13 first | 5/5 by hand | Same 4.24:1 pair again, this time on the unread row |
| 2026-08-25 | `first-run-empty` | **BLIND** subagent, scaffolded project | **14/14** | 5/5 by hand | Found the component-tier dark bug and the external-CSS blind spot |
| 2026-08-25 | `billing-settings` | **BLIND** subagent, scaffolded project | **14/14** | 6/6 by hand | Found the missing scrim token, the colours-only theme, and the intent gate's vocabulary |
| 2026-09-15 | `data-density` | **BLIND** subagent, scaffolded project | **14/14** first submission | 5/5 by hand | First blind run on this brief. Clean first pass; keyboard sort verified to actually reorder |
| 2026-09-15 | `notification-center` | **BLIND** subagent, scaffolded project | **14/14** first submission | 5/5 by hand | First blind run on this brief. Needed a `5xl` type step the seeded scale lacked |

| 2026-10-08 | `first-run-empty` | **BLIND**, **plugin route**, `claude -p` in an empty dir | **14/14**, files unedited — but see below: 13/14 on first scoring, and the one failure was the gate's | not scored | First blind run through the plugin route at all. Ten files, no kit files in the project. |

## 2026-10-08 — first-run-empty, through the plugin route

**The route the README recommends first had never been tested blind.** Every
previous blind run came from a project scaffolded with `npx ux-ui-agent-skills
new`. This one ran `claude -p` in `/tmp/blind-plugin`, a directory containing
one file - the brief - with the kit reaching the agent only through the
installed plugin.

It produced ten files: empty, one-project, forty-project and loading, each in
light and dark, plus `tokens.css`, `app.css` and `app.js`.

### What it refused to claim

The agent was granted edits but not Bash, so it could not run the gates. It did
not report success anyway:

> None of the 10 files has a gate receipt, so they are still unmeasured. I ran
> the wrapper exactly as the hook asked (`gate.mjs verify_states.mjs` on
> `dashboard-empty-light.html`), and it was refused: the command needs approval
> this session can't grant.

That is the first rule of the kit working on the install route nobody had
checked, under conditions that invited a confident guess instead.

### 13/14, and the failure was ours

Scored with `evals/run.mjs`, the output failed one gate: `verify_reduced_motion`,
check C, "content visible normally is INVISIBLE under reduce", on six of the ten
files.

The agent's code was correct. It wrote a reduced-motion policy, stopped the
skeleton shimmer under it, and then did the thing that respecting the preference
actually means:

```js
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
window.setTimeout(reveal, reduced ? 0 : 700);
```

A reader who asks for less motion gets the content **sooner**, with no
artificial wait. The gate sampled both branches on a flat 450ms timer, so it
caught the skeleton still showing in one branch and already replaced in the
other, and called the placeholder lost content.

Every user who writes a skeleton that honours the preference would have hit
this, and been sent to fix code that was already right.

**The fix is in the gate, not the files.** It now waits for the page to stop
declaring `aria-busy` and for the visible set to stop changing, then compares
settled states. The first attempt at the fix was wrong in an instructive way:
polling for stability alone settled at 250ms, because a skeleton held on a timer
is perfectly stable while it is showing. Stability is not the same as being
finished, and the page already says which it is.

`tests/fixtures/good/skeleton-respects-reduce.html` is the pattern the gate used
to reject, and `tests/fixtures/bad/motion-reveal.html` - content revealed only by
an entrance animation, the failure check C exists for - still fails. Both are
asserted in `tests/meta/browser-gates.test.mjs`.

### 14/14, stated with what changed

Re-scored against the corrected gate: **14/14, with the produced files never
edited.** The honest form of that number is "the work passed every gate once the
gate was measuring the right thing", and it is written that way here rather than
as a clean sweep, because the difference is the whole finding.

Requirements were not scored by hand on this run. The objective half is what the
plugin route had never had.

---

## 2026-08-25 — billing-settings

**Provenance, stated plainly.** This output was written inside the session that
built the kit, not by a blind cold-start agent. It is therefore the weaker of the
two claims the suite can make: it shows the gates catch real mistakes in real work,
but it does not show the kit transfers to an agent seeing it for the first time.
A blind run is still owed.

**First submission scored 8/13.** Everything that failed was a genuine defect, not
a gate being fussy:

| Gate | What was actually wrong |
|---|---|
| No hardcoded values | `1ms` in the reduced-motion reset. The reset *is* the near-zero duration, so it cannot come from a motion token — it needed the documented `ds-allow-hardcode` exception, on the offending line. |
| REAL-render WCAG | A "Current plan" pill used `--color-surface-brand` (a tinted surface) behind `--color-text-on-action` (white): **1.15:1**. A white pill needs an action background, not a surface. |
| axe | Same pill, reported as a serious colour-contrast violation. Two gates, one bug. |
| Responsive 280/320/414 | The billing table's scroller sat in an implicit `auto` grid column, which grows to its content's max-content and takes the page with it. `grid-template-columns: minmax(0,1fr)` pins it. |
| Responsive @1.25x | Two separate causes: `.sr-only` spans (see below), then an email address — one unbreakable token — widening a card until `overflow-wrap: anywhere` let it break. |

**The finding worth keeping.** An absolutely positioned `.sr-only` span with no
positioned ancestor resolves against the *initial containing block*. Inside a
horizontally scrolled table it therefore lands outside the viewport and inflates
`document.documentElement.scrollWidth` — the page reports an overflow of hundreds
of pixels while every visible element is inside the viewport and nothing looks
wrong in a screenshot. Give the span a positioned ancestor (`td`, `th`, the button)
and it stays put. This is now in `.claude/rules/components.md`.

**The half no gate scored.** All six of the brief's requirements hold: Cancel wears
the danger variant on the trigger *and* in the confirm dialog; the dialog traps
focus, closes on Escape, and returns focus to the trigger (`verify_focustrap` plus
a real click test in both themes); the plan panel is the focal point rather than
three equal cards; the history table carries a nine-digit amount and a 60-character
description that truncates with a `title`, and an empty state that names the date
the first invoice arrives; the card number is masked with a screen-reader label;
copy frontloads the verb.

Screenshotted at 1280 in light and dark, and the flow was clicked: the dialog opens,
the confirm button stays disabled for the wrong case, enables on `CANCEL`, Escape
closes, focus returns. `taste_audit` raised one advisory signal.

**What a blind run still has to prove.** Whether an agent that has never read this
repo reaches for `action.danger` on its own, remembers the confirm dialog at all,
and writes an empty state that says something useful rather than "No data".


## 2026-08-25 — the other three briefs

Same provenance caveat as above, and it matters more here: by the time these were
written the five traps from `billing-settings` were known, so `first-run-empty`
passed 13/13 on the first submission. **That is a memory result, not a transfer
result.** It says the gates are stable and the traps are learnable; it says nothing
about an agent meeting the kit for the first time.

The two that did fail failed on the *same* pair, which makes it a system finding
rather than two mistakes:

**`--color-text-secondary` on `--color-surface-raised` is 4.24:1 in the dark theme
of `examples/brandkit-demo/theme.css`** — the theme every component harness and every
eval output links to. It hit twice: the sortable column labels sitting on a raised
table header (`data-density`), then the metadata inside a raised "unread" row
(`notification-center`). Secondary text on a raised surface is one of the most common
pairings in real UI, so this will bite anyone who builds on that demo theme.

- The kit's own `tokens/colors.json` is fine on this pair (7.56:1 light, 5.78:1 dark);
  only the demo theme is tight.
- `scripts/validate_contrast.py` now reports the pair, as **advisory**, so the gap is
  at least visible. It passes on the real token set.
- The one-line fix in the demo theme, not applied here because it changes a shipped
  example: `--color-text-secondary:#9fa6ac` -> `#adb4ba` in the `[data-theme="dark"]`
  block gives 4.98:1.

Both files were corrected the same way a product would be: the small labels take
`--color-text-primary`, and the unread row keeps its left rule and elevation instead
of leaning on a tinted background.

## What a repeat run proves, and what it does not

Four briefs, four 13/13 results, one contaminated author. The honest reading:

- **Proven:** the thirteen gates run cleanly against arbitrary produced work, catch
  real defects (nine across the four runs), and do not fire falsely on correct code.
  The suite is usable.
- **Not proven:** that the kit transfers. Every one of these was written by someone
  who had just read the rules. A blind cold-start run — fresh session, brief pasted
  verbatim, no coaching — is still the only thing that answers the question the suite
  was built for.


## 2026-08-25 (later) — the gate that came out of the critique

`/critique` reviewed the kit's own `examples/` and its Critical finding was a header
in `data-table.html` that declared `aria-sort="ascending"`, drew a chevron, lit up on
hover, and sorted nothing. Every existing gate passed it: the button is focusable,
operable, large enough, and legible in every state. What no gate checked was whether
the state it advertises ever changes.

`scripts/verify_interactive.mjs` now checks exactly that, and it is gate 37 in the
kit and gate 14 in this suite. Signal [A] fails a control that declares `aria-sort`,
`aria-pressed`, `aria-expanded`, `aria-checked`, `aria-selected`, or a state-bearing
role, and changes nothing on a real click — no attribute anywhere, no DOM mutation,
no focus landing elsewhere. Signal [B] reports an inert plain button as advisory,
because a states harness legitimately ships static demo buttons. `data-demo-state`
opts a deliberate state *rendering* out, and has to be written by hand so the
exemption is a claim on the record.

What it found on its first run:

- `data-table.html` — the critique's Critical finding, now wired to really sort.
- `datepicker.html` — a day drawn as selected that never moved when clicked. Now
  selects on click and on Enter/Space.
- `button.html`, `card.html` — genuine state renderings, marked `data-demo-state`.
- **`evals/out/data-density/index.html` — my own fixture, written hours after reading
  the critique that named this exact bug.** The affordance got written, the behaviour
  did not. That is the most useful result in this file: the gate caught the author who
  already knew about the failure mode, which is precisely what a gate is for.


## 2026-08-25 (evening) — the blind runs, and what they cost the kit

Two subagents, each given a scaffolded project (`ux-ui-skills new`, which installs
the kit and ships **no example screens**), the brief verbatim, and nothing else. No
design hints, no trap warnings, no mention that anything would be scored. Neither
could see the conversation that built the kit; both met `CLAUDE.md` and
`.claude/rules/` the way a new user's agent does.

**Both scored 14/14 on an independent run of `evals/run.mjs`** — scored by this
session, not by the agents' own claims. That is the transfer result the suite was
built for, and it is the first evidence in this file that is not a memory result.

Both agents found the verification workflow on their own and ran it. One of them
rebuilt its theme with `build_tokens.mjs --in design-tokens.json` because
`.claude/rules/tokens.md` told it to. That is the kit working.

### What they broke on, and what it cost

Every one of these is a kit defect that the in-session runs never hit, because I was
linking a finished demo theme instead of starting from the template.

| # | What a blind agent hit | Root cause | Fixed |
|---|---|---|---|
| 1 | A secondary button rendered dark-on-dark, 1.13:1, caught by the state gate | `build_tokens.mjs` emitted the **component tier into `:root` only**. Component tokens alias into semantic ones, which do have dark overrides - so every component token stayed pinned to its light value in dark mode | `res()` now re-resolves through the dark map and the component tier is emitted into the dark block |
| 2 | Same bug, found independently by the other agent | as above | as above |
| 3 | A reduced-motion policy in an external stylesheet read as "no policy" | Chromium treats a `file://` `<link>` sheet as cross-origin, so `sheet.cssRules` throws and `verify_reduced_motion.mjs` silently skipped it. **Every real project keeps its CSS in a file**, so the gate was blind exactly where it mattered. One agent worked around it by duplicating the policy inline | The runner now reads linked stylesheets from disk and hands the text to the check. Negative-tested: an external policy passes, no policy anywhere still fails |
| 4 | A modal backdrop had no token to use | `templates/product-design/design-tokens.json` had no `semantic.surface.scrim` | Added, light and dark |
| 5 | `var(--space-4)`, `var(--text-sm)` and friends were undefined on the first screen | `build_tokens.mjs` emitted **colours only**. A project scaffolded from the template got a theme with no type, space, radius, shadow, motion or size | The build now emits the whole system under the names the kit's own components use |
| 6 | A Cancel-subscription flow scored as "0 intent-bearing controls" | `lint_intent.mjs` did not know `cancel subscription`, `close account`, `unsubscribe` are destructive | Vocabulary widened. Bare `cancel` stays out: it is the dismiss button on every dialog in the world |
| 7 | Both agents lost time to Playwright not resolving in a fresh project | The template shipped gates that need `npm i -D playwright`, and never said so. Worse, the render gates print `SKIPPED` and **exit 0** without it, which reads like a pass | Documented in the template's `CLAUDE.md`, its `/gate` command, and `/scaffold-project` |

### The honest reading

- **Proven now:** an agent that has never seen this kit, given a brief and the
  scaffolded project, produces work that passes all fourteen objective gates. The
  rules transfer well enough to survive a cold start.
- **Also proven:** the template path had five real defects that four in-session runs
  never surfaced, because I kept reaching for a finished demo theme. A blind run is
  worth more than four familiar ones.
- **Still not proven:** taste. Both outputs pass the gates and read reasonably in a
  screenshot; neither has been through `/critique`.


## 2026-08-26 — `/critique` on the blind outputs: **rework**

The two blind screens pass all fourteen gates. A critic that rendered them, clicked
through them, and tried to reject them came back with `rework` and eight findings,
five of them Major. Nothing it found is measurable, which is the point.

Its three reasons, unsoftened:

1. The empty and one-project dashboard states are "unfinished, not minimal" - a
   centred block under the header with a void below it reads as a page that failed
   to load.
2. The theme toggle "communicates nothing about its own state": same icon, same word
   in both themes, only `aria-checked` moves.
3. One control lies and one should not exist - a "Draft project created" toast over a
   list that never changes, and a QA preview checkbox rendering in the production
   billing screen.

The rest: a horizontally scrolling table with no visible scroll cue at 390px, timid
type scale (24px over 16px), forty undifferentiated cards, and a loading state that
reuses the disabled dimming so it reads as "you cannot do this".

**The fixtures were not edited.** They are the record of what a cold-start agent
produced; patching them would be editing the experiment. The findings were spent on
the kit instead:

| Finding | What changed in the kit |
|---|---|
| Toggle with no visible state | **Gate 37 gained signal [C]:** a control whose state attribute VALUE moves while its own rendered fingerprint stays byte-identical now fails. Guarded against the obvious false positive - clicking the already-selected day or the already-current tab is a no-op, not a hidden state - and negative-tested both ways |
| Empty state in a void, no focal point, timid type, forty identical cards, toast over unchanged data, invisible scroll cue, loading-as-disabled, shipped scaffolding | **A "Composition, before anything is styled" section** in `.claude/rules/components.md` and in the product template, nine rules, each one traceable to a finding above |
| The rules existed only in `taste/`, which nothing routed to while a screen was being built | The Request Router row now reads "Building ANY screen or component", and **Non-Negotiable 4 in the always-on brief** states the focal-point and 2.5x type-scale rule outright. A cold-start agent meets it on turn one instead of never |

That last row is the real lesson of this critique. The kit *had* most of these rules,
in `taste/design-taste.md`, and both blind agents built entire screens without ever
opening that file - because nothing pointed there until someone asked for a review.
A rule that only loads during a review is a rule that arrives after the work.


## 2026-09-15 — two blind runs, the briefs that had never had one

Until today the four briefs had six runs between them and only **two** were
blind, both on 2026-08-25 and both on the same two briefs. `data-density` and
`notification-center` had only ever been built inside the session that wrote the
kit, which is the weaker claim. They have a blind run each now.

**What the agents were given.** The project path, the instruction to write one
file, and the brief's own text: the description, the Constraints, and the
Requirements retitled "Acceptance criteria". They were **not** given the "Known
traps" section. Naming the traps is the coaching the protocol rules out - it
would test whether an agent can follow a checklist, not whether the kit carries
its own rules. Recorded here because the protocol asks for provenance, and "what
exactly did it see" is the part that is easy to fudge.

**Both scored 14/14 on first submission**, scored by this runner rather than
taken from the agents' own reports. One of them claimed "18/18" from a list it
assembled itself; the runner has 14 gates, and 14/14 is the number that means
something.

**The five hand-checked requirements, verified here rather than accepted:**

| `data-density` | Evidence |
|---|---|
| `aria-sort` on real buttons | 6 sortable headers, every control a `<button>`, none a div |
| Sorting works from the keyboard | Focus the header button, press Enter: `aria-sort` flips to `ascending` **and** the first row changes from ORD-24188 to ORD-24142. A declared state that also moves the data |
| Non-colour selection cue | Checkbox per row plus the row treatment |
| Long values truncate on purpose | 16 cells carry `text-overflow: ellipsis` with a `title`; longest cell 92 characters |
| Density is deliberate | 4 distinct padding values across cells, not one repeated |

| `notification-center` | Evidence |
|---|---|
| Nothing lost under reduced motion | All 9 rows present and opaque with motion emulated off |
| Type without colour | The words MENTION / BILLING / COMMENT / SYSTEM, each with an icon |
| Relative plus absolute time | "12 minutes ago" with `title="September 15, 2026 at 4:13 PM"` and a machine `datetime` |
| Mark-all-read is affirmative | `btn--primary`, not a danger variant |
| Survives a long body | Longest row measured 349 characters, wrapping cleanly |

**What the runs say about the kit.** Neither agent needed a correction, which is
a different result from the 2026-08-25 pair - those found real bugs in the kit on
their first submission. Two clean passes are weaker evidence than one failure
that exposed something, and they are recorded as such: they show the rules
transfer, not that the kit is finished.

**One gap they did expose.** The `notification-center` agent had to add a
`font.size.5xl` token to its scaffolded project, because the seeded scale stopped
at 2.25rem and could not satisfy the kit's own "display type is at least 2.5x the
body" rule. A new project cannot follow that rule with the scale it is given.
That is a defect in `templates/product-design/design-tokens.json`, found by an
agent that had never seen this repo.
