# Eval results

One row per run. A run is only worth recording with its provenance attached: who
built the output, and whether they could see the kit's internals while doing it.

| Date | Brief | Provenance | Objective | Requirements | Notes |
|---|---|---|---|---|---|
| 2026-08-25 | `billing-settings` | In-session (contaminated, see below) | **13/13** after 4 rounds; **8/13** on the first submission | 6/6 by hand | Five gate failures on the first pass, all real |

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
