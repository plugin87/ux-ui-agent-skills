---
name: design-component
description: Design a UI component spec to the house quality bar — anatomy, variants, sizes, the 8 states, token mapping, and accessibility. Use when the user wants to design or document a component (button, input, tabs, toast, combobox, date picker, modal, etc.) at the spec level before or alongside code. For generating framework code, use design-code.
---

# Skill: Design Component

Produce a complete component specification matching the project format.

## Steps
1. Read `CLAUDE.md` → "Component Guidelines" (quality bar, the 8-state table) and "Atomic Design".
2. Check if it already exists: `components/atoms.md`, `molecules.md`, `organisms.md`, `templates.md`, `navigation.md`, `feedback.md`, `forms-advanced.md`, `overlays.md`. Match the existing spec format.
3. Pull the ARIA pattern from `accessibility/aria-patterns.md` and contrast/target rules from `accessibility/wcag-checklist.md`.
4. Map every value to tokens (`tokens/*.json`) — sizes via `sizing.json`, states via `states.json`.
5. Apply visual judgment from `taste/design-taste.md` (states, focus, no slop).
6. Optional fast start: `python3 scripts/scaffold_component.py "<Name>"` to emit a stub, then fill it in.

## Output
Spec with: anatomy diagram, variants table, sizes table, all 8 applicable states, token mapping, accessibility (role/keyboard/SR), and a note to render via `frameworks/adapter-protocol.md`.

## Accuracy — verify every state, don't assume (mandatory when code is produced)
A component is only "correct" when **every variant × state** renders right — not just the resting default. Build a **states harness**: render the component in each applicable state (default, hover, focus, active, disabled, loading `aria-busy`, error `aria-invalid`, selected `aria-pressed`/`aria-selected`) × each variant in one HTML file (see `examples/component-states/button.html`). Then RUN the gates and report their real output (CLAUDE.md → Verification Protocol):
- `node scripts/verify_states.mjs <harness> [--dark]` — contrast of every element in default/hover/focus
- `node scripts/axe_audit.mjs <harness> [--dark]` — ARIA/role/name/label correctness
- `node scripts/measure_render.mjs <harness> [--dark]` — every text element AA
- overlays/modals also: `node scripts/verify_focustrap.mjs <harness> --open=<trigger>`
Every state must pass in light AND dark before the component is "done". Never claim a state is correct without a gate proving it.

## Gates prove contrast/a11y — they do NOT prove pixels. RENDER AND LOOK.
The contrast/axe gates pass while the UI is still visibly broken: a checkbox that doesn't toggle, a dash sitting at the bottom of its box, a checkmark and an indeterminate dash with mismatched stroke weight, a control that's too heavy. **You must screenshot the harness and inspect it** before claiming done — for every state, and after interaction. Playwright + system Chrome:
```js
const b = await chromium.launch({channel:'chrome'});
const p = await b.newPage({deviceScaleFactor:4});
await p.goto('file://'+abs); await p.addStyleTag({content:'*{transition:none!important}'});
await p.mouse.move(2000,2000);                 // park pointer OFF the component
await p.locator('.stack').first().screenshot({path:'/tmp/x.png'});
```
Read the PNG. Then look for, specifically:
- **Functional**: click each interactive element and assert the state actually changed (`await loc.click(); expect(await loc.isChecked())`). A custom control whose overlay box covers the real `<input>` will not toggle unless the box has `pointer-events:none` (or an enclosing `<label>` forwards the click).
- **Geometry**: glyphs centered, not stacked/offset. If a `display:grid` box holds an `opacity:0` sibling plus a `::after`, the pseudo lands in row 2 → use `display:none` on the hidden sibling, or one container child.
- **Stroke consistency**: a checkmark and its indeterminate dash must use the **same** rendering method (one `<svg>`, two `<path>` toggled by state — same `stroke-width`), never an svg check vs a CSS `::after` rect (they read as different weights).
- **Transition artifact**: screenshot WITHOUT disabling transitions and a just-clicked control looks half-faded mid-animation — that is not a bug. Always disable transitions and park the pointer before judging a state.

**Consistency across files is non-negotiable.** The same component (e.g. checkbox) must use byte-identical CSS + markup in every harness/page. A checkbox that looks thin in `form-controls` and heavy (native `accent-color`) in `data-table` is a bug. Factor one pattern, reuse it verbatim.

### Verified custom checkbox/radio pattern (thin, token-driven, gated + eyeballed)
Real `<input>` underneath (keeps native a11y + keyboard); a drawn `.box` overlay with `pointer-events:none`; check + dash as two `<path>` in one `<svg>` toggled by `:checked` / `:indeterminate`; 1.5px `border-strong`, `.25rem` radius, `.62rem` glyph, `stroke-width:2` round caps. Reference: `examples/component-states/form-controls.html` and `data-table.html` (select-all uses `indeterminate`). Native `accent-color` renders too heavy — do not use it when the house look is "thin".

