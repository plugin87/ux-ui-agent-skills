# Token Build Pipeline

Transform the DTCG token files in `tokens/*.json` into platform-ready artifacts (CSS variables, JS/TS objects, iOS/Android resources, Tailwind theme). The JSON is the **single source of truth**; every platform output is generated, never hand-edited.

---

## Architecture

```
tokens/*.json  (DTCG $type/$value — source of truth)
      │
      ▼  transform (resolve aliases, flatten, format per platform)
┌─────────────┬─────────────┬──────────────┬───────────────┐
│ web         │ tailwind    │ iOS          │ Android        │
│ :root vars  │ @theme      │ Asset Catalog│ colors.xml /   │
│ + JS/TS     │ (v4)        │ + Swift ext  │ Compose theme  │
└─────────────┴─────────────┴──────────────┴───────────────┘
```

## Tooling options

| Tool | Use when |
|------|----------|
| **Style Dictionary** | The standard. Reads DTCG, custom transforms/formats per platform. Best for multi-platform output. |
| **Tokens Studio** (Figma plugin) | Designers own tokens in Figma; export DTCG JSON → feed this pipeline. Round-trips with `workflows/figma-integration.md`. |
| **W3C DTCG export** | Our files already conform — interop with any DTCG-compatible tool with no conversion. |
| **Custom script** | Small systems: a Node/Python transform (see `scripts/validate_tokens.py` for the parse model). |

## Resolution rules (any tool must honor)

1. **Resolve aliases** — `{semantic.action.primary}` → `{primitive.blue.600}` → `#2563EB`. Flatten to final values per platform; keep the reference graph for docs.
2. **Respect tiers** — emit semantic + component tokens for consumption; primitives are internal (don't expose as the public API).
3. **Theme/mode** — generate a base set + overrides for dark mode (`[data-theme="dark"]`) and each brand/density (`tokens/theming.json`). Don't duplicate unchanged values.
4. **$type-aware formatting** — `color` → hex/rgb/UIColor; `dimension` → rem/px/pt/dp; `duration` → ms/seconds; `cubicBezier` → easing string/curve.

## Output targets

- **Web CSS:** `:root { --color-action-primary: #2563EB; … }` + `[data-theme="dark"]` overrides (matches `frameworks/adapters/vanilla-css.md`).
- **Tailwind v4:** `@theme { --color-action-primary: …; }` so utilities map to tokens (CLAUDE.md React+Tailwind).
- **JS/TS:** typed object/`as const` for CSS-in-JS and native (`frameworks/adapters/css-in-js.md`).
- **iOS:** Asset Catalog color sets + `Color.DS`/`Font.DS`/`Spacing` extensions (`frameworks/swiftui.md`).
- **Android:** `colors.xml`/`dimens.xml` or a Compose `Theme` object (`frameworks/adapters/jetpack-compose.md`).

## CI integration

- On change to `tokens/*.json`: run `scripts/validate_tokens.py` (valid JSON + aliases resolve), regenerate all platform artifacts, fail the build if generated output is stale (committed artifacts must match a fresh build).
- Run `scripts/contrast.py` to gate color changes against WCAG before publishing.
- Version artifacts with the system (`workflows/governance.md`).

## Verification
- `scripts/validate_tokens.py` passes (no unresolved aliases).
- Regenerating produces no diff against committed artifacts.
- Dark/brand/density outputs contain only the deltas, not full duplicates.
