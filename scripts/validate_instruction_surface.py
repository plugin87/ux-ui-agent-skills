#!/usr/bin/env python3
"""Guard the always-on instruction surface after the CLAUDE.md split.

CLAUDE.md loads on every turn, so depth was moved to .claude/rules/ and loads only
when the work calls for it. That split has two failure modes, and this gate catches
both:

  1. A critical always-on rule gets demoted into a rule file, where the model may
     never read it (the emoji ban and the gate protocol must never move).
  2. A rule file becomes an orphan: it exists, nothing routes to it, so it is dead
     weight that never loads. Or the router points at a file that is gone.

It also holds the line on size: the whole point of the split is that the always-on
brief stays short.

Usage:
  python3 scripts/validate_instruction_surface.py
Exit 0 = surface intact, 1 = a rule was demoted, orphaned, or the brief regrew.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BRIEF = ROOT / "CLAUDE.md"
RULES = ROOT / ".claude" / "rules"
MAX_LINES = 320

# (label, regex) - must be present in CLAUDE.md itself, not only in a rule file.
ALWAYS_ON = [
    ("emoji ban, stated as absolute",      r"ABSOLUTE: zero emoji"),
    ("emoji gate named",                   r"check_no_emoji\.py"),
    ("one-command gate named",             r"accuracy_report\.mjs"),
    ("never state an unmeasured number",   r"[Nn]ever state a number you did not measure"),
    ("render and look",                    r"RENDER AND LOOK|screenshot"),
    ("decision framework",                 r"##\s+Decision Framework"),
    ("request router",                     r"##\s+Request Router"),
    ("token by intent",                    r"[Tt]oken by intent"),
    ("single shared theme",                r"[Oo]ne theme, one source of truth|Single-Theme Consistency"),
    ("the 8 states",                       r"\|\s*8\s*\|\s*Selected"),
    ("output completeness",                r"partial output is a broken output"),
]


def main():
    issues = []
    brief = BRIEF.read_text(encoding="utf-8")
    n_lines = len(brief.splitlines())

    for label, pattern in ALWAYS_ON:
        if not re.search(pattern, brief):
            issues.append(f"demoted: CLAUDE.md no longer states the {label}")

    if n_lines > MAX_LINES:
        issues.append(f"size: CLAUDE.md is {n_lines} lines, over the {MAX_LINES}-line always-on budget")

    routed = set(re.findall(r"\.claude/rules/([a-z0-9-]+\.md)", brief))
    on_disk = {p.name for p in RULES.glob("*.md")} if RULES.is_dir() else set()
    for orphan in sorted(on_disk - routed):
        issues.append(f"orphan: .claude/rules/{orphan} exists but CLAUDE.md never routes to it")
    for missing in sorted(routed - on_disk):
        issues.append(f"dangling: CLAUDE.md routes to .claude/rules/{missing}, which does not exist")

    print(f"CLAUDE.md: {n_lines}/{MAX_LINES} lines, {len(ALWAYS_ON)} always-on rules checked, "
          f"{len(on_disk)} rule file(s), {len(routed)} routed.")
    if issues:
        print(f"\nFAIL: {len(issues)} problem(s) on the instruction surface:")
        for i in issues:
            print("  x " + i)
        return 1
    print("OK: always-on rules intact, every rule file routed, brief within budget.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
