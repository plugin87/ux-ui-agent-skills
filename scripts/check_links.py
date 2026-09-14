#!/usr/bin/env python3
"""Every relative link in the docs must resolve to a file that exists.

Splitting a long README into README + docs/GUIDE.md + CHANGELOG.md is exactly
when links rot: a path that was correct from the repo root is wrong one
directory down, and nothing notices until a reader clicks it. Four links broke
in the split that produced this script.

Anchors (#section) are not verified - GitHub's slug rules are not worth
reimplementing, and a wrong anchor still lands the reader on the right page.
External URLs are not fetched: a gate that depends on the network is a gate that
fails for the wrong reason.

Usage:
  python3 scripts/check_links.py [file-or-dir ...]     (default: the doc surface)
Exit 0 = every relative link resolves, 1 = at least one does not.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEFAULT = ["README.md", "CONTRIBUTING.md", "CODE_OF_CONDUCT.md", "CHANGELOG.md",
           "CLAUDE.md", "docs", ".claude/rules", ".claude/skills", ".claude/commands"]
LINK = re.compile(r"\]\(\s*([^)\s]+?)\s*\)")
SKIP_PREFIX = ("http://", "https://", "mailto:", "#", "tel:")


def files(paths):
    for p in paths:
        pp = ROOT / p
        if pp.is_dir():
            yield from sorted(pp.rglob("*.md"))
        elif pp.is_file():
            yield pp


def main(argv):
    targets = argv or DEFAULT
    missing_inputs = [t for t in argv if not (ROOT / t).exists()]
    if missing_inputs:
        print("ERROR: path(s) not found: " + ", ".join(missing_inputs))
        return 1

    checked = 0
    broken = []
    for f in files(targets):
        text = f.read_text(encoding="utf-8")
        for m in LINK.finditer(text):
            target = m.group(1).split("#")[0].strip()
            if not target or target.startswith(SKIP_PREFIX):
                continue
            checked += 1
            resolved = (f.parent / target).resolve()
            if not resolved.exists():
                line = text[: m.start()].count("\n") + 1
                broken.append(f"{f.relative_to(ROOT)}:{line}: {target}")

    print(f"Checked {checked} relative link(s) across {len(list(files(targets)))} file(s).")
    if broken:
        print(f"\nFAIL: {len(broken)} link(s) point at nothing:")
        for b in broken:
            print("  x " + b)
        return 1
    print("OK: every relative link resolves.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
