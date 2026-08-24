# Notification centre

Cold-start brief. The agent gets this text and the kit, nothing else.

## The brief

Build a notification centre: a list of notifications with unread state, type
(mention, comment, system, billing), relative timestamps, filters, a mark-all-read
action, and an entrance animation when new items arrive. One HTML file, light and
dark.

## Constraints

- Every value comes from the shared token theme, motion included.
- Motion respects prefers-reduced-motion, and no content is visible only after an
  animation runs.
- Unread state is not communicated by colour alone.

## Requirements (checked by a human, or by /critique)

- Under prefers-reduced-motion, every notification is still present and readable.
  Content that only appears via an entrance animation is a fail.
- Notification type is distinguishable without colour: an icon, a label, or both.
- Timestamps are relative and readable ("2 hours ago"), with the absolute time
  available on hover or in a title.
- Mark all as read is not destructive styling, and is disabled with a reason when
  there is nothing unread.
- The list survives a 200-character notification body and an empty list.

## Known traps

Generated versions usually: reveal items with an entrance animation that the
reduced-motion branch never turns on, signal unread with a coloured dot alone,
use emoji for the notification type, and animate for 600ms.
