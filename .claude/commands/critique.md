---
description: Adversarial design critique of the current work — render it, look at it, and argue for rejection. Run after the gates are green, never instead of them.
---

The gates prove objective correctness. They cannot tell you whether the work is
any good. This command closes that gap the only honest way: render the thing, look
at it, and let a critic who is trying to reject it write the findings.

Target: `$ARGUMENTS` (a file, a directory, or the screens changed in this session;
ask if it is ambiguous).

## 1. Refuse to critique blind

If the target has never been rendered, render it first. A critique written from
source alone is worthless. Screenshot every screen or harness at 1280 and 390
wide, in light and dark, pointer parked off the UI, then click every control and
note what actually changed.

## 2. Gather the numbers the critic will need

```
node scripts/taste_audit.mjs <file> && node scripts/taste_audit.mjs <file> --dark
node scripts/slop_tells.mjs  <file> && node scripts/slop_tells.mjs  <file> --dark
node scripts/verify_overflow.mjs   <file|dir>
node scripts/verify_responsive.mjs <file|dir>
```

Report their real output. These are heuristics: they name what you saw, they do
not decide whether it is good.

## 3. Hand it to the critic

Delegate to the `design-critic` subagent with the screenshots, the script output,
and the file paths. Its stance is adversarial on purpose: the work is mediocre
until the render proves otherwise, a passing gate is never evidence of taste, and
every finding must name its evidence.

If subagents are unavailable, adopt `.claude/agents/design-critic.md` yourself and
follow it literally, including the verdict format.

## 4. Report, then decide

Relay the verdict, the three rejection reasons, and the findings table as written.
Do not soften it, and do not pad the "what is good" list.

Then act on it: fix every Critical and Major finding, re-run `/gate`, and re-run
this critique on what changed. The loop ends when the critic's remaining findings
are Minor or Enhancement, not when you are tired of it.

Honest scope, always stated with the result: this is judgement, not measurement.
It does not produce a percentage, and no percentage in this repo covers taste.