## Responsive — every component, no sideways scroll (gated)
Build mobile-first; a fixed-px width that can't shrink is a bug. Run `node scripts/verify_responsive.mjs <file|dir>` — it loads each harness at 280/320/414px and fails on any horizontal overflow. The four recurring causes and their fixes:
- **fixed `inline-size:Npx`** → `inline-size:100%;max-inline-size:Npx` (cap, don't pin).
- **`<ul>`/`<ol>` default 40px inline-start padding** (a `*{margin:0}` reset does NOT clear padding) → `padding:0;margin:0` on every list. This also silently mis-aligns a list's edge vs a sibling block (looks like unequal widths) — same fix.
- **non-wrapping flex rows** (breadcrumb, stepper, tabs) → `flex-wrap:wrap`, or for tabs `overflow-x:auto` + `.tab{flex:none}`.
- **`grid minmax(Npx,1fr)` min larger than viewport** → `minmax(min(Npx,100%),1fr)`.

## Motion — tokenized, real easing, animate the thing that moves
Timing/easing are tokens (`--duration-fast|normal|slow`, `--ease-out|in|in-out|emphasized` in the theme; `--transition-micro` = `fast ease-out`). Never hardcode ms/curves. A component that toggles open/closed must animate its **height**, not just rotate a chevron — collapse via `hidden`/`display:none` alone reads as "rigid, no transition". Smooth-height pattern (no JS measuring): wrap content in an inner that clips overflow, animate the grid track:
```css
.panel{display:grid;grid-template-rows:0fr;transition:grid-template-rows var(--duration-normal) var(--ease-emphasized)}
.panel.open{grid-template-rows:1fr}
.panel > .inner{overflow:hidden;min-block-size:0}
```
Keep a11y: expand = remove `hidden` then add `.open` next frame; collapse = remove `.open`, set `hidden` on `transitionend`. Reference: accordion in `examples/component-states/overlays.html`. Always honor `@media(prefers-reduced-motion:reduce){…transition:none}`.

## Layout — fill the space, don't ship AI-empty filler
- **`auto-fit`, never `auto-fill`** for card grids. `auto-fill` keeps empty phantom tracks so 3 cards cluster left with a void on the right; `auto-fit` collapses empties so cards stretch to fill the row. Always `repeat(auto-fit,minmax(min(Npx,100%),1fr))`.
- **Equal-height panels in a row**: `align-items:stretch` on the grid, AND make the shorter panel's body fill — `.panel{display:flex;flex-direction:column}` + the inner region `flex:1`. A child sized with `block-size:%` (e.g. chart bars) needs a **definite-height** ancestor (a `flex:1` box or explicit height), or the % resolves to 0 and the element collapses. Wrap the bar in a `flex:1` `.barbox` and give the bar `block-size:%` of that.
- **A main region that's 80% whitespace reads as machine-generated.** Fill a dashboard with real, plausible content (stats row + activity list + a chart), not one lonely widget. Intentional density is the difference between "designed" and "AI slop".
- **Trailing gap in a toolbar/header**: a flex item with `flex:1` capped by `max-inline-size` stops growing and leaves empty space *after* the last item. Push the right-hand cluster with `margin-inline-start:auto` on its first element.
- **Mobile nav must not overlap.** Putting the sidebar and main in the same grid area makes an opened sidebar paint over content. On mobile switch the shell to `display:block` so opening the sidebar pushes main *down*. Reference: `examples/component-states/app-shell.html`.

## Icons — real lucide, referenced by name (never hand-draw paths)
Hand-approximated SVG path data renders as broken glyphs (a help "?" became a dot; settings became a hamburger). Use **verbatim lucide** paths, referenced by name via an injected `<symbol>` sprite — `examples/component-states/icons.js` defines each icon once and `<svg class="ico" aria-hidden="true"><use href="#i-NAME"/></svg>` uses it. No per-use path duplication, no network, offline + gate-safe. Add a new icon to `icons.js` once; never paste raw paths into markup. (Inline lucide is acceptable only if the path is copied verbatim from lucide.) `.ico{stroke:currentColor;fill:none;stroke-width:2}` — color via `currentColor`.

## Graphical / icon-only controls (3:1, theme-stable)
A no-text control (carousel dot, kebab, icon button) is held to **3:1** (WCAG 1.4.11), not 4.5 — `verify_states` applies this automatically when an element has no direct text node. Two traps it catches:
- An empty `<button>` keeps the UA `color:buttontext` (≈black) regardless of theme → set its `color` to the actual indicator color and drive the visual via `currentColor` (e.g. dot is a `::before{background:currentColor}`), so the gate measures the real thing.
- **Theme-flipping tokens** (`--color-chart-N`, `--color-surface-brand`) invert between light/dark; white text or a teal indicator on them passes in one mode and fails the other. Use **dark-aware** values (override in `[data-theme="dark"]`) or **stable** tokens (`--color-action-primary`, `--color-text-link` which adapts) for avatars, active dots, and selected states.
