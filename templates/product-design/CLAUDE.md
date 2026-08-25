# <PRODUCT NAME> — design brief

Replace the placeholders. Keep this file short: it loads on every single turn, so
anything that is not needed every turn belongs in `.claude/rules/` or a skill,
where it loads only when the work actually calls for it.

---

## What we are building

<One paragraph. What the product is, who uses it, what the primary job is. Be
concrete: "a billing console for finance teams who reconcile invoices" beats
"a modern SaaS platform".>

## Who it is for

<The primary user, their context, and the constraint that shapes the UI: on a
phone in a warehouse, on a laptop with 40 tabs open, colour-blind, in a hurry.>

---

## Non-negotiables

1. **Decision order** — User Needs > Accessibility > Consistency > Aesthetics >
   Developer Experience. Never trade a higher one away for a lower one. Beautiful
   but inaccessible is broken.
2. **One theme, one source of truth** — `design-tokens.json` is it. Every screen
   reads the same semantic tokens. No page defines its own palette, and no
   component carries a raw hex, px, or duration.
3. **Zero emoji** — not as an icon, a bullet, a status dot, or decoration; not in
   UI, code, comments, or commit messages. Use a real icon set (lucide, inline
   SVG, `currentColor`) or plain words. Emoji are the loudest tell of
   machine-generated work.
4. **Token by intent** — pick the token whose MEANING matches. Destructive
   actions use the danger token everywhere they appear, never the primary one.
   A blue Delete is a bug.
5. **Every interactive element ships eight states** — default, hover, focus,
   active, disabled, loading, error, selected. A component that only looks right
   at rest is not done.
6. **Never state a quality number you did not measure.** Contrast ratios, "WCAG
   pass", "all states OK" come from running a gate and reporting its real output.
   If it has not been run, the honest answer is "not verified yet".

## How we verify

Run the gate before calling anything done, and report the real `N/N` line:

```
/gate
```

It runs the theme checks against `design-tokens.json` and the render checks
against every harness in `src/components/`. The full command list lives in
`.claude/commands/gate.md`.

The render gates need headless Chrome: run `npm i -D playwright` once in this
project. Without it they print `SKIPPED` and exit 0, which reads like a pass.

Gates prove objective correctness: token consistency, contrast in light and dark,
keyboard operability, target size, reduced motion, responsive behaviour, no
hardcoded values, no emoji. They do NOT prove taste. Screenshot the screen, click
every control, and look before you claim it is right.

---

## Stack

- Framework: <React + Tailwind / Next.js / SwiftUI / ...>
- Components live in: `src/components/`
- Tokens: `design-tokens.json` -> generated CSS variables imported once at the app root
- Icons: <lucide>

## Conventions

Detailed conventions live in `.claude/rules/` and load only when relevant:

- `.claude/rules/components.md` — how a component is structured and named
- `.claude/rules/tokens.md` — how to add or change a token
- `.claude/rules/accessibility.md` — the checks that must pass before merge

## Reference material

- `reference/` — real screens and screenshots to study before designing. Look
  here first; matching an existing pattern beats inventing a new one.
- `public/images/` — real imagery, so prototypes are not full of grey boxes.

## Vocabulary

<Define the handful of domain words this product uses, so the whole team and the
agent name things the same way. Example:

- **Ledger** — an immutable list of postings for one account.
- **Reconciliation** — matching a posting to a bank line.

A shared vocabulary is not decoration; it is what lets the agent name a problem
correctly, and therefore solve it correctly.>
