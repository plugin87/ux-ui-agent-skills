# H7 — is taste applied, or only documented

The owner's report that started this: *taste is not applied at all in new
projects.* Nothing had confirmed or refuted it, which is why H7 sat at 0 with
"no instrument" beside it.

This case is the instrument. The prompt never names the skill, never says
"taste", and never asks for a brief — it is the sentence someone would actually
type. What it measures is whether the kit's first demand reaches the model
unprompted: **the Brief Inference block, written out before any markup.**

```
Domain:           ...
Audience & tone:  ...
Mood:             the one adjective the result must earn
Motion depth:     ...
Layout family:    ...
Reference anchor: ...
```

`design-screen` calls that block "not optional and not internal". If the skill
loads and the block is never written, the doctrine is documentation rather than
behaviour, and this case is what tells the difference.

## Why this one grades `target: trace` and not the final message

Every other case in this suite that asks for an artifact grades routing only,
because a read-only session cannot produce the artifact and the final message is
whatever the model says about being blocked. Three graders were lost to that;
see `../screen-request/NOTES.md`.

The Brief Inference block is different in exactly one way that matters: it is
required **before** any markup, so it belongs to the part of the turn that
happens whether or not the build succeeds. Grading the trace rather than
`last_message` reads the whole session, so the block counts wherever in the turn
it was written — which is the honest reading of a rule about ordering, and it
does not depend on the run completing.

`runs: 3` rather than 2, because this is the indicator whose answer was
contested. Two runs cannot distinguish "usually" from "once".

## What this does not prove

That the resulting screen has taste. Nothing scores that, and this repo says so
everywhere. It proves the kit's taste step is reached and performed, which is
the precondition. The output itself is judged by `/critique`, and the critic is
scored separately against seeded defects (H6).

## The grader had to be tightened before its first result counted

The first version matched `(Domain|Mood|Layout family|Reference anchor)\s*:`
against the trace, and scored 3/3. It was measured before it was believed, and
the trace showed the pattern matching in **two** places:

```
user/text       Domain:  fintech | editorial | dev-tool | ...   <- the skill's own template
assistant/text  Domain:  dev-tool                               <- the model filling it in
```

The model really did write the block, so the result was right. But a grader on
`target: trace` sees every message including the skill content loaded into
context, and that content *contains the empty template*. The grader would have
passed on a run where the skill merely loaded and the model wrote nothing - a
false pass sitting one quiet failure away, on the indicator whose honesty
matters most, since the owner's report was that taste is not applied at all.

The pattern now keys on `Mood:` followed by anything that is not the template's
own words. Tested against the kept trace: it matches the assistant's message and
does not match the skill content.

The general rule, which cost this suite three graders to learn: **a grader on
`trace` must be written so it cannot match the kit's own instructions.** The kit
tells the model what to write; finding those words in the session proves only
that the kit was loaded.
