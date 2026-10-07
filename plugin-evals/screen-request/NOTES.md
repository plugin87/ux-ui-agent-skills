# Why this case has one grader and a 3-turn cap

The claim is one sentence: **"Build the billing settings screen" routes to
`design-screen`.** That is proven the instant the `Skill` tool is called, on
turn one or two. Everything after it is wasted money and a source of flakiness.

Getting here took three failed attempts, each one teaching the same lesson.

**Attempt 1 — `taste-block-first`.** Asserted the reply contains the
`Domain: / Mood: / Layout family:` block the skill requires before any markup.
Failed both runs while `design-screen-fired` passed both. The trace said why:
every case here grants only `[Read, Glob, Grep, Skill]`, so a run cannot write a
file. Asked to *build* under those limits, the model loads the skill, tries,
discovers it cannot, and spends its one text block reporting the blockage:

> I couldn't build the billing screen. Nothing was written, no gates ran, there
> are no screenshots and the critic didn't run. This session can only read
> files, not write them or run commands.

The taste block belongs in a reply that precedes markup. There is no markup in a
run that cannot write, so there is no reply for it to precede.

**Attempt 2 — `doctrine-reached-it`.** Looser: did the kit's doctrine reach the
answer at all. It passed when the run finished (9 turns, 131s) and failed when
the run timed out (28 turns, 600s, no final message). Same shape of mistake,
further out: it still graded output in a suite that cannot reliably produce
output, so the sandbox decided the score rather than the plugin.

**What was actually wrong both times:** a realistic *build* request in a
read-only session invites the model to spend 28 turns trying. That is
non-deterministic, costs $1.73 for a single case, and measures the sandbox.

**The fix is the cap, not another grader.** Three turns is enough to route and
not enough to spiral. The prompt stays the realistic sentence a user types,
because an unrealistic prompt would not test the routing anyone actually relies
on.

`design-screen-fired` has passed **5 of 5 runs** across every attempt above.

**Where output quality is measured instead:** `evals/` — the cold-start brief
harness, where an agent has real tools, produces a real screen, and
`evals/RESULTS.md` records what it wrote. That is the right home for a claim
about what the kit produces, and this suite's README says in its own words that
it judges routing only.
