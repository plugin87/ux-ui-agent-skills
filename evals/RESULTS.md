# Eval results

One row per run. A run is only worth recording with its provenance attached: who
built the output, and whether they could see the kit's internals while doing it.

| Date | Brief | Provenance | Objective | Requirements | Notes |
|---|---|---|---|---|---|
| 2026-08-25 | `billing-settings` | In-session (contaminated, see below) | **13/13** after 4 rounds; **8/13** on the first submission | 6/6 by hand | Five gate failures on the first pass, all real |
| 2026-08-25 | `first-run-empty` | In-session (contaminated) | **13/13** first submission | 5/5 by hand | Clean pass, and that is the point: see "what a repeat run proves" |
| 2026-08-25 | `data-density` | In-session (contaminated) | **13/13** after 1 round; **10/13** first | 5/5 by hand | Column labels 4.24:1 on the raised header row, dark only |
| 2026-08-25 | `notification-center` | In-session (contaminated) | **13/13** after 1 round; **11/13** first | 5/5 by hand | Same 4.24:1 pair again, this time on the unread row |

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
