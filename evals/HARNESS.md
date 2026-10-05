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
| H4 | Verification receipts | **0** (no instrument) | needs `scripts/gate.mjs` |
| H5 | Blind first-pass, per route | **0.333** | `evals/RESULTS.md` |
| H6 | Critic catch rate | **0** (no instrument) | needs `tests/fixtures/critic/` |
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

| route | before | after |
|---|---|---|
| plugin | 0 / 156 (0.0%) | **133 / 156 (85.3%)** |
| init | 124 / 156 (79.5%) | **152 / 156 (97.4%)** |
| skills-add | 0 / 156 (0.0%) | **133 / 156 (85.3%)** |
| **H1** | **0.265** | **0.8932** |

Harness Score 0.086 → **0.175**. Only H1 moved; the other six are untouched.

The 23 references still unresolved on the plugin route are all in the five
commands and the design-critic agent, which have no `CLAUDE_SKILL_DIR` of their
own. That is the next commit, not a limitation of this approach.

---

## Re-measuring

```bash
python3 scripts/measure_install_paths.py          # H1
ls hooks/ 2>/dev/null; grep -c hooks .claude/settings.json   # H3
```

The rest become measurable as their instruments land. Record each new baseline
in this file on the day the instrument first runs, so a later improvement is
compared against a real starting number and not against a zero that only meant
"we had not looked yet".
