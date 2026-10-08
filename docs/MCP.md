# The MCP server

```bash
claude mcp add ux-ui-gates -- npx -y ux-ui-agent-skills ux-ui-mcp
```

Or, in any MCP client's config:

```json
{
  "mcpServers": {
    "ux-ui-gates": {
      "command": "npx",
      "args": ["-y", "ux-ui-agent-skills", "ux-ui-mcp"]
    }
  }
}
```

From a clone, `node mcp/server.mjs`.

## What it is for

The half of this kit that does the work — the tokens, the component specs, the
doctrine, and **all 52 gates** — never depended on which agent was reading.
`AGENTS.md` already lets Codex, Cursor and Copilot read the doctrine. This lets
any MCP client **run the gates**, which reading alone cannot do.

That is the part worth having. Plenty of things can tell an agent what good UI
looks like. Very little can tell it, afterwards, that the contrast it shipped is
3.9:1 on hover.

## The six tools

| Tool | What it does |
|---|---|
| `list_gates` | Every gate, what it measures, whether it needs a browser. Call it first: its names are what `run_gate` accepts. |
| `run_gate` | Run one gate against paths. Returns the gate's own output and exit code, unedited. |
| `review_ui` | Run every applicable gate and report a per-gate verdict, with the full output of each failure. |
| `get_doctrine` | The written rules, by topic: tokens, typography, components, accessibility, frameworks, taste, review, brand, agents. |
| `get_design_system` | One of the brand-grade `DESIGN.md` specs, or the list of them. |
| `get_tokens` | The DTCG token source, as a starting point for a project theme. |

The intended order is `get_doctrine` and `get_tokens` **before** generating,
`review_ui` after. A gate run after the fact catches less than a rule read
before.

## Exit codes, and why there are three

| Code | Meaning |
|---|---|
| 0 | It looked, and found nothing wrong |
| 1 | It looked, and found something |
| 2 | **It could not look** |

Two is the one that matters. A path that does not exist, a gate with no browser,
a missing theme — none of those is a pass, and the server reports them as errors
rather than letting a clean-looking result stand for a run that measured
nothing. `DS_REQUIRE_BROWSER=1` is set on every call for the same reason: a
render gate with no browser would otherwise print SKIPPED and exit 0.

## What it will not do

It returns what the gates printed. It does not summarise them, does not turn a
failure into advice, and does not produce a number no gate produced.

The kit's first rule is *never state a number you did not measure*, and a server
that paraphrased its own gates would be the most convenient place in the whole
system to break it. If `review_ui` says 11/14, those are eleven real exit codes.

It also does not measure whether the work is any good. No number here covers
taste; `review_ui` says so in its own output every time.

## No dependencies

The kit ships with `"dependencies": {}` and says so on its front page. Adding an
MCP SDK to expose it would make that false for everyone who installs it, so the
protocol is implemented directly: MCP is JSON-RPC 2.0 over stdio, and the four
methods a tools-only server needs are about forty lines. Written against the
`2025-06-18` specification.

The render gates still need a browser — `npx playwright install chrome`, once
per machine. `list_gates` says which gates those are, and `review_ui`'s
`skip_browser` runs only the file-reading ones and states in its output that the
result covers less.

## Checking it works

```bash
node mcp/server.mjs --selftest
```

Drives the real handshake and calls every tool it advertises, including the
cases that matter most: a missing path is refused rather than passed, an unknown
gate names `list_gates`, and an unknown tool is a JSON-RPC error rather than a
tool result. An MCP server nobody has spoken to is a plausible-looking file.
