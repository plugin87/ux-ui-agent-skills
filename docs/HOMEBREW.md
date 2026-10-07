# Installing with Homebrew

```bash
brew install plugin87/tap/ux-ui-agent-skills
```

Then, in any project:

```bash
ux-ui-skills init                   # CLAUDE.md + .claude/ skills, rules, hooks
ux-ui-skills init --agent codex     # AGENTS.md, for Codex, Cursor, Copilot, Aider
ux-ui-skills init --agent both
```

Homebrew is a convenience, not a different product. The formula installs the
same npm package `npx ux-ui-skills` runs, from the same tarball on the registry.
Use whichever you already have.

---

## What the formula does

It downloads the published npm tarball, installs it with `std_npm_args`, and
symlinks the CLI. `depends_on "node"` is the only dependency, because the kit
has none of its own - the gates are plain Node and Python.

Its `test do` block is not a smoke test. It asserts:

- `ux-ui-skills version` prints the version the formula names. This is what
  catches a bottle built from a different tarball than the formula points at -
  the failure Homebrew itself cannot see, because the sha256 it verifies is the
  one in the formula.
- `init --agent codex` writes `AGENTS.md` and does **not** write `CLAUDE.md` or
  `.claude/`. The codex route promises that in its own output; the test makes
  the promise checkable.
- The gates and tokens install on that route, since they do not depend on which
  agent is reading.
- `validate_tokens.py` actually runs and passes on the installed tokens, so the
  test ends on a gate rather than on a file listing.

## Updating the formula after a release

Never by hand. The version, URL and sha256 must agree with the registry, and
retyping any of them is how a tap installs a build it does not name:

```bash
node scripts/update_homebrew_formula.mjs            # writes ../homebrew-tap/Formula/
node scripts/update_homebrew_formula.mjs --stdout   # just print it
```

It reads the version from `package.json`, fetches that exact version's registry
entry, downloads the tarball, and computes the sha256 from the bytes it actually
received - then checks those bytes against npm's own `dist.integrity` before
writing anything. A mismatch exits non-zero and writes no file.

Then, in the tap:

```bash
cd ../homebrew-tap
git commit -am "ux-ui-agent-skills X.Y.Z" && git push
brew install --build-from-source ./Formula/ux-ui-agent-skills.rb
brew test ux-ui-agent-skills
brew audit --strict --online ux-ui-agent-skills
```

## Why a tap and not homebrew-core

homebrew-core's self-submission bar is 225 stars and 90 forks for a
project maintained by the submitter. The kit is past the star bar and short of
the fork one, so a tap is the honest route today. The formula is written to
core's standards either way, so moving it later is a copy.
