#!/usr/bin/env python3
"""Verify every CSS variable a component references is DEFINED in the shared theme.

This is the precision gate: a component that uses var(--color-foo) which the theme never
defines renders wrong (a "floating token" = drift = inconsistency across pages). It also
proves theme + components stay in lock-step.

Usage:
  python3 scripts/validate_theme_refs.py                         # defaults to examples/golden
  python3 scripts/validate_theme_refs.py path/to/theme.css src/  # your theme + your code
Exit 0 = every referenced var is defined; 1 = a component references an undefined token.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEF = re.compile(r"(--[A-Za-z0-9_-]+)\s*:")            # --x: value  (a definition)
REF = re.compile(r"var\(\s*(--[A-Za-z0-9_-]+)\s*(?:,[^)]*)?\)")  # var(--x) or var(--x, fallback)
CODE_EXT = {".css", ".scss", ".tsx", ".jsx", ".ts", ".js", ".vue", ".svelte", ".html", ".astro"}


def collect_defs(theme_paths):
    defined = set()
    for tp in theme_paths:
        p = Path(tp)
        if p.is_file():
            for m in DEF.finditer(p.read_text()):
                defined.add(m.group(1))
    return defined


def iter_files(paths):
    for p in paths:
        pp = Path(p)
        if pp.is_dir():
            for f in pp.rglob("*"):
                if f.suffix in CODE_EXT and "node_modules" not in f.parts:
                    yield f
        elif pp.is_file() and pp.suffix in CODE_EXT:
            yield pp


def main(argv):
    if len(argv) >= 2:
        theme_paths = [argv[0]]
        code_paths = argv[1:]
    else:
        theme_paths = [ROOT / "examples" / "golden" / "theme.css"]
        code_paths = [ROOT / "examples" / "golden"]

    defined = collect_defs(theme_paths)
    # a theme can reference its own vars (aliases) — those are fine; we add them as defined too
    if not defined:
        print(f"ERROR: no CSS variables defined in theme ({theme_paths}).")
        return 1

    missing = []
    for f in iter_files(code_paths):
        try:
            text = f.read_text()
        except (UnicodeDecodeError, OSError):
            continue
        for n, line in enumerate(text.splitlines(), 1):
            for m in REF.finditer(line):
                var = m.group(1)
                if var not in defined:
                    missing.append(f"{f}:{n}: var({var}) is NOT defined in the theme")

    print(f"Theme defines {len(defined)} tokens.")
    if missing:
        print(f"\nFAIL: {len(missing)} reference(s) to undefined theme token(s):")
        for mm in missing:
            print("  x " + mm)
        return 1
    print("OK: every component token reference resolves to a defined theme token.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
