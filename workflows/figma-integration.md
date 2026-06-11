# Figma Integration

Keep design (Figma) and code (this repo) in sync in both directions. The token JSON is the source of truth; Figma Variables mirror it. Drift between the two is the root cause of "the build doesn't match the mockup."

---

## Token ↔ Variable mapping

| This repo (DTCG) | Figma |
|------------------|-------|
| `primitive.*` | Variables in a **Primitives** collection (raw values) |
| `semantic.*` | Variables in a **Semantic** collection, aliased to primitives |
| `component.*` | Variables scoped per component, aliased to semantic |
| dark / brand / density | Figma **Modes** on the relevant collection (`tokens/theming.json`) |
| `$type` color/dimension/number | Figma variable type Color / Number / String |

Mirror the 3-tier hierarchy as three collections with aliasing — the same indirection we use in code, so a primitive change propagates identically in both tools.

## Sync directions

- **Code → Figma (publish):** transform `tokens/*.json` → Figma Variables import (via Tokens Studio or the Variables REST API). Use when engineering owns tokens.
- **Figma → Code (extract):** designers manage Variables; export DTCG JSON (Tokens Studio export or REST `GET variables`) → overwrite `tokens/*.json` → run `scripts/validate_tokens.py`. Use when design owns tokens.
- **Pick one direction as authoritative** to avoid merge conflicts; the other side is generated. Round-trip through DTCG keeps both lossless.

## Figma MCP (when available in the session)

If a Figma MCP server is connected, prefer its tools/skills over manual steps:
- **Read design → code:** pull frames, variable definitions, and screenshots to implement against the real spec (don't eyeball pixels).
- **Build/library in Figma:** generate Variables and components from this repo's tokens/specs (3-tier collections, modes, variant sets) following the server's own skills.
- **Code Connect:** map Figma components to our component files (`components/*`) so design hands off to the exact code component.
- Always load the server's mandatory prerequisite skill before its write tools.

## Component parity

- Figma component **variants/properties** = our variants + sizes + the 8 states (CLAUDE.md). A state that exists in code but not in the Figma variant set is a parity gap — flag it.
- Name layers/props to match code prop names so handoff is mechanical.
- Keep a parity checklist per component: variants (pass) , sizes (pass) , states (pass) , tokens bound (no raw hex in Figma) (pass) .

## Verification
- Every Figma Variable resolves to a token in `tokens/*.json` (no orphan hex in designs).
- One authoritative sync direction; the generated side has zero hand edits.
- Component variant sets cover all 8 states; Code Connect points to the right `components/*` file.
