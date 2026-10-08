# XIAS brand marks

Generated rather than drawn, so the geometry is exact and reproducible.

## Stacked rainbow — the primary set

| File | Use |
|---|---|
| `xias-90s.png` / `.svg` | wordmark on dark, 1100x520 |
| `xias-90s-light.png` / `.svg` | the same on white |
| `xias-mark-90s.png` / `.svg` | square mark, the X alone |

The 90s poster trick: one word drawn seventy-two times, each copy a step
further down, with a flat white face on top.

Two things decide whether it works, and both were wrong first:

**Draw order is the whole job.** The deepest, palest copy goes down FIRST. The
first attempt reversed the array, which put the pale blue on top and printed a
second ghost word beneath the real one.

**Bands, not a gradient.** The effect is contour lines - thirteen solid steps
with a hard edge between them. Interpolating smoothly across seventy-two layers
makes a gradient wash and the look is gone. So the layer count stays high
enough that copies overlap without gaps, and the *colour* is quantised to
thirteen steps. Many layers, few colours.

The form is centred on caps-plus-stack, not on the baseline. Centring the
baseline hangs the extrusion off the bottom edge.

Two directions, both generated from `tokens/colors.json` rather than drawn by
hand, so the geometry is exact and the colours trace to the token source.

## Y2K chrome — alternate

| File | Use |
|---|---|
| `xias-y2k-silver.svg` | wordmark, 900x420, dark background |
| `xias-y2k.svg` | the same in the kit's action blue |
| `xias-mark-y2k.svg` | square mark, 512, for an avatar |
| `xias-mark-y2k-blue.svg` | the same in blue |

The look is specific enough to name so it can be judged: a metal wordmark the
way it was done between roughly 1996 and 2004. A **hard horizon line** across
the middle of every letter, sky above and ground below, a blown-out specular
band, a dark keyline, and a stepped extrusion underneath. The horizon is the
whole effect: a smooth ramp reads as a modern gradient, a break at 50% reads as
metal.

The perspective grid converges on one vanishing point, and its rows crowd toward
the horizon rather than spacing evenly, which is what makes a flat plane recede.
The first version fanned its lines from the wrong origin and read as a starburst.

Legible down to **32px**. At 16 it is a smudge, as any mark with a horizon
would be; use a flat glyph at that size.

## Isometric blocks — the alternate

| File | Use |
|---|---|
| `xias-logo.svg`, `xias-logo-dark.svg` | wordmark lockup |
| `xias-mark.svg`, `xias-mark-dark.svg` | square mark |

Five cubes in an X with a sixth stacked at the crossing, in true 2:1 isometric.
Two things in it are easy to get wrong and were, at first:

**Isometric sends the grid axes to the screen diagonals.** A diagonal in grid
space projects to an upright plus. The X you see is a grid-aligned cross.

**Cubes placed edge to edge fuse into one mass** — adjacent top faces share a
value and the eye reads a blob. The gap between them is what makes the shape
legible.

The accent cube is stacked above the crossing so nothing occludes it. On the
flat version it sat behind the front cube and the idea was lost. That is the
kit's own composition rule — one thing leads — applied to its own mark.

## No indigo-to-blue gradient

`scripts/slop_tells.mjs` calls that "the single most common generated-UI tell"
and fails a build for it. A logo built from one would be the project
contradicting itself on its own front page.

The isometric set uses **flat faces at three distinct values**, which is how
isometric light actually works. The chrome set uses a gradient on purpose, and
it is a metal ramp with a hard horizon, not a two-stop violet wash.

## PNG beside every SVG, and why the README uses it

The SVGs are the source. The README embeds the **PNG**, because two things in
the SVG are not safe to rely on where it will be seen:

- **`font-family: Impact`.** The wordmark is live `<text>`, so a machine without
  Impact substitutes something else and the logo is a different logo. A mark has
  to render the same everywhere or it is not a mark.
- **`<use href>`.** GitHub sanitises SVG it serves in a README, and `<use>` is
  the kind of element that gets stripped. The extrusion and the wordmark are
  both built from it, so a strip leaves the background and nothing else.

The PNGs are rendered from the SVGs at 2x on a machine that has the font, so the
type is baked and nothing depends on the viewer. Use the SVG where you control
the renderer, the PNG everywhere else.

## Regenerating

Both sets come out of generator scripts rather than an editor, so the maths is
reproducible and the colours cannot drift from the tokens. The generators are
not committed; the SVGs are small and readable enough to edit directly, and a
generator nobody runs is a file that rots.
