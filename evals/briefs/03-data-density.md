# Dense data table

Cold-start brief. The agent gets this text and the kit, nothing else.

## The brief

Build an orders table for an operations team: sortable columns, row selection,
per-row actions, pagination, and a filter bar. It is used all day on a laptop and
occasionally checked on a phone. One HTML file, light and dark.

## Constraints

- Every value comes from the shared token theme.
- The table must remain usable at 320px: no horizontal page scroll, no clipped
  text without an explicit ellipsis and title.
- Sorting and selection are operable from the keyboard.

## Requirements (checked by a human, or by /critique)

- Column headers announce sort state (aria-sort), and the sort control is a real
  button, not a click handler on a div.
- Row selection has a non-colour cue as well as a colour one.
- Long values (an 80-character customer name, a nine-digit total) truncate on
  purpose with a title, or wrap. They never silently disappear.
- Density is deliberate: row height, column padding, and the filter bar do not
  all share one spacing value.
- The empty result of a filter is a real message, not a blank table body.

## Known traps

Generated versions usually: overflow the page at 320px, clip text with no
ellipsis, use one padding value everywhere, and make the whole row a click target
with no keyboard equivalent.
