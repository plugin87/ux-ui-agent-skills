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
