# Design Review Workflow

A structured process for evaluating UI designs against quality, consistency, accessibility, and usability standards.

---

## Review Rubric (Score 1 to 10)

Score every design across these six dimensions. Each dimension contributes to the overall quality score.

| # | Dimension | Weight | What to Evaluate |
|---|-----------|--------|-----------------|
| 1 | **Visual Hierarchy** | 20% | Clear focal points, scannable layout, meaningful contrast between elements, proper heading structure |
| 2 | **Consistency** | 20% | Token adherence, component reuse, pattern consistency across pages, naming conventions |
| 3 | **Accessibility** | 20% | WCAG 2.2 AA compliance, color contrast, keyboard navigation, screen reader support, target sizes |
| 4 | **Usability** | 20% | Task efficiency, learnability, error prevention, cognitive load, clear affordances |
| 5 | **Responsiveness** | 10% | Mobile-first, breakpoint behavior, touch targets, content reflow, no horizontal scroll at 320px |
| 6 | **Performance** | 10% | Image optimization, animation efficiency, perceived loading speed, skeleton states |

**Scoring Guide:**
| Score | Meaning |
|-------|---------|
| 9-10 | Exemplary: ready to ship, reference-quality |
| 7-8 | Good: minor polish needed |
| 5-6 | Adequate: several issues to address before shipping |
| 3-4 | Below standard: significant rework needed |
| 1-2 | Critical: fundamental problems, back to drawing board |

**Overall Score Formula:**
```
Overall = (Hierarchy × 0.2) + (Consistency × 0.2) + (Accessibility × 0.2)
        + (Usability × 0.2) + (Responsiveness × 0.1) + (Performance × 0.1)
```

---

## Nielsen's 10 Usability Heuristics

Evaluate the design against each heuristic. Flag violations.

| # | Heuristic | What to Check |
|---|-----------|--------------|
| 1 | **Visibility of System Status** | Loading indicators, progress bars, current state indicators, selected states |
| 2 | **Match Between System & Real World** | Natural language, familiar icons, logical ordering, cultural conventions |
| 3 | **User Control & Freedom** | Undo/redo, cancel, back navigation, easy exit from flows, dismiss modals |
| 4 | **Consistency & Standards** | Platform conventions followed, internal consistency, component reuse |
| 5 | **Error Prevention** | Confirmations for destructive actions, constraints, disabled invalid options |
| 6 | **Recognition Over Recall** | Visible options, contextual help, recent items, search suggestions |
| 7 | **Flexibility & Efficiency** | Keyboard shortcuts, power user features, customizable views |
| 8 | **Aesthetic & Minimalist Design** | No unnecessary elements, clear visual weight, purposeful use of space |
| 9 | **Help Users Recognize & Recover from Errors** | Clear error messages, suggestions, inline validation, recovery paths |
| 10 | **Help & Documentation** | Onboarding, tooltips, help center, contextual guidance |

---

## Review Process

### Step 1: Context Gathering
Before reviewing, understand:
- **User**: Who is the target user? What is their technical level?
- **Goal**: What task is the user trying to accomplish?
- **Context**: Where does this screen fit in the user journey?
- **Constraints**: Technical limitations, brand guidelines, timeline

### Step 2: First Impression (30 seconds)
Without interacting:
- What draws your eye first? Is it the right thing?
- Can you tell what the page is for?
- Does it feel cluttered or balanced?
- Is the primary action obvious?

### Step 3: Task Walkthrough
Walk through the primary user task:
- Can you complete the task without instructions?
- How many steps does it take?
- Are there dead ends or confusion points?
- What happens with errors?

### Step 4: Systematic Check
Review against:
- [ ] **Token Compliance**: Are colors, typography, spacing from the token system?
- [ ] **Component Library**: Are standard components used correctly?
- [ ] **Accessibility**: Run through `accessibility/wcag-checklist.md` P0 items
- [ ] **Responsive**: Check mobile, tablet, desktop breakpoints
- [ ] **States**: Empty, loading, error, populated, overflow, edge cases
- [ ] **Content**: Real-ish content (not just "Lorem ipsum"), edge cases (long names, empty fields)

### Step 5: Document Findings

---

## Output Format: Findings Table

Prioritize every finding by severity:

