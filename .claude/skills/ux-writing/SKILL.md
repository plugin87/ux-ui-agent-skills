---
name: ux-writing
description: Write or review UI copy — buttons, errors, empty states, microcopy, notifications, labels — using the voice & tone system (clear, concise, useful, human, honest) with the what→why→how error formula and inclusive-language rules. Use when the user needs interface copy, error messages, empty-state text, or a copy review.
---

# Skill: UX Writing

Produce or critique interface copy in the project's voice.

## Steps
1. Read `content/voice-tone.md` (voice principles, tone spectrum, formulas, microcopy patterns, inclusive language, pre-ship checklist).
2. Match tone to the user's emotional state (onboarding/success/routine/error/destructive). Higher stress → plainer language.
3. Apply the formulas:
   - Buttons: frontload the verb, name the outcome.
   - **Confirmation dialogs:** the confirm button **restates the action and object** — "Delete account", not "Delete"/"OK"/"Yes"/"Confirm". The title asks ("Delete account?"), the button answers in matching words. Cancel stays "Cancel". For irreversible/high-stakes actions, require a **type-to-confirm** step (WCAG 3.3.4/3.3.6).
   - Errors: what happened → why → how to fix (no dead ends, no codes/stack traces).
   - Empty states: value → first action.
4. Enforce mechanics: sentence case, no ALL CAPS, numerals, no blame on the user, labels (not placeholders), no directional/color-only instructions.
5. Run the 10-item pre-ship copy checklist.

## Output
Final copy (or a redline review) that reads naturally aloud and passes the checklist. Keep within any character limits for tight UI.

## Verification (mandatory before declaring done)
Run every line through the 10-item pre-ship checklist in `content/voice-tone.md` — do not skip it:
- Reads naturally **aloud**; frontloaded verb on actions; no jargon/blame/dead-ends.
- Errors follow what→why→how; empty states give value→action; no bare "No data"/"Error".
- Mechanics: sentence case, numerals, labels (not placeholders), no color/direction-only cues, inclusive language.
- Within character limits; translatable (no concatenation — see `accessibility/i18n-rtl.md`).
