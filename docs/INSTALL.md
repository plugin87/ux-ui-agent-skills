# Five ways in, and which one is yours

`ux-ui-agent-skills` reaches an agent through five channels. They install
different things, and the one you want depends on which agent you use and
whether you want to **read** the doctrine or **run** the gates.

Every number on this page was measured on the version it names, not carried
forward. Re-run the commands and you should get the same ones.

---

## The short answer

| You use | Install with | You get |
|---|---|---|
| **Claude Code** | `/plugin marketplace add plugin87/ux-ui-agent-skills` | 26 skills, hooks, the critic |
| **Codex, Cursor, Copilot, Aider** | `npx ux-ui-agent-skills@3.0.0 init --agent codex` | `AGENTS.md` + every gate |
| **Gemini CLI** | `gemini extensions install https://github.com/plugin87/ux-ui-agent-skills` | `GEMINI.md`, 23 ported skills, the MCP server |
| **Antigravity** (or Gemini CLI, per project) | `npx ux-ui-agent-skills@3.0.0 init --agent gemini` | `GEMINI.md` + `.agents/skills/` + every gate |
| **Any MCP client** | `claude mcp add ux-ui-gates -- npx -y --package=ux-ui-agent-skills@3.0.0 ux-ui-mcp` | 6 tools that run the gates |
| **A terminal, any project** | `brew install plugin87/tap/ux-ui-agent-skills` | the CLI and the MCP binary |
| **Just looking** | `npx ux-ui-agent-skills@3.0.0 demo` | the rendered examples, nothing installed |

---

## 1. Claude Code plugin: the most complete

```
/plugin marketplace add plugin87/ux-ui-agent-skills
/plugin install ux-ui-agent-skills@ux-ui-agent-skills
```

This is the only route that carries the parts Claude Code can **enforce** rather
than request:

- **26 skills** that load on demand. Ask for a screen and `design-screen` loads
  itself; ask about contrast and `a11y-audit` does.
- **Three hooks** that fire whether or not the model remembers them: no
  hardcoded values and no emoji on every file write, and a refusal to end a
  session that edited UI and measured none of it.
- **`design-critic`**, an adversarial reviewer that runs in a forked context so
  it never sees the conversation that produced the work.

Fourteen skills the model reaches for on its own; eleven you start yourself,
because each takes an action or sets a direction that should be your call.

After installing, just ask for what you want. If the skills do not appear, start
a new session.

---

## 2. Codex, Cursor, Copilot, Aider: the open convention

```bash
cd your-project
npx ux-ui-agent-skills@3.0.0 init --agent codex
```

Writes `AGENTS.md` at the repository root (an open convention roughly 25 tools
read without any setup), plus the tokens, component specs, taste doctrine, the
index of the 2,144 design systems and **all 52 gates**.

The specs themselves are fetched when used, not copied: `node scripts/library.mjs
get <name>` writes one to `design-systems/library/<name>/DESIGN.md` and refuses
it unless its sha256 matches the index. `npx ux-ui-agent-skills@3.0.0 library pull`
fetches every spec, for a machine that will work offline.

It deliberately does **not** write `.claude/`. Skills, rules and the critic are
Claude Code mechanisms; on this route they would be dead files.

**What you lose, stated plainly:** the hooks. On Claude Code three rules are
enforced without the model choosing to. Here every rule is a request and the
gates run when you run them. That makes running them the whole difference
between this kit working and not working.

```bash
npx ux-ui-agent-skills@3.0.0 init --agent both   # both surfaces, held in step by a gate
```

---

## 2b. Gemini CLI and Antigravity

Two routes. Both were run against Gemini CLI 0.65.0.

```bash
gemini extensions install https://github.com/plugin87/ux-ui-agent-skills   # every project
npx ux-ui-agent-skills@3.0.0 init --agent gemini                                  # this project
```

**The extension** is an archive attached to each release, which is what
`gemini extensions install` fetches from a GitHub URL. It carries `GEMINI.md`,
23 ported skills whose paths Gemini CLI resolves to the extension, and the kit's
MCP server. Installed into a clean home, `gemini extensions list` showed all 23
skills and `gemini mcp list` showed the server `Connected`.

**`init --agent gemini`** writes the kit, `GEMINI.md` and the same skills to
`.agents/skills/`, at the project root, with every path relative to it.
`--agent antigravity` writes exactly the same. Gemini CLI reads workspace skills
only in a **trusted folder**: untrusted, `gemini skills list` showed none of
them; trusted, all 23. Antigravity reads `GEMINI.md` and `.agents/skills/` from
the same place. That side follows Antigravity's own documentation; it has not
been driven end to end here.

Three skills stay in Claude Code, because they need it: `critique` runs the
critic as a forked subagent, `observe` reports what the Claude Code hooks
recorded, and `scaffold-project` lays out a Claude Code project. There are no
hooks on this route: as on the `AGENTS.md` surface, every rule is a request and
the gates run when you run them.

---

## 3. MCP: any client can run the gates

