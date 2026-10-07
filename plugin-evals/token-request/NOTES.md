# Why this case grades routing only

Tagged `artifact`: a token palette is something the kit writes as `tokens/*.json`
in the project, not something it says in a message.

`design-tokens-fired` passed 2/2. The output grader beside it, `dtcg-shape`,
passed one run and failed the other — in the failing run the model spent 10 turns
and ended on a message that did not contain the palette, because every case here
grants only `[Read, Glob, Grep, Skill]` and the natural place for a palette is a
file it cannot write.

That is the third time an output grader was written into this suite and the third
time the sandbox decided the score rather than the plugin. See
`../screen-request/NOTES.md` for the first two. The lesson generalised:

> A case whose answer would normally be **files in the project** grades routing
> only. A case answerable in a message may grade the message.

The evidence for the line, from one full run:

| grader | case | result | the request produces |
|---|---|---|---|
| `dtcg-shape` | token-request | **1/2** | a token file |
| `taste-block-first` | screen-request | **0/2** | a screen |
| `destructive-by-intent` | component-request | 2/2 | notes, in prose |
| `solves-it` | unrelated-code | 2/2 | one short function |
| `answers-anyway` | wcag-explainer | 2/2 | a number |

`tests/meta/plugin-evals.test.mjs` enforces the line on every `artifact` case, so
it cannot be re-crossed by writing a new grader that looks reasonable.

Output quality is measured in `evals/` instead, where an agent has real tools,
writes real files, and `evals/RESULTS.md` records what it produced.
