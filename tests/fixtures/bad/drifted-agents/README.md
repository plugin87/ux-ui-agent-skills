A surface that drifted. Not a design: this is what drift actually looks like -
nobody deletes a rule, it simply never gets added to the second file when it is
added to the first, and a script name picks up a typo nobody runs.

`AGENTS.md` here is the real one with three injuries:
  - "mobile is the base" softened to "make it work on a phone"
  - the native-select ban softened to a heading with no rule under it
  - `verify_keyboard.mjs` misspelled as `verify_keyboadr.mjs`

`scripts/` holds empty files named after the real gates, so the only name that
fails to resolve is the typo. `CLAUDE.md` is a copy of the real one, which is
what makes the first two injuries detectable at all: the gate compares.
