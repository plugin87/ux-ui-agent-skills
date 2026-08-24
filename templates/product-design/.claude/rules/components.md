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

## Before you call it done

```
node scripts/verify_states.mjs     src/components/Button/Button.states.html
node scripts/verify_states.mjs     src/components/Button/Button.states.html --dark
node scripts/axe_audit.mjs         src/components/Button/Button.states.html
node scripts/verify_responsive.mjs src/components/Button/Button.states.html
```

Then screenshot the harness and click every control. The gates prove contrast and
roles. They do not prove that the checkbox actually toggles.
