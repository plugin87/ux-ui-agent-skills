# reference/

Real screens for the agent to study before designing or reviewing.

Drop actual screenshots, exported mockups, or competitor/inspiration captures
here. When you ask for a build, a redesign, or an image-to-code pass, point the
agent at a file in this folder so it works from real pixels and real context
instead of guessing.

## What goes here

- Screenshots of the current product (the thing being redesigned).
- Reference mockups or Figma exports you want matched.
- Inspiration captures that set the aesthetic direction.

## What does NOT go here

- Generated output — that lives in `examples/`.
- Design tokens — those live in `tokens/` (the source of truth).
- Anything with secrets or private customer data.

## How the agent uses it

- `image-to-code` infers the design system from a reference, maps it to the
  3-tier tokens, rebuilds it, then verifies with the gates.
- `redesign` audits the current screen here first, then applies taste surgically.
- `design-review` scores against the real screen, not a description.

Files here are studied, not shipped. Keep them current so the agent's context
matches reality.
