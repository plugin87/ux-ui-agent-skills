# XIAS brand marks

Two directions, both generated from `tokens/colors.json` rather than drawn by
hand, so the geometry is exact and the colours trace to the token source.

## Y2K chrome — the primary set

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

## Regenerating

Both sets come out of generator scripts rather than an editor, so the maths is
reproducible and the colours cannot drift from the tokens. The generators are
not committed; the SVGs are small and readable enough to edit directly, and a
generator nobody runs is a file that rots.