```bash
claude mcp add ux-ui-gates -- npx -y --package=ux-ui-agent-skills@3.0.0 ux-ui-mcp
```

Or in any MCP client's config:

```json
{
  "mcpServers": {
    "ux-ui-gates": {
      "command": "npx",
      "args": ["-y", "--package=ux-ui-agent-skills@3.0.0", "ux-ui-mcp"]
    }
  }
}
```

> `--package=` is load-bearing. This package's name is also one of its bin
> names, so `npx -y ux-ui-agent-skills@3.0.0 ux-ui-mcp` runs the installer CLI and
> hands it `ux-ui-mcp` as an argument: you get a help screen and a client that
> never completes a handshake.

Six tools:

| Tool | What it does |
|---|---|
| `list_gates` | Every gate, what it measures, whether it needs a browser |
| `run_gate` | Run one gate, get its output and exit code unedited |
| `review_ui` | Run every applicable gate, per-gate verdict |
| `get_doctrine` | The written rules, by topic |
| `get_design_system` | One of the 2,144 specs, fetched on first use and cached |
| `get_tokens` | The DTCG token source |

`AGENTS.md` lets an agent **read** the doctrine. This lets it **run the gates**,
which reading cannot do. Plenty of things describe good UI; very little tells
you afterwards that the contrast you shipped is 3.9:1 on hover.

It returns what the gates printed, with their exit codes: **0** looked and found
nothing, **1** found something, **2** could not look. None of them is a pass.

---

## 4. Homebrew: the CLI on your machine

```bash
brew install plugin87/tap/ux-ui-agent-skills
```

One line. No `brew tap` first: Homebrew sees `owner/tap/name` and clones the
tap itself, and installs Node if you do not have it.

You get two commands on your `PATH`:

```bash
ux-ui-skills init          # drop the kit into a project
ux-ui-mcp                  # the MCP server, no npx needed
claude mcp add ux-ui-gates -- ux-ui-mcp
brew upgrade ux-ui-agent-skills
```

> **You will not find it with `brew search` until you have installed it once.**
> `brew.sh` and `formulae.brew.sh` index only homebrew-core and homebrew-cask,
> and this is a personal tap. The command above is the only way in, so it has to
> travel with any link to the project.

The formula is generated from the registry rather than hand-edited, and the tap
updates itself within a minute of a release.

---

## 5. npx: nothing installed

```bash
npx ux-ui-agent-skills@3.0.0 demo        # copy the rendered examples and open them
npx ux-ui-agent-skills@3.0.0 init        # the full kit into the current folder
npx ux-ui-agent-skills@3.0.0 new ./app   # scaffold a new product repo
npx ux-ui-agent-skills@3.0.0 list        # what each area contains
```

`demo` opens pages the gates measure. Delete the folder afterwards; nothing was
installed.

---

## What is the same everywhere

The half that does the work never depended on which agent is reading:

- **14 token files** in DTCG format: colour, typography, spacing, motion,
  theming, sizing, data-viz
- **52 component specs** with anatomy, variants, the eight states, token mapping
  and ARIA
- **2,144 named design systems**, each a complete spec
- **52 objective gates**: 34 open a real browser, 18 read files

Everything in the gate layer is plain Node and Python. Nothing in it knows which
agent called it.

---

## Running the gates

The gates are the point. Pointed at your own files:

```bash
python3 scripts/validate_tokens.py    <your-tokens.json>
python3 scripts/validate_contrast.py  <your-tokens.json>
python3 scripts/lint_hardcodes.py     <your src>
node scripts/verify_states.mjs        <your page>          # contrast in default/hover/focus
node scripts/axe_audit.mjs            <your page>
node scripts/verify_responsive.mjs    <your src> --scale=1.25
node scripts/verify_screen_economy.mjs <your page>
```

**The render gates need a browser, once per machine:**

```bash
npm install && npx playwright install chrome
```

Without it a render gate prints `SKIPPED` and exits 0. That is not a pass. It
is a run that measured nothing. Set `DS_REQUIRE_BROWSER=1` when you intend to
trust the exit code, and it fails loudly instead.

> `node scripts/accuracy_report.mjs` is the kit's **own** self-test. It points at
> the kit's examples and will report a low score anywhere else. A real Codex run
> scored 17/50 in a freshly installed project, which means nothing about that
> project. Run it only inside a clone of the kit.

---

## What none of this measures

Objective correctness: tokens, contrast, accessibility, drift. Not whether the
work is any good.

For the half no script can score there is `/critique`, an adversarial reviewer
that renders the work, argues for rejection, and cites evidence per finding. It
runs in a forked context so it never sees the reasoning that produced the work,
because a critic holding the maker's argument reviews the argument instead of
the artifact.

No number in this project covers taste, and every gate that prints one says so.

---

*Measured against v2.9.6. `npm` · `brew install plugin87/tap/ux-ui-agent-skills` ·
[github.com/plugin87/ux-ui-agent-skills](https://github.com/plugin87/ux-ui-agent-skills)*
