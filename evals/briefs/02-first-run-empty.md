# First run and empty states

Cold-start brief. The agent gets this text and the kit, nothing else.

## The brief

Build the first-run experience for a project tool: the dashboard a user sees
before they have created anything, plus the same dashboard with one project and
with forty projects. One HTML file per state, light and dark.

## Constraints

- Every value comes from the shared token theme.
- No placeholder copy. No lorem ipsum, no "Item 1", no "No data".
- The primary action is reachable by keyboard and is the visual focal point.

## Requirements (checked by a human, or by /critique)

- The empty state explains the value and names the first action, in that order.
- The one-project state does not look broken, and the forty-project state does
  not overflow or become an undifferentiated grid.
- Loading is represented honestly (skeleton or progress with aria-busy), not by a
  frozen screen.
- Nothing is conveyed by colour alone.
- The illustration or icon is a lucide icon or real SVG, never an emoji.

## Known traps

Generated versions usually: ship "No data" as the empty state, use an emoji as
the illustration, make the forty-item state a wall of identical cards, and forget
the single-item case entirely.
