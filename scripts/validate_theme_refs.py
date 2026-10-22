#!/usr/bin/env python3
"""Verify every CSS variable a component references is DEFINED in the shared theme.

This is the precision gate: a component that uses var(--color-foo) which the theme never
defines renders wrong (a "floating token" = drift = inconsistency across pages). It also
proves theme + components stay in lock-step.

Usage:
  python3 scripts/validate_theme_refs.py                          # defaults to examples/golden
  python3 scripts/validate_theme_refs.py theme.css src/           # your theme + your code
  python3 scripts/validate_theme_refs.py --theme a.css --theme b.css src/
Exit 0 = every referenced var resolves; 1 = a reference resolves to nothing.

A page composes its theme from more than one file and then defines a few of its
own on top, so a single theme file was never the whole answer: --theme repeats,
and a custom property defined inside the scanned file counts as defined there.
A reference carrying a fallback - var(--x, 8px) - cannot render wrong, so it is
reported and not failed.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEF = re.compile(r"(--[A-Za-z0-9_-]+)\s*:")            # --x: value  (a definition)
REF = re.compile(r"var\(\s*(--[A-Za-z0-9_-]+)\s*(,[^)]*)?\)")  # group 2 is the fallback, if any
CODE_EXT = {".css", ".scss", ".tsx", ".jsx", ".ts", ".js", ".vue", ".svelte", ".html", ".astro"}


def collect_defs(theme_paths):
    defined = set()
    for tp in theme_paths:
        p = Path(tp)
        if p.is_file():
            for m in DEF.finditer(p.read_text(encoding="utf-8")):
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
    theme_paths, code_paths = [], []
    i = 0
    while i < len(argv):
        if argv[i] == "--theme" and i + 1 < len(argv):
            theme_paths.append(argv[i + 1]); i += 2
        else:
            code_paths.append(argv[i]); i += 1
    # the old two-argument form: first path is the theme
    if not theme_paths and len(code_paths) >= 2:
        theme_paths, code_paths = [code_paths[0]], code_paths[1:]
    if not theme_paths and not code_paths:
        theme_paths = [ROOT / "examples" / "golden" / "theme.css"]
        code_paths = [ROOT / "examples" / "golden"]
    if not theme_paths or not code_paths:
        print("ERROR: give at least one --theme and one path to scan.")
        return 1

    missing_paths = [str(x) for x in list(theme_paths) + list(code_paths) if not Path(x).exists()]
    if missing_paths:
        # Scanning nothing must not read as clean.
        print("ERROR: path(s) not found: " + ", ".join(missing_paths))
        return 1

    shared = collect_defs(theme_paths)
    if not shared:
        print(f"ERROR: no CSS variables defined in theme ({[str(t) for t in theme_paths]}).")
        return 1

    files = list(iter_files(code_paths))
    if not files:
        print(f"ERROR: no scannable file(s) under {', '.join(str(c) for c in code_paths)}")
        return 1

    missing, with_fallback, unreadable, scanned = [], 0, [], 0
    for f in files:
        try:
            text = f.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError) as err:
            unreadable.append((f, err)); continue
        scanned += 1
        # A page may define its own custom properties; those are definitions too.
        defined = shared | {m.group(1) for m in DEF.finditer(text)}
        for n, line in enumerate(text.splitlines(), 1):
            for m in REF.finditer(line):
                var = m.group(1)
                if var in defined:
                    continue
                if m.group(2):
                    with_fallback += 1
                    continue
                missing.append(f"{f}:{n}: var({var}) resolves to nothing")

    print(f"Theme defines {len(shared)} tokens; scanned {scanned} of {len(files)} file(s).")
    if with_fallback:
        print(f"  {with_fallback} reference(s) to an undefined token carry a fallback - not a failure.")
    for f, err in unreadable:
        print(f"ERROR: could not read {f}: {err}", file=sys.stderr)
    if unreadable:
        print(f"FAIL: {len(unreadable)} file(s) could not be read, so this run cannot report clean.")
        return 1
    if missing:
        print(f"\nFAIL: {len(missing)} reference(s) resolve to nothing:")
        for mm in missing:
            print("  x " + mm)
        return 1
    print("OK: every token reference resolves, in the theme or in the file itself.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
