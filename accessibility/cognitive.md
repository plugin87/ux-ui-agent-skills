# Cognitive Accessibility

Designing for memory, attention, language processing, and executive function. Covers WCAG 2.2's cognitive-focused criteria (3.2.6, 3.3.7, 3.3.8) and goes beyond them. Cognitive load is the most common, least-tested barrier — these rules help everyone, not just users with cognitive disabilities.

---

## Core principles

1. **Reduce load, don't add it.** Every field, choice, and step has a cost. Remove before you explain.
2. **Don't make people remember.** Recognition over recall — show options, keep entered data visible, persist context across steps.
3. **One primary action per view.** Progressive disclosure (CLAUDE.md) hides secondary/advanced paths until needed.
4. **Be predictable.** Consistent navigation/identification (WCAG 3.2.3/3.2.4); no context changes on focus or input (3.2.1/3.2.2).
5. **Forgive errors.** Confirm destructive actions, allow undo, autosave, and let users review before submit (3.3.4 / 3.3.6).

---

## Plain language

- Target a lower-secondary reading level for general UI; frontload the point (`content/voice-tone.md`).
- Short sentences, common words, active voice. Expand or avoid jargon, idioms, and acronyms (define on first use).
- One idea per paragraph; use lists and headings to chunk.

## Memory & attention

- **Accessible Authentication (3.3.8 AA / 3.3.7 AA):** never require recalling/transcribing codes, solving puzzles, or re-entering info already provided. Allow password managers (don't block paste), support passkeys/email-link, and offer "Show password".
- Keep instructions visible *while* the task is performed — don't put them only in a dismissed dialog.
- Avoid timeouts; if unavoidable, warn and allow extension (WCAG 2.2.1). Persist progress so a lapse doesn't lose work.
- Minimize concurrent decisions; default sensible values; remember preferences.

## Executive function & task flow

- Break long flows into clear steps with a Stepper (`components/navigation.md`) showing where the user is and what remains.
- Show progress and expected effort ("Step 2 of 4 · ~2 min").
- Make the next action obvious; never hide the only way forward behind a gesture or hover.

## Dyslexia & reading

- Body text ≥ 16px; generous line height (1.5) and paragraph spacing; line length 45–75ch (CLAUDE.md typography).
- Left-align body text — **never justify** (uneven "rivers" of space hurt tracking). Avoid all-caps for running text.
- Use a clean sans (Inter/system-ui) or an OpenDyslexic option; never convey meaning by italics alone.
- Strong heading hierarchy and whitespace so structure is scannable.

## Reduced-data / low-bandwidth

- Respect `prefers-reduced-data` (Save-Data): skip autoplay media, heavy fonts, and large hero images; serve text-first.
- Don't block core tasks behind large downloads; show lightweight skeletons (`components/feedback.md`) over spinners-then-jank.

## Verification
- Read every label/error aloud — does a tired, distracted first-time user understand it?
- Can the task complete without remembering anything from a previous screen?
- Does any timeout, puzzle, or transcription step exist? If so, remove or provide an exemption path.