| Severity | Definition | Action |
|----------|-----------|--------|
| **Critical** | Blocks users, a11y violation (P0), data loss risk | Must fix before launch |
| **Major** | Significant UX degradation, inconsistency across flows | Fix in current sprint |
| **Minor** | Small polish issues, non-blocking inconsistencies | Fix when convenient |
| **Enhancement** | Improvement ideas, not bugs | Add to backlog |

**Findings Table Template:**

| # | Severity | Category | Location | Finding | Recommendation | Heuristic |
|---|----------|----------|----------|---------|---------------|-----------|
| 1 | Critical | A11y | Login form | Error messages only use red color | Add error icon + text description | WCAG 1.4.1 |
| 2 | Major | Usability | Dashboard | No empty state for new users | Add onboarding empty state with CTA | H6 |
| 3 | Minor | Consistency | Settings | Save button alignment differs from other forms | Right-align to match pattern | H4 |
| 4 | Enhancement | Efficiency | Data table | No keyboard shortcuts for bulk actions | Add Shift+Click for range select | H7 |

**Decision note: keep the source with the finding.** A finding that cites a
standard carries the criterion, the primary source, the reason and how it was
checked, so whoever picks it up at handoff does not have to find them again.
Finding 1, written that way:

| Field | Finding 1 |
|-------|-----------|
| Criterion | WCAG 2.2 SC 1.4.1 Use of Color (Level A) |
| Source | [W3C, Understanding SC 1.4.1: Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html) |
| Rationale | Red is the only thing that marks the field as wrong. A reader who cannot tell red from the field's normal border (colour blindness, a monochrome display, glare) sees no error at all. An icon and a line of text that says what is wrong and how to fix it carry the same message without colour. |
| Verified | By hand: a greyscale screenshot of the failed submit, where the error must still be identifiable from the icon and text alone. No gate in this kit measures 1.4.1 on an error state. `axe_audit.mjs` checks 1.4.1 only for a link set apart from its paragraph by colour (axe's `link-in-text-block` rule). |

Write "not verified yet" in the last row until the check has been run.

---

## Design Audit Process (Existing Products)

For auditing an existing product (not a new design):

### 1. Inventory
- Screenshot every unique screen
- Catalog all unique components (buttons, inputs, cards, etc.)
- Document all color values, font sizes, spacing values in use

### 2. Gap Analysis
Compare inventory against design system tokens:
- **Off-token colors**: hex values not in `tokens/colors.json`
- **Off-token typography**: font sizes/weights not in `tokens/typography.json`
- **Off-token spacing**: padding/margin values not on the 4px grid
- **Inconsistent components**: same concept, different implementations

### 3. Severity Mapping
Map every gap to a severity:
- **Critical**: Accessibility violations (contrast, target size, keyboard)
- **Major**: Inconsistencies that confuse users
- **Minor**: Visual polish (1px off, slightly wrong shade)
- **Enhancement**: Opportunities to improve

### 4. Remediation Roadmap
Group findings into actionable batches:
1. **Quick wins**: Token swaps, contrast fixes (< 1 hour each)
2. **Component standardization**: Replace one-offs with system components
3. **Layout refactors**: Grid alignment, responsive fixes
4. **New patterns**: Missing states, new components needed

---

## Review Checklist (Quick Reference)

```
□ Visual hierarchy: clear focal point and scanning path
□ Typography: heading levels correct, body text readable
□ Color: sufficient contrast, not only means of information
□ Spacing: consistent rhythm, breathing room
□ Alignment: grid-aligned, no visual drift
□ Components: using established patterns correctly
□ States: all 6 states defined for interactive elements
□ Empty states: meaningful illustration + CTA
□ Loading: skeleton or spinner for async content
□ Errors: clear, actionable, accessible error messages
□ Responsive: mobile, tablet, desktop considered
□ Touch targets: 24px minimum (48px recommended)
□ Focus indicators: visible on all interactive elements
□ Keyboard: full flow completable without mouse
□ Screen reader: meaningful landmarks, labels, live regions
□ Motion: animations serve purpose, respect prefers-reduced-motion
□ Content: real content, edge cases (long strings, empty, overflow)
□ Dark mode: if supported, tested thoroughly
```
