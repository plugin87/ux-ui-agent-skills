#!/usr/bin/env python3
"""Browse and apply the design-system library (design-systems/library/).

Usage:
  python3 scripts/design_systems.py list                 # all systems by category
  python3 scripts/design_systems.py search <term>        # name/description match
  python3 scripts/design_systems.py show <name>          # print a system's DESIGN.md path + summary
  python3 scripts/design_systems.py categories           # category counts
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LIB = ROOT / "design-systems" / "library"


def meta(p):
    """Return (category, description) from a DESIGN.md header."""
    cat, desc = "Uncategorized", ""
    for line in p.read_text(errors="ignore").splitlines()[:12]:
        if line.startswith("> Category:"):
            cat = line.split(":", 1)[1].strip()
        elif line.startswith("> ") and "Category:" not in line and not desc:
            desc = line[2:].strip()
    return cat, desc


def systems():
    if not LIB.is_dir():
        return {}
    out = {}
    for d in sorted(LIB.iterdir()):
        f = d / "DESIGN.md"
        if f.is_file():
            out[d.name] = (f, *meta(f))
    return out


def cmd_list(s):
    by_cat = {}
    for name, (_, cat, desc) in s.items():
        by_cat.setdefault(cat, []).append((name, desc))
    for cat in sorted(by_cat):
        print(f"\n{cat} ({len(by_cat[cat])})")
        for name, desc in by_cat[cat]:
            print(f"  {name:24} {desc[:60]}")


def cmd_search(s, term):
    t = term.lower()
    hits = [(n, d) for n, (_, c, d) in s.items() if t in n.lower() or t in d.lower() or t in c.lower()]
    if not hits:
        print(f"No match for {term!r}.")
        return
    for n, d in hits:
        print(f"  {n:24} {d[:60]}")


def cmd_show(s, name):
    if name not in s:
        print(f"Unknown system {name!r}. Try: search {name}")
        return 1
    f, cat, desc = s[name]
    print(f"{name}  [{cat}]\n{desc}\n\nSpec: {f}")
    print("Apply: read this DESIGN.md, then map values via design-systems/interop-protocol.md")
    return 0


def main(argv):
    s = systems()
    if not s:
        print(f"No library at {LIB}")
        return 1
    if not argv or argv[0] == "list":
        cmd_list(s)
    elif argv[0] == "categories":
        from collections import Counter
        c = Counter(cat for _, cat, _ in s.values())
        for cat, n in sorted(c.items()):
            print(f"  {n:3}  {cat}")
        print(f"\nTotal: {len(s)} systems")
    elif argv[0] == "search" and len(argv) > 1:
        cmd_search(s, argv[1])
    elif argv[0] == "show" and len(argv) > 1:
        return cmd_show(s, argv[1])
    else:
        print(__doc__)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
