#!/usr/bin/env python3
"""Heuristic anti-slop taste linter for generated HTML/JSX.

Automates the high-signal half of the pre-flight aesthetic check in taste/design-taste.md.
Taste is subjective — treat findings as advisory nudges, not hard truth. Point it at the
markup you generated.

Usage:
  python3 scripts/lint_taste.py page.html Hero.tsx
  python3 scripts/lint_taste.py --strict src/   # exit 1 on any finding (for CI)

Checks:
  - pure #000 / #fff used for text or background (use off-black/off-white tokens)
  - emoji used where an icon belongs (visual slop tell)
  - too many distinct accent hues (> 6) — palette sprawl
  - text-align: justify (rivers; banned for body)
  - very long headings (likely wrap past 3 lines)
Exit 0 unless --strict and findings exist.
"""
import re
import sys
from pathlib import Path

CODE_EXT = {".html", ".tsx", ".jsx", ".vue", ".svelte", ".css", ".scss", ".js", ".ts"}
PURE = re.compile(r"#(?:000(?:000)?|fff(?:fff)?)\b", re.I)
HEX = re.compile(r"#[0-9a-fA-F]{6}\b")
JUSTIFY = re.compile(r"text-align\s*:\s*justify|\btext-justify\b")
EMOJI = re.compile("[" "\U0001F300-\U0001FAFF" "\U00002600-\U000027BF" "\U0001F000-\U0001F0FF" "]")
HEADING = re.compile(r"<h[12][^>]*>(.*?)</h[12]>", re.I | re.S)


def iter_files(paths):
    for p in paths:
        pp = Path(p)
        if pp.is_dir():
            for f in pp.rglob("*"):
                if f.suffix in CODE_EXT and "node_modules" not in f.parts:
                    yield f
        elif pp.is_file():
            yield pp


def lint(f):
    out = []
    try:
        text = f.read_text()
    except (UnicodeDecodeError, OSError):
        return out
    for n, line in enumerate(text.splitlines(), 1):
        if PURE.search(line) and "ds-allow" not in line:
            out.append((n, "pure #000/#fff — use an off-black/off-white token"))
        if JUSTIFY.search(line):
            out.append((n, "text-align: justify — banned for body (creates rivers)"))
        if EMOJI.search(line) and re.search(r"icon|<span|<i\b|aria-hidden", line, re.I):
            out.append((n, "emoji used as an icon — use a real SVG icon (taste tell)"))
    # whole-file checks
    hues = {h.lower() for h in HEX.findall(text)}
    if len(hues) > 6:
        out.append((0, f"{len(hues)} distinct hex colors — palette sprawl (cap accents; use tokens)"))
    for h in HEADING.findall(text):
        words = len(re.sub(r"<[^>]+>", "", h).split())
        if words > 12:
            out.append((0, f"long heading ({words} words) — likely wraps >3 lines; tighten or scale up"))
    return out


def main(argv):
    strict = "--strict" in argv
    paths = [a for a in argv if not a.startswith("--")]
    if not paths:
        print(__doc__)
        return 0
    files = list(iter_files(paths))
    total = 0
    for f in files:
        for n, msg in lint(f):
            loc = f"{f}:{n}" if n else f"{f}"
            print(f"{loc}: {msg}")
            total += 1
    print(f"\nScanned {len(files)} file(s). {total} taste finding(s) (advisory).")
    return 1 if (strict and total) else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
