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
| **Claude Code** | `/plugin marketplace add plugin87/ux-ui-agent-skills` | 25 skills, hooks, the critic |
| **Codex, Cursor, Copilot, Aider** | `npx ux-ui-agent-skills init --agent codex` | `AGENTS.md` + every gate |
| **Any MCP client** | `claude mcp add ux-ui-gates -- npx -y --package=ux-ui-agent-skills ux-ui-mcp` | 6 tools that run the gates |
| **A terminal, any project** | `brew install plugin87/tap/ux-ui-agent-skills` | the CLI and the MCP binary |
| **Just looking** | `npx ux-ui-agent-skills demo` | the rendered examples, nothing installed |

---

## 1. Claude Code plugin — the most complete

```
/plugin marketplace add plugin87/ux-ui-agent-skills
/plugin install ux-ui-agent-skills@ux-ui-agent-skills
```

This is the only route that carries the parts Claude Code can **enforce** rather
than request:

- **25 skills** that load on demand. Ask for a screen and `design-screen` loads
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

## 2. Codex, Cursor, Copilot, Aider — the open convention

```bash
cd your-project
npx ux-ui-agent-skills init --agent codex
```

Writes `AGENTS.md` at the repository root — an open convention roughly 25 tools
read without any setup — plus the tokens, component specs, taste doctrine, the
138 design systems and **all 52 gates**.

It deliberately does **not** write `.claude/`. Skills, rules and the critic are
Claude Code mechanisms; on this route they would be dead files.

**What you lose, stated plainly:** the hooks. On Claude Code three rules are
enforced without the model choosing to. Here every rule is a request and the
gates run when you run them. That makes running them the whole difference
between this kit working and not working.

```bash
npx ux-ui-agent-skills init --agent both   # both surfaces, held in step by a gate
```

---

## 3. MCP — any client can run the gates

```bash
claude mcp add ux-ui-gates -- npx -y --package=ux-ui-agent-skills ux-ui-mcp
```

Or in any MCP client's config:

```json
{
  "mcpServers": {
    "ux-ui-gates": {
      "command": "npx",
      "args": ["-y", "--package=ux-ui-agent-skills", "ux-ui-mcp"]
    }
  }
}
```

> `--package=` is load-bearing. This package's name is also one of its bin
> names, so `npx -y ux-ui-agent-skills ux-ui-mcp` runs the installer CLI and
> hands it `ux-ui-mcp` as an argument — you get a help screen and a client that
> never completes a handshake.

Six tools:

| Tool | What it does |
|---|---|
| `list_gates` | Every gate, what it measures, whether it needs a browser |
| `run_gate` | Run one gate, get its output and exit code unedited |
| `review_ui` | Run every applicable gate, per-gate verdict |
| `get_doctrine` | The written rules, by topic |
| `get_design_system` | One of the 138 specs |
| `get_tokens` | The DTCG token source |

`AGENTS.md` lets an agent **read** the doctrine. This lets it **run the gates**,
which reading cannot do. Plenty of things describe good UI; very little tells
you afterwards that the contrast you shipped is 3.9:1 on hover.

It returns what the gates printed, with their exit codes: **0** looked and found
nothing, **1** found something, **2** could not look — never a pass.

---

## 4. Homebrew — the CLI on your machine

```bash
brew install plugin87/tap/ux-ui-agent-skills
```

One line. No `brew tap` first — Homebrew sees `owner/tap/name` and clones the
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

## 5. npx — nothing installed

```bash
npx ux-ui-agent-skills demo        # copy the rendered examples and open them
npx ux-ui-agent-skills init        # the full kit into the current folder
npx ux-ui-agent-skills new ./app   # scaffold a new product repo
npx ux-ui-agent-skills list        # what each area contains
```

`demo` opens pages the gates measure. Delete the folder afterwards; nothing was
installed.

---

## What is the same everywhere

The half that does the work never depended on which agent is reading:

- **14 token files** in DTCG format — colour, typography, spacing, motion,
  theming, sizing, data-viz
- **52 component specs** with anatomy, variants, the eight states, token mapping
  and ARIA
- **138 named design systems**, each a complete spec
- **52 objective gates** — 34 open a real browser, 18 read files

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

Without it a render gate prints `SKIPPED` and exits 0. That is not a pass — it
is a run that measured nothing. Set `DS_REQUIRE_BROWSER=1` when you intend to
trust the exit code, and it fails loudly instead.

> `node scripts/accuracy_report.mjs` is the kit's **own** self-test. It points at
> the kit's examples and will report a low score anywhere else — a real Codex run
> scored 17/50 in a freshly installed project, which means nothing about that
> project. Run it only inside a clone of the kit.

---

## What none of this measures

Objective correctness: tokens, contrast, accessibility, drift. Not whether the
work is any good.

For the half no script can score there is `/critique` — an adversarial reviewer
that renders the work, argues for rejection, and cites evidence per finding. It
runs in a forked context so it never sees the reasoning that produced the work,
because a critic holding the maker's argument reviews the argument instead of
the artifact.

No number in this project covers taste, and every gate that prints one says so.

---

*Measured against v2.9.6. `npm` · `brew install plugin87/tap/ux-ui-agent-skills` ·
[github.com/plugin87/ux-ui-agent-skills](https://github.com/plugin87/ux-ui-agent-skills)*
