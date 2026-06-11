# Voice, Tone & UX Writing

The interface speaks. Every label, message, and empty state is a sentence in a conversation with the user. Good UX writing is invisible — it removes friction without drawing attention to itself.

> Voice is constant (who we are). Tone adapts to context (how we say it in this moment). An error and a success both share the same voice, but their tone differs.

---

## Core Voice Principles

| Principle | Means | Do | Don't |
|-----------|-------|----|----|
| **Clear** | Plain language over jargon | "Sign in" | "Authenticate session" |
| **Concise** | Cut every word that isn't pulling weight | "Email is required" | "The email field cannot be left empty" |
| **Useful** | Tell the user what to do next | "Add numbers or symbols" | "Invalid password" |
| **Human** | Talk like a calm person, not a system | "Something went wrong on our end" | "Error 500: Internal failure" |
| **Honest** | Never blame the user; never overpromise | "We couldn't save your changes" | "You did something wrong" |

---

## Tone Spectrum

Tone shifts along the user's emotional state. Match the moment.

| Context | User feels | Tone | Example |
|---------|-----------|------|---------|
| Onboarding / empty state | Curious, unsure | Encouraging, warm | "No projects yet. Create your first one to get started." |
| Success | Accomplished | Brief, affirming | "Changes saved." |
| Routine action | Focused | Neutral, transparent | "Uploading 3 files…" |
| Error (user-fixable) | Frustrated | Calm, directive | "Password must be at least 8 characters." |
| Error (system fault) | Confused | Reassuring, accountable | "We couldn't load this. Try refreshing in a moment." |
| Destructive confirm | Cautious | Direct, specific | "Delete 4 items? This can't be undone." |

**Rule:** the higher the user's stress, the plainer the language. Never use humor in errors, payments, or destructive actions.

---

## The Frontload-the-Verb Rule

Start actionable text with the verb. Users scan; the verb is the signal.

- Good: "Save changes" — Avoid: "Click here to save your changes"
- Good: "Invite teammates" — Avoid: "You can invite teammates here"
- Good: "Export report" — Avoid: "Report exporting"

Buttons are verbs, not nouns. Label the *outcome*, not the mechanism: "Create account" beats "Submit".

---

## Error Messages: What → Why → How

Every error answers three questions in order. Drop "why" only when it's obvious.

```
[What happened]  →  [Why, if not obvious]  →  [How to fix it]
```

| Avoid | Prefer |
|----------|-----------|
| "Error: Invalid input" | "Enter a valid email, like name@example.com" |
| "Password incorrect" | "That password doesn't match. Try again or reset it." |
| "Upload failed" | "File is too large (max 10 MB). Try compressing it." |
| "Network error" | "You're offline. We'll retry when you reconnect." |

**Never:** expose stack traces, error codes alone, or "Oops!" with no path forward. An error without a next step is a dead end.

---

## Empty States: Value → Action

An empty state is an opportunity, not a void. Explain the value, then guide to the first action.

```
[What goes here & why it's useful]  →  [Primary action]
```

- Good: "No projects yet. Create your first project to organize your work." → **[Create project]**
- Good: "Your inbox is clear. New messages will appear here." (intentional empty — reassure)
- Avoid: "No data" / "Nothing to show" (dead, unhelpful)

Distinguish **first-use** empty (guide them) from **cleared** empty (reassure them).

---

## Microcopy Patterns

| Element | Guideline | Example |
|---------|-----------|---------|
| **Buttons** | Verb + object, ≤ 3 words | "Save draft", "Delete account" |
| **Confirmations** | State the consequence + count | "Remove 12 contacts? This can't be undone." |
| **Placeholders** | Show format, not instruction (never a substitute for a label) | "name@example.com" |
| **Helper text** | Set expectations before the error | "Use 8+ characters with a number" |
| **Toasts** | One line, past tense for success | "Link copied" |
| **Loading** | Say what's happening | "Generating report…" not "Please wait" |
| **Tooltips** | Add info, never repeat the label | (on a ⓘ icon) "Visible only to your team" |
| **Labels** | Sentence case, no colon | "Email address" not "Email Address:" |

---

## Capitalization & Mechanics

- **Sentence case** for everything — buttons, labels, headings, menus. ("Create new project", not "Create New Project")
- **No terminal punctuation** on labels, buttons, or single-sentence tooltips. Use periods in multi-sentence body and error messages.
- **Numerals** for all numbers in UI ("5 items", not "five items").
- **Oxford comma** in lists. Serial clarity over style.
- **Contractions** are welcome ("you're", "can't") — they read as human.
- **Avoid** ALL CAPS for emphasis (reads as shouting, hurts screen readers), exclamation marks (max one per screen), and "please" in routine actions (it's filler).

---

## Inclusive & Accessible Language

- **Address the user as "you"**; refer to the product as "we" sparingly, never "I".
- **No idioms or cultural references** that don't translate ("piece of cake", "home run").
- **No directional-only or sense-only instructions** ("click the button on the right", "the green one") — pair with a label. Ties to WCAG 1.3.3 and the no-color-only rule.
- **No ableist metaphors** ("crazy", "blind to", "sanity check" → "quick check").
- **Gender-neutral**: "they" for unknown users; avoid "guys".
- **Write for translation**: short sentences, one idea each, avoid stacked nouns.

---

## Pre-Ship Copy Checklist

1. Good: Every button starts with a verb and names the outcome
2. Good: Every error says what happened *and* how to fix it — no dead ends
3. Good: Every empty state guides to a first action
4. Good: Sentence case throughout; no ALL CAPS
5. Good: No jargon, error codes, or stack traces shown to users
6. Good: No blame on the user; system faults owned by "we"
7. Good: Labels present (placeholders are not labels)
8. Good: No directional/color-only instructions
9. Good: Numbers as numerals; counts shown in confirmations
10. Good: Reads naturally aloud — if it sounds robotic, rewrite it
