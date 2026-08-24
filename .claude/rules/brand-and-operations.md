# Rule: Brand, motion, copy, and operations

Loaded when applying an aesthetic direction, writing UI copy, or running the system itself.

Split out of `CLAUDE.md` so it loads only when the work calls for it. The
headings below are unchanged, so any pointer to them still resolves.

---

## Brand Consistency

### Design Taste & Aesthetic Direction
- **Anti-slop doctrine** — every output must beat the statistical defaults that make UI look machine-generated. See `taste/design-taste.md` (banned defaults, the Variance Mandate, typographic/spatial/color taste, pre-flight aesthetic check).
- **Aesthetic systems** — pick an archetype or a named system (138 specs) from `taste/aesthetic-systems.md`; resolve it into tokens via the Library Contract; verify contrast after.
- **Motion choreography** — compose motion with `taste/motion-choreography.md` (entrances, stagger, hover, overlays) on top of `tokens/motion.json`.
- Taste sharpens tier 4 only. Re-run accessibility checks after applying any direction.

### Motion Design
- **Duration**: 100–300ms for UI transitions. Never > 500ms.
- **Easing**: `ease-out` for entrances, `ease-in` for exits, `ease-in-out` for state changes
- **Purpose**: Every animation guides attention, shows connection, or provides feedback
- **Reduced motion**: Always respect `prefers-reduced-motion`. Replace with fade or instant.
- All motion values are tokenized — use `tokens/motion.json` (duration scale, easing curves, transition presets, keyframes). Never hardcode timing or easing.

### Voice & Tone
- **UI copy**: Clear, concise, actionable. Frontload the verb.
  - Good: "Save changes" / Avoid: "Click here to save your changes"
  - Good: "Email is required" / Avoid: "The email field cannot be empty"
- **Error messages**: Say what happened → why → how to fix it.
  - Good: "Password must be at least 8 characters. Try adding numbers or symbols."
  - Avoid: "Error: Invalid input"
- **Empty states**: Explain the value → guide to first action.
  - Good: "No projects yet. Create your first project to get started."
  - Avoid: "No data"
- Full UX writing system — voice principles, tone spectrum, error/empty-state formulas, microcopy patterns, inclusive language, and a pre-ship checklist — in `content/voice-tone.md`.

---

## Operations & Pipeline

Keeping the system healthy at scale — governance, build, sync, QA, and performance:

- **Governance** — versioning (SemVer for tokens/components), contribution path, deprecation policy, change communication: `workflows/governance.md`.
- **Token build pipeline** — transform `tokens/*.json` (source of truth) → CSS vars / Tailwind `@theme` / iOS Asset Catalog / Android / Compose via Style Dictionary or Tokens Studio (DTCG): `workflows/token-build.md`.
- **Figma integration** — token ↔ Figma Variable sync (3-tier collections + modes), Figma MCP usage, component parity: `workflows/figma-integration.md`.
- **Design QA** — automated gates (token validation, axe a11y, visual regression across variants/states/themes/RTL) + manual a11y per release: `workflows/design-qa.md`.
- **Performance** — Core Web Vitals (LCP/INP/CLS) budgets, loading/code-split strategy, layout-shift and animation-perf rules: `workflows/performance.md`.
- **Icon system** — grid/stroke/sizing tokens, delivery, and a11y for icons as a governed subsystem: `components/icon-system.md`.
