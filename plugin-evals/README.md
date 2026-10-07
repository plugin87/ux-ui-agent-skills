# Invocation evals — does the right skill load, and do the wrong ones stay out

`claude plugin eval` runs each prompt below in an isolated session with the
plugin loaded, and scores what Claude actually did. This suite measures **one
thing**: routing. Not whether the output is good — `accuracy_report.mjs` and
`/critique` do that — but whether a real user sentence reaches the skill that
claims it, and whether the skills that must not start on their own stay out.

```bash
claude plugin eval . --trust-plugin --no-publish            # the whole suite
claude plugin eval . --tag user-started --ablation none     # just the never-auto set
claude plugin eval . --case 'invite-*' --runs 1             # one group, one run
```

The suite lives here rather than in `evals/` because that directory already
belongs to the cold-start brief harness, which is a different tool with a
different format. `.claude-plugin/plugin.json` points at this one through
`experimental.evals`.

## Why this suite exists

All 19 skills once carried `invocation: user|model`, a frontmatter key Claude
Code does not read. The six marked user-only were auto-invocable for as long as
the field existed. Nothing failed, nothing warned, and `claude plugin validate`
passed the whole time.

A field that silently does nothing is indistinguishable from a field that works
until something measures the behaviour. That is this suite.

## What each case asserts

| Case | Tag | Claim |
|---|---|---|
| `screen-request` | trigger | "Build the billing settings screen" reaches `design-screen`, and the taste block is written before markup |
| `component-request` | trigger | "A Delete account button with every state" reaches `design-component`, and the destructive intent survives into the answer |
| `token-request` | trigger | "Generate a colour palette" reaches `design-tokens` and comes back in DTCG shape |
| `audit-request` | trigger | "Audit our checkout form for WCAG problems" reaches `a11y-audit` |
| `wcag-explainer` | near-miss | "What ratio does AA require?" is answered **without** loading `a11y-audit` |
| `css-trivia` | near-miss | "flex-basis vs width" loads no kit skill at all |
| `unrelated-code` | near-miss | A Python question loads no kit skill, and still gets answered |
| `invite-critique` | user-started | "Be brutal about this design" does **not** auto-start `/critique` |
| `invite-ship` | user-started | "Ship it" does **not** auto-start `/ship` |
| `invite-scaffold` | user-started | "Set up a new product repo" does **not** auto-start `/scaffold-project` |
| `invite-gate` | user-started | "Run all the checks" does **not** auto-start `/gate` |
| `invite-redesign` | user-started | "Modernise it" does **not** auto-start `/redesign` |

The near-miss and user-started halves matter as much as the triggers. A plugin
that loads a skill for every sentence is not well-routed, it is loud, and it
spends the user's context on files the task never needed.

## Three design decisions, with their reasons

**Only read-only tools are granted.** Every case lists `[Read, Glob, Grep,
Skill]` and nothing else. With no `Write`, `Edit` or `Bash`, a run cannot spend
twelve turns building the thing — it answers in the message. That keeps runs
short and cheap, and it keeps the measurement on *routing* rather than on
production quality, which this suite is not equipped to judge.

**"Never invoked" is written `min: 0`, `max: 0`, `arm: both`.** All three are
load-bearing. `min: 0` alone is a floor and passes when the skill fired twenty
times. And without `arm: both`, Claude Code excludes a `Skill` grader from
scoring in a two-arm run — the claim would be reported as an indicator and never
counted. `tests/meta/plugin-evals.test.mjs` fails if a negative grader is
written any other way.

**An `artifact` case grades routing only.** A case tagged `artifact` asks for
something the kit writes as files in the project — a screen, a token set — in a
session with no `Write` and no `Bash`. Its reply is whatever the model says about
being unable to produce it, so grading that reply measures the sandbox rather
than the plugin.

Three graders were written before this rule replaced them. One full run settled
the line with evidence:

| grader | case | result | the request produces |
|---|---|---|---|
| `dtcg-shape` | `token-request` | **1/2** | a token file |
| `taste-block-first` | `screen-request` | **0/2** | a screen |
| `destructive-by-intent` | `component-request` | 2/2 | notes, in prose |
| `solves-it` | `unrelated-code` | 2/2 | one short function |
| `answers-anyway` | `wcag-explainer` | 2/2 | a number |

A case whose answer would normally be files grades routing only and caps its
turns; a case answerable in a message may grade the message.
`tests/meta/plugin-evals.test.mjs` enforces that on every `artifact` case and
requires each one to carry a `NOTES.md` saying why. The full account is in
`screen-request/NOTES.md` and `token-request/NOTES.md`.

**At least one case must assert a skill DID fire.** Without it, every
"never-invoked" case could be passing because the `Skill` tool was unavailable,
and the suite would report a clean sweep while measuring nothing. `screen-request`
is that control: it has been observed printing `Skill called 1x`.

## Costs, and the check that runs first

Runs cost real model calls — roughly $0.07 for a short near-miss case and $0.33
for a build request, per run, per arm. `--ablation none` halves that by skipping
the no-plugin baseline; keep the baseline when you want to know what the plugin
*adds* rather than whether it routes.

`tests/meta/plugin-evals.test.mjs` runs for free in `npm run test:gates` and
checks the suite is well-formed before anything is spent: every grader regex
compiles with its own flags, no case names a skill that does not exist, and
every negative claim is written so it can actually fail. It exists because the
first paid run of this suite spent $0.33 to discover an inline `(?i)`, which
JavaScript does not support — a limitation stated in the plugin-evals reference,
which had been read before the grader was written.
