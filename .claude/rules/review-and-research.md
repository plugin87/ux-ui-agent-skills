# Rule: Review, research, and handoff

Loaded when reviewing or auditing a design, prototyping, or handing off to development.

Split out of `CLAUDE.md` so it loads only when the work calls for it. The
headings below are unchanged, so any pointer to them still resolves.

---

## Design Review & Audit

### When to Use
- **Design Review** — Evaluating a new design before development
- **Design Audit** — Evaluating an existing product for consistency and quality

### Review Output Format
Score across 6 dimensions (1–10), then provide a prioritized findings table:

| Dimension | Weight | Score |
|-----------|--------|-------|
| Visual Hierarchy | 20% | ?/10 |
| Consistency | 20% | ?/10 |
| Accessibility | 20% | ?/10 |
| Usability | 20% | ?/10 |
| Responsiveness | 10% | ?/10 |
| Performance | 10% | ?/10 |
| **Overall** | **100%** | **?/10** |

Then findings:

| # | Severity | Finding | Recommendation |
|---|----------|---------|---------------|
| 1 | Critical | [what's wrong] | [how to fix] |
| 2 | Major | ... | ... |

Severity levels: **Critical** (must fix before launch) → **Major** (fix this sprint) → **Minor** (fix when convenient) → **Enhancement** (backlog)

Full rubric and process: `workflows/design-review.md`

### Heuristic Evaluation
Apply Nielsen's 10 Usability Heuristics to every review. Flag violations with the heuristic number. See `workflows/design-review.md` for the full checklist.

---

## Prototyping & Research

### Fidelity Ladder
Never skip fidelity levels. Validate at each stage:

| Level | Output | Time | Validate |
|-------|--------|------|----------|
| 1. Content-first | Text outline | 30 min | Information needs |
| 2. Wireframe | Box layouts | 1–2 hr | Layout & navigation |
| 3. Low-fi prototype | Clickable flows | 2–4 hr | Task completion |
| 4. High-fi mockup | Pixel-perfect | 4–8 hr | Visual & a11y |
| 5. Code prototype | Working code | 1–3 days | Feasibility & performance |

### User Research Methods
- Card sorting → navigation structure
- Tree testing → findability validation
- Usability testing → task success rates (5 users catches 85% of issues)
- See full methodology and scripts in `workflows/prototyping.md`

---

## Design-to-Code Handoff

### Handoff Checklist
Before marking a design ready for development:
1. All values mapped to design tokens (zero hardcoded values)
2. All 8 states documented per interactive element
3. Edge cases addressed (long text, empty, overflow, single item, many items)
4. Responsive behavior spec'd at each breakpoint
5. Animation spec'd (property, duration, easing, reduced-motion fallback)
6. Accessibility annotations (ARIA roles, keyboard model, focus management)

### Definition of Done
A component is done when: functional (all variants, states, edge cases), visual (pixel-accurate, all tokens, responsive, dark mode), accessible (keyboard, screen reader, contrast, target size), code quality (TypeScript, no `any`, forwardRef, cva), and tested (unit, visual regression, a11y automated, manual screen reader).

Full workflow: `workflows/design-to-code.md`
