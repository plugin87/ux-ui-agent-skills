# Rule: Typography and spacing

Loaded when setting type, scale, rhythm, or layout spacing.

Split out of `CLAUDE.md` so it loads only when the work calls for it. The
headings below are unchanged, so any pointer to them still resolves.

---

## Typography Guidelines

### Scale: Major Third (1.25 ratio)
```
xs=12  sm=14  base=16  lg=18  xl=20  2xl=24  3xl=30  4xl=36  5xl=48  6xl=60  7xl=72
```

### Usage Rules
1. **One font family for UI** — Inter (or system-ui) for all interface text
2. **Serif for editorial** — Lora (or Georgia) for blog posts, marketing pages
3. **Mono for code** — JetBrains Mono for code blocks, data values
4. **Heading hierarchy** — h1 is used once per page; headings never skip levels
5. **Line length** — Body text: 45–75 characters per line (65ch optimal). Use `max-width: 65ch`.
6. **Line height** — Headings: tight (1.25). Body: normal (1.5). Caption: normal (1.5).
7. **Font weight** — Regular (400) for body, Medium (500) for labels, Semibold (600) for headings, Bold (700) for page titles only

See composite text styles in `tokens/typography.json` → `textStyle`.

---

## Spacing Guidelines

### Base Unit: 4px
All spacing values are multiples of 4px. The scale:
```
0  2  4  6  8  10  12  14  16  20  24  28  32  36  40  44  48  56  64  80  96
```

### Usage Rules
1. **Outer spacing > Inner spacing** — Container padding > element gaps > element padding
2. **Related items closer** — Related elements share tighter spacing than unrelated
3. **Consistent rhythm** — Establish a vertical rhythm and maintain it throughout the page
4. **Semantic spacing** — Use purpose-named tokens (`card.padding`, `stack.lg`) over raw values

See `tokens/spacing.json` for the full scale and semantic aliases.
