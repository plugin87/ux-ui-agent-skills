# WCAG 2.2 AAA — Upgrade Guide

AA is our minimum (CLAUDE.md). This is the **AAA delta** — the additional success criteria to target when a product serves users who need the highest support (government, healthcare, education, accessibility-first brands). AAA is rarely required wholesale; adopt the criteria that fit the audience.

> Conformance note: W3C states AAA conformance is not achievable for all content. Treat this as a prioritized enhancement list, not a pass/fail gate.

---

## Perceivable

| Criterion | AAA bar (vs. AA) | How |
|-----------|------------------|-----|
| 1.4.6 Contrast (Enhanced) | **7:1** normal / **4.5:1** large (AA was 4.5/3) | Verify `text.primary` (already ~15:1 (pass) ); bump `text.secondary` pairings; check `scripts/contrast.py` |
| 1.4.8 Visual Presentation | line ≤ 80ch, line-height ≥ 1.5, no justification, user color/width control | Our typography defaults comply; add a width/theme control |
| 1.4.9 Images of Text (No Exception) | no text-in-images at all | Use real text + web fonts; SVG with live `<text>` only if styleable |
| 1.2.6–1.2.9 | sign language for audio, extended descriptions, live captions/audio-only alt | Media-heavy products only |

## Operable

| Criterion | AAA bar | How |
|-----------|---------|-----|
| 2.1.3 Keyboard (No Exception) | **all** functionality keyboard-operable, no exceptions | Audit every interaction incl. drag (provide non-drag alt — also 2.5.7 AA) |
| 2.2.3 No Timing | no time limits on tasks | Remove timeouts entirely where feasible |
| 2.2.4 Interruptions | user can postpone/suppress non-emergency interruptions | Quiet-mode for toasts/banners |
| 2.3.2 Three Flashes | **no** flashing > nothing (stricter than 2.3.1) | Ban flashing outright |
| 2.4.8 Location | show where the user is (breadcrumb + current nav state) | `components/navigation.md` |
| 2.4.9 Link Purpose (Link Only) | link text alone is unambiguous | No bare "click here"/"read more" |
| 2.4.12/2.4.13 Focus | focus never obscured (Enhanced) + thick, high-contrast focus appearance | Strong `shadow.focus-ring`; offset; no sticky-header overlap |
| 2.5.5 Target Size (Enhanced) | **44×44px** targets (AA 2.5.8 is 24px) | Use `sizing.control.lg`; we already recommend 44px for primary |

## Understandable

| Criterion | AAA bar | How |
|-----------|---------|-----|
| 3.1.3–3.1.6 | define unusual words, expand abbreviations, lower-secondary reading level, pronunciation | See `accessibility/cognitive.md` plain-language rules |
| 3.2.5 Change on Request | no automatic context changes; user initiates all | No auto-redirects/refresh; explicit confirm |
| 3.3.5 Help | context-sensitive help available | Inline help, tooltips (`components/atoms.md`) |
| 3.3.6 Error Prevention (All) | reversible / checked / confirmed for **all** submissions (AA limits to legal/financial/data) | Review-before-submit + undo everywhere |
| 3.3.9 Accessible Authentication (Enhanced) | no cognitive function test, **no exceptions** (object-recognition exception of 3.3.8 removed) | Passkeys/email-link; never image puzzles |

## Verification
- Run `scripts/contrast.py` against 7:1 for all body-text pairings.
- Confirm zero timeouts, zero flashing, zero drag-only or keyboard-excluded interactions.
- Every link and button label makes sense read out of context.
- Primary targets ≥ 44×44px; focus indicator thick, offset, never obscured.
