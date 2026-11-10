# Security

What this kit writes, what it runs, and what it sends over the network, stated
so you can check each claim against the code before you install it. Every
statement below names the file that makes it true.

## Supported versions

Only the latest release gets security fixes. Every `npx` command in these docs
names that release exactly (`ux-ui-agent-skills@3.0.0`), so you run the
tarball the docs describe and never whatever is newest on npm.
`npm run pins:check` fails the build if a command is left unpinned.

## Reporting a vulnerability

Report it privately on GitHub: the **Security** tab of
[plugin87/ux-ui-agent-skills](https://github.com/plugin87/ux-ui-agent-skills/security),
then **Report a vulnerability**. Please do not open a public issue for it.
The report stays private between you and the maintainer until a fix is
released. A fix ships as a patch release, and the CHANGELOG entry names what
was fixed once the release is out.

## No telemetry

Nothing in the kit sends data anywhere. There is no analytics, no usage ping and
no crash reporting. The only network access is the design-system fetch
described below, and it only downloads.

You can check this yourself: the only `fetch(` in the shipped code is in
`scripts/library.mjs`, which the CLI and the MCP server call to get a spec. (`scripts/update_homebrew_formula.mjs` also fetches,
from the npm registry, but it is a maintainer release script that the CLI,
hooks, skills and MCP server never call.)

## What `init` writes

`init` copies files into the folder you run it in and does nothing else. It
does not run a script after installing, write a hook, edit a `settings.json`, or
touch anything outside that folder. A file that already exists is skipped
unless you pass `--force`.

**See the exact list before anything is written:**

```bash
npx ux-ui-agent-skills@3.0.0 init --dry-run
```

`--dry-run` prints every file the real run would write and changes nothing.
`tests/cli/dry-run.test.mjs` runs both and fails if the two lists differ, or if
the dry run creates so much as an empty folder.

With the default `--agent claude`, `init` writes these paths (from `AREAS` in
`bin/cli.js`):

| Path | What it is |
|---|---|
| `CLAUDE.md` | The instructions Claude Code loads as project context |
| `.claude/skills/` | The 26 skills, one `SKILL.md` each |
| `.claude/rules/` | Rule files the instructions load on demand |
| `.claude/agents/design-critic.md` | The reviewer behind `/critique` |
| `tokens/`, `components/`, `taste/`, `frameworks/`, `accessibility/`, `workflows/`, `content/` | Reference files: JSON tokens and Markdown |
| `design-systems/` | The library index (`library.json`, with the sha256 of every spec) and the interop docs. No spec is copied |
| `scripts/` | The gates: Node and Python scripts you run, or the skills run |
| `examples/` | The reference pages the gates measure |
| `templates/` | The starter layout `new` scaffolds from |

`--agent codex` writes `AGENTS.md` instead of `CLAUDE.md` and leaves out
`.claude/`. `--agent gemini` writes `GEMINI.md` and `.agents/skills/` instead.
`add <area>` writes only the areas you name. `new <dir>` writes the starter
layout from `templates/product-design/` plus the same reference areas.

**What `init` never writes:** hooks, settings, and anything outside the target
folder.

## Hooks: only with the Claude Code plugin

The hooks come with the plugin install (`/plugin install`), declared in
`hooks/hooks.json`. The `npx`, Homebrew and clone routes install no hooks.

| Hook | Fires | What it does |
|---|---|---|
| `session-start-preflight.mjs` | When a session starts, resumes, clears or compacts | Checks whether a browser exists for the render gates, without launching one, and prints the answer into the session context. Writes one line to the local event log, and deletes the log's own files older than 30 days |
| `posttooluse-fast-gates.mjs` | After every `Write` or `Edit` of a `.html`, `.htm`, `.css`, `.scss`, `.tsx`, `.jsx`, `.vue` or `.svelte` file | Runs three Python checks on that one file (`lint_hardcodes.py`, `check_no_emoji.py`, `lint_native_select.py`) and adds the file's path to this session's ledger |
| `stop-require-measurement.mjs` | When Claude finishes a turn | Reads the ledger. If the session edited a page that no passing gate has measured since its last edit, it blocks the turn from ending and says which page. It runs no gate itself |

All three write only to the plugin's data directory (`$CLAUDE_PLUGIN_DATA`,
which Claude Code provides), or to `.ds-receipts/` in the project when that is
not set. They record file paths, timestamps, each gate's exit code and up to
six of its finding lines (a finding line can quote the offending value, such
as a hex colour), never whole files. `DS_OBSERVE=0` turns off the event log. `scripts/observe.mjs` reads
those logs (the plugin's folder under `~/.claude/plugins/data/`, or
`.ds-receipts/`) and reports on them. It reads local files only, and writes
only the HTML report you ask for with `--html`.

## Network access

**Design-system specs, on request.** `library get <name>` and `library pull`
(`scripts/library.mjs`) download specs from:

1. `https://raw.githubusercontent.com/plugin87/ux-ui-agent-skills/<tag>/design-systems/library/<name>/DESIGN.md`
2. `https://cdn.jsdelivr.net/gh/plugin87/ux-ui-agent-skills@<tag>/...` if the first fails

`<tag>` is the release tag recorded in the shipped `design-systems/library.json`.
The sha256 of every downloaded file is checked against that index before
anything is written, and a file that does not match is refused. Files are
written through a temporary file, so a failed download never leaves half a
spec behind. `UX_UI_LIBRARY_BASE` replaces both hosts with your own mirror, and
the sha256 check still applies.

**Render gates open your page in a local headless Chrome** (Playwright), from a
`file://` URL. If your page references remote fonts, images or scripts, the
browser fetches them as any browser would. The gates add no requests of their
own.

Nothing else in the CLI, the hooks or the MCP server opens a network
connection. The skills are instructions to your agent; they tell it to run
the kit's scripts, and the only one of those that downloads is the spec fetch
above.

## The MCP server

`ux-ui-mcp` (`mcp/server.mjs`) speaks JSON-RPC over stdio and has no
dependencies. `run_gate` runs only the gate scripts listed in `mcp/gates.mjs`,
by name, on the paths the client passes, and returns their output unedited.
`get_design_system` reads a spec from the kit, or in an npm install fetches it
once through `scripts/library.mjs` (sha256-checked as above) into
`$XDG_CACHE_HOME/ux-ui-agent-skills/<tag>/`, which defaults to
`~/.cache/ux-ui-agent-skills/<tag>/`. That cache and the plugin data
directory the hooks use are the only places outside your project the kit
writes. Every other tool reads the kit's own files. It
never runs a command the client writes.

## What the npm package contains

`files` in `package.json` is an allowlist. To see the exact contents of a
release before installing it:

```bash
npm pack ux-ui-agent-skills@3.0.0 --dry-run
```

The package has no `dependencies` and no install scripts (`preinstall`,
`install`, `postinstall`), so installing it runs no code. Releases are
published from GitHub Actions through npm trusted publishing, with signed
provenance that links each tarball to the commit and workflow that built it:
`npm audit signatures` checks it.

## Installed without the kit

`npx skills@1.7.6 add plugin87/ux-ui-agent-skills` copies the skill folders and
nothing else. Each skill checks for the kit first. Without it, most skills run
in **guidance-only mode**: they say so in their first line, run no gate, state
no measured number, and list the gates they skipped. The five skills whose
whole job is to run the kit (`gate`, `ship`, `observe`, `scaffold-project`,
`critique`) stop and name the install command instead.
