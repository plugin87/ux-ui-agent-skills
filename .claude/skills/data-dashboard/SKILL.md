---
name: data-dashboard
description: Build a dense, data-heavy screen - an analytics console or a trading terminal - with real charts drawn from tokens: candlestick, volume, depth, stacked area, waterfall, scatter, correlation matrix, donut, gauge, sparklines, heatmaps and order books. Use when the request is a dashboard, terminal, monitoring view, data console, or any screen whose job is to show many numbers at once. Covers the layout sequence, the SVG geometry, the accessibility contract per chart type, and the contrast traps that only appear in dark mode.
invocation: model
---

# Skill: Data dashboard

A dashboard is the hardest screen to keep honest: it is dense, it is mostly
non-text, and almost every default makes it worse. This is the recipe that
produced `examples/showcase/` and `examples/terminal/`, both of which pass every
gate in both themes.

## 1. Decide the brief before drawing anything

Answer these in one line each, or `/grill-me` them out of the user:

- **Who reads this, and what decision do they make from it?** A revenue console
  for an operator and a trading desk for a dealer look nothing alike.
- **What is the one number that leads?** A dashboard without a lead is a wall.
- **What is the update cadence?** Hourly figures get a "last run" line. Live
  figures get a tape and a timestamp per row.
- **How dense is honest?** A terminal earns 12 panels. A weekly report does not.

## 2. Layout sequence, not a grid of equal cards

Four equal stat cards is the single loudest tell that nobody designed this.
Compose in bands, each a different shape:

| Band | Content | Why |
|---|---|---|
| 1 | Hero metric at 3x body size + its own chart, spanning most of the width | The eye lands once |
| 2 | Two or three secondary figures, stacked or narrow | Quiet by construction |
| 3 | Three **different** chart shapes side by side (donut, ranked bars, sparklines) | Variety reads as intent |
| 4 | A table that really sorts, plus a feed or log | Detail after summary |
| 5 | A footer line that ends the page | A page must end on purpose |

Use a 12-column grid with explicit spans (`span 8` / `span 4`), collapsing to 6
then 1. Never `repeat(auto-fit, …)` for the primary bands - it produces exactly
the equal-card wall you are avoiding.

## 3. The chart inventory

All of these are plain inline SVG with `viewBox`, sized by CSS, filled from
`--color-chart-*`. No chart library, no runtime dependency.

| Chart | Geometry | Use it for |
|---|---|---|
| Bar / column | `<rect>` per bucket, `rx` for a soft corner | Discrete periods |
| Candlestick | `<line>` wick + `<rect>` body per period, class by up/down | OHLC price |
| Volume | Bars under the price chart, same x-scale, `opacity:.45` | Conviction behind a move |
| Moving average | `<polyline>` over the candles, 2px, round joins | Trend through noise |
| Line / sparkline | `<polyline>`, `pathLength="1"` for a draw animation | Trend in a cell |
| Area / stacked area | `<path>` per band: forward along the top, **reverse along the previous baseline**, close | Composition over time |
| Depth | Two cumulative area paths mirrored around the mid | Book liquidity |
| Waterfall | Floating `<rect>` per step + dashed connectors between levels | Attribution |
| Donut | `<circle>` with `stroke-dasharray` and `rotate()` per segment | Share of a whole, 3-5 slices |
| Radial gauge | Same trick, `stroke-linecap:round`, 270-degree sweep | One value against a limit |
| Scatter / bubble | `<circle>`, radius = third dimension | Two measures plus weight |
| Correlation matrix | HTML table, cell tint via `color-mix` | Pairwise relationships |
| Heatmap | HTML table or `<rect>` grid, tint by value | Cohorts, calendars |
| Order book | HTML table with a depth bar per row | Bids and asks |

**Generate the geometry, do not hand-place it.** Write a small deterministic
script (a seeded walk) that emits the SVG elements, then paste the output in.
Hand-typed coordinates drift and cannot be regenerated.

## 4. Domain correctness is part of craft

Gates cannot catch a chart that is drawn beautifully and means nothing. Check by
hand:

- A **correlation matrix is symmetric** and its diagonal is exactly 1. Random
  values in both triangles is an instant tell to anyone who reads one for a living.
- A **stacked area** sums to the total; bands must not cross or leave gaps. The
  usual bug is reversing the baseline by index instead of by coordinate, which
  shows as dark wedges between bands.
- A **waterfall** needs connectors, and the closing bar must equal opening plus
  the steps.
- **Depth** rises away from the mid on both sides; it never falls.
- A **donut** whose segments do not total the whole is a pie chart lying.

## 5. Accessibility contract, per chart

- Every SVG gets `role="img"` plus either `aria-label` or `<title>`+`<desc>`
  referenced by `aria-labelledby`. Say what the chart **shows**, not that it is a
  chart: "Range 182.06 to 200.10, closing at 187.84" beats "price chart".
- Never encode meaning in colour alone. Green with a `+` and an arrow; red with a
  `-`. Up and down also carry a word in the table cell.
- Tables get `<caption>` (use `.sr-only` when the panel header already says it),
  `scope="col"` / `scope="row"`, and `aria-sort` only if clicking really sorts.
- Sortable headers, range tabs and theme toggles all declare state - so they must
  change it on a real click. `verify_interactive.mjs` clicks them and checks.

## 6. The traps that only appear when you measure

Every one of these was found by a gate on a screen that looked finished:

- **A chart palette is not a text palette.** White initials on `--color-chart-4`
  measured **2.65:1** in dark. Chart colours are tuned for large filled shapes.
- **Success green as text on a raised surface measured 4.43:1** - four
  hundredths short of AA. Put the colour on the icon and the sign; keep the text
  neutral.
- **axe must not run mid-transition.** Disable transitions before flipping the
  theme, or contrast is sampled while colours are still moving.
- **Dense tables do not fit a phone.** Drop the column a phone can lose - the
  sparkline, the derived value - in a media query, and say so in a comment. Do
  not shrink type below the scale.
- **Stagger comes from a token:** `calc(var(--duration-fast) * 0.6 * n)`, never a
  typed millisecond.

## 7. The loop

```bash
node scripts/measure_render.mjs <file> && node scripts/measure_render.mjs --dark <file>
node scripts/verify_states.mjs <file>  && node scripts/axe_audit.mjs --dark <file>
node scripts/verify_responsive.mjs <file> --scale=1.25
node scripts/verify_interactive.mjs <file>
node scripts/slop_tells.mjs --strict <file> && node scripts/taste_audit.mjs --strict <file>
```

Then **screenshot it and look**, in both themes, at 1600 and 390 wide. The gates
will pass a chart that is drawn wrong. A correlation matrix that is not
symmetric is 16/16 green and still embarrassing.

Worked references, both gate-verified: `examples/showcase/index.html` (revenue
console) and `examples/terminal/index.html` (trading desk, ten chart types).
