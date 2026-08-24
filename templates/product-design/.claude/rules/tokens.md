# Rule: how to add or change a token

Loaded when you are touching `design-tokens.json` or a theme file.

## The three tiers

```
component   button-bg-primary  ->  {semantic.action.primary}    used in components
semantic    action.primary     ->  {primitive.brand.600}        used in design
primitive   brand.600          ->  #2563eb                      never used directly
```

A component never reads a primitive. If a component needs a colour that has no
semantic name yet, the missing thing is the semantic name, not permission to
reach one tier down.

## Adding a token

1. Does a semantic token already mean this? Use it. Two names for one meaning is
   how a design system dies.
2. Name it for purpose, not appearance: `feedback.error-text`, not `red-dark`.
   The shape is `{category}.{property}.{variant}-{state}`.
3. Add the light value and the dark value together. A token that exists in only
   one theme will ship broken in the other.
4. DTCG format, always `$type` and `$value`, alias with `{dotted.path}`.

## Changing a token

Change it here, in one place, and let every screen follow. If a screen needs a
different value, that is a new semantic token or a theme override, never a local
hex.

## Dark mode

Primitives do not change between themes. The swap happens at the semantic tier
via `[data-theme="dark"]`. Light surfaces carry dark text and dark surfaces carry
light text, and both have to pass contrast before the change counts as made.

## After any edit

```
python3 scripts/validate_tokens.py   design-tokens.json     aliases resolve, JSON parses
python3 scripts/validate_contrast.py design-tokens.json     WCAG on the source, light and dark
node    scripts/build_tokens.mjs --in design-tokens.json --out src/theme.css
python3 scripts/validate_theme_refs.py src/theme.css src    every var(--...) resolves
python3 scripts/lint_hardcodes.py src                       nothing bypassed the theme
```

Or run all of them plus the render gates with `/gate`.

Report the real output. A contrast ratio you did not measure is not a number, it
is a guess.
