#!/usr/bin/env python3
"""AGENTS.md carries the same doctrine as CLAUDE.md, or it is a worse kit.

Two instruction surfaces is two chances to drift. `CLAUDE.md` is for Claude Code,
where skills load on demand and hooks fire whether or not the model remembers;
`AGENTS.md` is the open convention that Codex, Cursor, Copilot, Jules, Aider, VS
Code and about twenty more read. They describe the same design system, so a rule
that only reaches one of them is a rule half the users never see.

This holds four things:

  1. Every always-on rule in CLAUDE.md is present in AGENTS.md too. Not the same
     wording - the surfaces have different shapes - but the same rule, matched by
     the pattern that defines it.
  2. AGENTS.md names the one-command gate, because without it the whole
     verification doctrine is advice.
  3. Every script AGENTS.md tells the agent to run actually exists. A command that
     does not resolve teaches the agent the gates are optional.
  4. It stays inside a line budget. AGENTS.md is read on every turn, exactly like
     CLAUDE.md, and the same discipline applies: depth belongs in the files it
     points at.

It also requires AGENTS.md to say what it CANNOT enforce. Claude Code has hooks
and this surface does not, and an instruction file that quietly implies parity is
the kind of claim this repo exists to refuse.

Usage:
  python3 scripts/validate_agents_surface.py
  python3 scripts/validate_agents_surface.py --root DIR   # check a copy
Exit 0 = the two surfaces agree; 1 = they do not.
"""
import re
import sys
from pathlib import Path

MAX_LINES = 240


def _root(argv):
    if "--root" in argv:
        i = argv.index("--root")
        if i + 1 < len(argv):
            return Path(argv[i + 1]).resolve()
    return Path(__file__).resolve().parent.parent


# (label, regex) - the rule, however each surface chooses to word it.
SHARED_RULES = [
    ("the emoji ban, stated absolutely", r"[Zz]ero emoji|ABSOLUTE: zero emoji"),
    ("the emoji gate, named", r"check_no_emoji\.py"),
    ("the one-command gate, named", r"accuracy_report\.mjs"),
    ("never state an unmeasured number", r"[Nn]ever state a number you did not measure"),
    ("SKIPPED is not a pass", r"SKIPPED"),
    ("render and look", r"[Ss]creenshot"),
    ("token by intent", r"[Tt]oken by intent"),
    ("one shared theme", r"[Oo]ne theme, one source of truth"),
    ("the eight states", r"[Ee]ight states"),
    ("one thing leads", r"[Oo]ne thing leads"),
    ("mobile is the base", r"[Mm]obile is the base"),
    ("no native select", r"[Nn]ever a native `?<select>?`?|[Nn]ever ship a native"),
    ("no one-sided accent border", r"colored border on one side only|ONE SIDE ONLY"),
    ("output completeness", r"partial output is a broken output"),
    ("the taste preflight", r"Domain:\s"),
]

# Scripts named in a runnable position, so a typo is caught rather than shipped.
CMD = re.compile(r"(?:node|python3)\s+(scripts/[A-Za-z0-9_]+\.(?:mjs|py))")


def main(argv):
    root = _root(argv)
    agents = root / "AGENTS.md"
    claude = root / "CLAUDE.md"

    problems = []

    if not agents.exists():
        print(f"ERROR: {agents} not found.")
        return 1
    text = agents.read_text()
    lines = text.splitlines()

    for label, pattern in SHARED_RULES:
        if not re.search(pattern, text):
            problems.append(f"AGENTS.md no longer states {label}")

    # Whatever CLAUDE.md promises, AGENTS.md has to promise too.
    if claude.exists():
        ctext = claude.read_text()
        for label, pattern in SHARED_RULES:
            in_claude = bool(re.search(pattern, ctext))
            in_agents = bool(re.search(pattern, text))
            if in_claude and not in_agents:
                problems.append(f"CLAUDE.md states {label} and AGENTS.md does not - the surfaces drifted")
    else:
        problems.append("CLAUDE.md not found, so the two surfaces cannot be compared")

    # Every command it tells the agent to run must exist.
    for script in sorted(set(CMD.findall(text))):
        if not (root / script).exists():
            problems.append(f"AGENTS.md tells the agent to run {script}, which does not exist")

    # It must be honest about what it cannot enforce.
    if not re.search(r"hook", text, re.I):
        problems.append(
            "AGENTS.md does not mention hooks. It has none, Claude Code does, and a "
            "surface that stays silent about that implies a parity it does not have")

    if len(lines) > MAX_LINES:
        problems.append(
            f"AGENTS.md is {len(lines)} lines, over the {MAX_LINES}-line budget. It is read "
            f"on every turn; depth belongs in the files it points at")

    print(f"AGENTS.md: {len(lines)}/{MAX_LINES} lines, {len(SHARED_RULES)} shared rules checked, "
          f"{len(set(CMD.findall(text)))} script(s) named.")

    if problems:
        print(f"\nFAIL: {len(problems)} problem(s) on the agent-neutral surface:")
        for p in problems:
            print(f"  x {p}")
        return 1

    print("OK: AGENTS.md carries every rule CLAUDE.md does, names only scripts that exist,")
    print("    and says plainly what it cannot enforce.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
