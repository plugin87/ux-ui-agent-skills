# Redesign & Audit Workflow

Upgrade an existing website or app to premium quality **without breaking functionality**. Audit-first: understand what's there, identify the generic/AI tells, then apply taste and system rules surgically.

> Pairs with [`taste/design-taste.md`](../taste/design-taste.md) (the anti-slop doctrine) and [`taste/aesthetic-systems.md`](../taste/aesthetic-systems.md) (direction). For *new* builds use the prototyping/design-to-code workflows instead.

---

## Sequence

### 1. Scan (read before you touch)
- Identify the **framework** and **styling method** (Tailwind, CSS Modules, styled-components, vanilla CSS, native, etc.). Route to the matching `frameworks/` adapter.
- Map the current **token reality**: are there variables/themes, or hardcoded values everywhere?
- Inventory components and pages. Note what works and must be preserved (behavior, routes, data, a11y wins).
- Capture the current **design direction** (or lack of one).

### 2. Diagnose (name the slop)
Run the design through the **Banned Defaults checklist** in `taste/design-taste.md` and the review rubric in `workflows/design-review.md`. Flag concretely:
- Generic tells (6-line headings, centered everything, identical cards, default shadows, pure `#000`/`#fff`, rainbow accents, cramped spacing, emoji icons, filler labels).
- System failures (hardcoded values, missing states, contrast failures, no focus-visible, missing reduced-motion).
- Produce a prioritized findings table (Critical → Major → Minor → Enhancement).

### 3. Direct (choose the target)
- Pick an **archetype** or a **library system** from `taste/aesthetic-systems.md` that fits the brand/brief.
- Resolve it to tokens (Library Contract). Re-verify every color pair for contrast.

### 4. Apply (surgical, reversible)
- **Tokens first.** Introduce/repair the token layer; replace hardcoded values with semantic tokens. This alone fixes most consistency slop.
- **Typography + spacing next.** Fix scale contrast, measure (60–75ch), section whitespace, vertical rhythm.
- **Then components.** Restore all 8 states, focus rings, hover/press, loading/empty/error.
- **Then motion.** Add purposeful micro-interactions with reduced-motion fallbacks.
- **Preserve behavior at every step** — don't change routes, data flow, or markup semantics unless fixing an a11y defect.

### 5. Verify (don't regress)
- Re-run the design-review rubric; confirm findings are resolved.
- Accessibility pass: contrast, keyboard, focus-visible, target size, reduced motion (`accessibility/wcag-checklist.md`).
- Functional smoke test: every previously-working flow still works.
- Dark mode + responsive spot-check.

---

## Output Completeness

Treat every redesign as production-critical. **A partial output is a broken output.**
- Deliver full files, not fragments. No `// ... rest unchanged`, no `/* keep existing */` placeholders in delivered code.
- If asked for N components/screens, deliver all N.
- If a token, state, or breakpoint is in scope, implement it — don't stub it.
- When output must be split for length, split at clean boundaries and continue until complete.

---

## Guardrails
- Never sacrifice a working feature for aesthetics.
- Never introduce a brand color that fails contrast — adjust it.
- Never remove accessibility affordances that already exist.
- Keep changes traceable to tokens so the result stays maintainable.
