---
description: Interrogate the brief before a line is built — ask only the questions whose answers change the work, and put every unasked decision on the record as a stated assumption.
---

The gates catch a screen built wrongly. Nothing in this repo catches a screen
built correctly from the wrong brief, and that is where the expensive rework
comes from: four eval runs scored 14/14 on the gates and still came back from
`/critique` as rework, every finding a decision no gate can see.

This command spends five minutes up front to remove that class of failure.

Target: `$ARGUMENTS` (the thing about to be built; if that is not clear, that is
itself the first question).

## 1. Read before you ask

Asking for something the repo already answers is noise, and it teaches the user
that answering you is a waste of time. Before writing a single question:

- Look for an existing brief, `CLAUDE.md`, `BRIEF.md`, or a `reference/` folder.
- Look for an existing theme: `tokens/*.json`, `design-tokens.json`, `theme.css`.
  If one exists, the theme question is answered — do not ask it.
- Look at the neighbouring screens and components. Framework, conventions, and
  the component inventory are usually visible, not unknown.

Every question you keep after this pass is one the code genuinely cannot answer.

## 2. The bank — grouped by what no gate can see

Pick from these. Do not ask all of them.

**Purpose and lead**
- Who is this for, and what is the one task they came to finish?
- What is the first thing their eye should land on? (Four equal cards means the
  answer is "nothing", and that is a composition bug before it is a design.)
- What does success look like for them — what have they done when they leave?

**Content reality**
- What does this look like with zero items? With one? With four hundred?
- What is the longest string a real user will put in here — a 60-character
  project name, a nine-digit amount, an email with no spaces to break?
- Which numbers are real and which are placeholder? Placeholder that ships as
  real is a lie the user catches immediately.

**Irreversible actions**
- Which actions here destroy or cannot be undone, and what confirms them?
  (Destructive wears the danger variant in every place it appears — the trigger
  and the confirm dialog both. A blue Delete is an automatic fail.)
- What happens when the action fails? What does the user read, and what can they
  do next?

**Theme and platform**
- New theme or existing? If new: which direction, and does dark mode ship too?
- What is the narrowest width this must survive? (The kit's floor is 280px.)
- Which framework is the deliverable — and does it need RTL, AA or AAA?

**Scope and done**
- How many screens or components exactly, and what is explicitly out of scope?
- What has to be true before this is done: which gates, and is `/critique`
  part of the bar or not?

## 3. The rule on asking

- **Maximum seven questions, asked in one round.** A drip of one question at a
  time is worse than a wrong assumption.
- **Every question must change the work.** If both answers produce the same
  build, it is not a question, it is a default — take it and say so.
- **Never ask what you can choose well.** Taste is the job. Ask about intent,
  content, and constraint; decide the rest.

## 4. Everything unasked becomes a written assumption

An assumption held silently is indistinguishable from a guess. Each one gets a
line: what was assumed, the default taken, and what it costs if it is wrong.

```
Assumption: no dark mode requested -> shipping both anyway (the theme is already
dual, so the cost of including it is zero and the cost of retrofitting is not).
```

## 5. Output: a brief that can be checked later

Write `BRIEF.md` next to the work, in this shape:

```
# <what is being built>

Goal            one sentence, from the user's side
User and task   who, and the task they came to finish
Deliverables    exact list; N screens means N screens
Lead            the one thing the eye lands on first
Content reality empty / one / many, longest string, real vs placeholder
Irreversible    which actions, what confirms them, what failure reads like
Theme           source of truth, dark mode, brand direction
Platform floor  narrowest width, framework, RTL, AA or AAA
Out of scope    what this is deliberately not
Assumptions     each with its default and its cost if wrong
Done when       the gates that must pass, and whether /critique is part of the bar
```

This file is the thing `/critique` and a later reviewer argue against. A brief
that lives only in the conversation cannot be checked, and so it will not be.

## 6. Then build, then prove it

`/grill-me` -> build -> `/gate` -> `/critique`. This command removes ambiguity.
It does not produce quality, it does not score anything, and it is not a
substitute for rendering the work and looking at it.
