# Rule: how a component is built here

Loaded when you are creating or changing something in `src/components/`.

## Structure

One component per folder, named in PascalCase, exporting a single named component:

```
src/components/Button/
  Button.tsx          the component
  Button.states.html  a harness that renders every variant x state
  index.ts            re-export
```

The harness is not optional. It is the only way the gates can see hover, focus,
disabled, loading, and error, and the only way you can look at them.

## Naming

- Component: PascalCase (`DataTable`, not `Datatable` or `data-table`).
- Props: named for what they mean, not how they look. `variant="danger"`, not
  `variant="red"`. `isLoading`, not `spinner`.
- Variants: `primary` | `secondary` | `danger` | `ghost`. One action role, one
  variant, everywhere in the product.

## The eight states

Every interactive component ships all eight. A component that only looks right at
rest is not done.

| State | Requirement |
|---|---|
| Default | base tokens |
| Hover | `-hover` token, never a raw colour |
| Focus | visible ring, 3:1 against both neighbours, never `outline: none` alone |
| Active | `-active` token |
| Disabled | `disabled` or `aria-disabled`, no pointer events, still readable |
| Loading | spinner plus `aria-busy`, width does not jump |
| Error | error border plus a message that says how to fix it |
| Selected | `aria-selected` or `aria-current` plus a non-colour cue |

## Non-negotiable while writing one

1. No raw values. No hex, no px, no ms, no font stack. Everything is
   `var(--...)` resolved from `design-tokens.json`.
2. Token by intent. Destructive actions wear the danger token in every place they
   appear, including the confirm dialog. A blue Delete is a bug.
3. No emoji. Icons are lucide, inline SVG, `currentColor`, sized by token.
4. Composition over props. When a component needs a seventh boolean, it is two
   components.
5. Mobile first. It has to survive 280px wide before it earns a desktop layout.
6. Content is hostile. Long unbroken strings, empty lists, one item, forty items,
   a missing image, a number with nine digits. Handle them or the layout breaks
   in production instead of in review.

## Narrow-width defences

A layout that fits at 280px on your machine can overflow on someone else's, because
font metrics differ per platform. Prove it with `--scale=1.25` and know the causes:

1. An `<input>` keeps an intrinsic ~20-character width that sizes its grid column.
   Fix: `inline-size:100%; min-inline-size:0`.
2. A grid or flex item keeps `min-width:auto` and widens its own track. Fix:
   `min-inline-size:0`, or `grid-template-columns:minmax(0,1fr)`.
3. One unbreakable token (an email, a URL, an API key) sets min-content width. Fix:
   `overflow-wrap:anywhere` — `break-word` alone does not shrink min-content.
4. A `white-space:nowrap` tooltip or pill has no upper bound. Fix: `max-inline-size`.

And the one that hides from screenshots: an absolutely positioned `.sr-only` span
with no positioned ancestor resolves against the initial containing block, so inside
a horizontal scroller it lands outside the viewport and inflates the document's
scroll width. Give it a positioned ancestor.

## Before you call it done

```
node scripts/verify_states.mjs     src/components/Button/Button.states.html
node scripts/verify_states.mjs     src/components/Button/Button.states.html --dark
node scripts/axe_audit.mjs         src/components/Button/Button.states.html
node scripts/verify_responsive.mjs src/components/Button/Button.states.html
```

Then screenshot the harness and click every control. The gates prove contrast and
roles. They do not prove that the checkbox actually toggles.
