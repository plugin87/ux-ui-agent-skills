# Evals — does an agent with this kit actually produce good work?

Every other gate in this repo measures the kit's own files. That answers "is the
system self-consistent", which is not the question that matters. The question that
matters is: **give an agent nothing but this kit and a brief, and is what comes
back any good?**

This suite answers the measurable half of that honestly, and refuses to fake the
rest.

## The protocol

1. **Cold start.** Open a fresh session in a directory that has the kit installed
   (`npx ux-ui-agent-skills init`, or a repo scaffolded with
   `npx ux-ui-agent-skills new`). No prior conversation, no hints, no follow-up
   coaching. Coaching the agent through the brief invalidates the run.
2. **Give it the brief, verbatim.** Paste the body of `briefs/<id>.md`. Nothing
   else. If you find yourself explaining what you meant, the brief needs editing
   rather than the run needing rescuing.
3. **Collect the output** into `evals/out/<brief-id>/` as `.html` files.
4. **Score the measurable half:**

   ```
   node evals/run.mjs <brief-id>
   ```

   Fourteen objective gates on the real render: hardcodes, emoji, WCAG in light
   and dark, state-aware contrast, axe, responsive at 280/320/414, the same widths
   again under a 1.25x root font (a wider fallback font on another platform, or a
   user with larger text), target size, keyboard, reduced motion, content overflow,
   token by intent, slop tells, and interactive truth - a control that declares
   `aria-sort` or `aria-pressed` has to change something when it is clicked. One
   `N/N`, all or nothing.

5. **Judge the half no script can.** Run `/critique` on the output, then read the
   brief's Requirements list yourself. That list is where the real failures live:
   a Cancel button in the wrong colour, an empty state that says "No data", forty
   identical cards with no focal point.

## What a run tells you

| Result | Reading |
|---|---|
| Objective gates fail | The kit did not transfer. Either the brief did not reach the rules, or a rule is preached but not enforced. Both are kit bugs, not agent bugs. |
| Objective green, requirements fail | The kit enforces correctness but not judgement. This is where the taste layer and `/critique` earn their place. |
| Both green | One brief passed. That is evidence, not proof, and it is worth exactly one data point. |

The second row is the interesting one. When a requirement fails repeatedly across
runs, the fix is usually a new gate, and that is how `verify_keyboard`,
`lint_intent`, and the rest were born: a rule the kit preached and nothing checked.

## Keeping the harness honest

`node evals/run.mjs --self-test` scores the kit's own reference app with the exact
same gates. It runs inside `scripts/accuracy_report.mjs`, so a runner that quietly
breaks fails the build instead of silently reporting success on nothing.

Building it found two real defects the 34-check gate had missed: the reference app
overflowed at 280px, and `verify_overflow` was flagging screen-reader-only text as
silently clipped. Both are fixed.

## What this is not

It is not a benchmark, and it does not produce a percentage for quality. Fourteen
gates passing means the work is correct, not that it is good. The briefs list a
"Known traps" section precisely because those traps are what separates the two,
and no script in this repo can see them.
