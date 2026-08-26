# Blind cold-start artifacts, 2026-08-25

Unedited output from two agents that had never seen this kit. Each was handed a
scaffolded project (`ux-ui-skills new`, which installs the kit and ships no example
screens), the brief verbatim, and nothing else — no design hints, no trap warnings,
no mention that anything would be scored.

Both scored **14/14** on `evals/run.mjs`, verified from this directory after the
asset paths were localised (`../../src/theme.css` -> `theme.css`). That path rewrite
and this README are the only changes: **the screens themselves are exactly what the
agents wrote.**

They are kept unedited on purpose. `/critique` returned `rework` on both, and the
findings were spent on the kit rather than on these files — patching the artifacts
would be editing the experiment. See `evals/RESULTS.md` for the verdict, the eight
findings, and what each one changed upstream.

Read them as evidence of two things at once: the rules that transferred (tokens,
focus management, edge-case survival, the verification workflow, which both agents
found and ran on their own), and the rules that did not (composition, focal point,
type scale, feedback that matches the data).
