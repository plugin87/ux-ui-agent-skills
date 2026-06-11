#!/usr/bin/env python3
"""Fail if any emoji / decorative pictograph appears in UI output, the taste doctrine,
or the agent's own instruction surface.

The kit forbids emoji in product UI (taste/design-taste.md) — this enforces it so it
can't drift back. It also scans the files the AGENT reads on every run (CLAUDE.md,
the skills, component/workflow/content/accessibility specs): if those contain emoji,
the model imitates them and emits emoji-laden output. Keeping the instruction surface
emoji-free is what actually stops emoji in generated design systems.

Usage:
  python3 scripts/check_no_emoji.py                      # examples/ + taste/ + agent files
  python3 scripts/check_no_emoji.py path/to/src ...
Exit 0 = clean, 1 = an emoji/pictograph was found.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
# Scan product UI (examples), the taste doctrine, AND the agent's instruction surface —
# the files the model loads and imitates. README is marketing/branding and is excluded.
DEFAULT = [
    ROOT / "examples", ROOT / "taste",
    ROOT / "CLAUDE.md", ROOT / ".claude" / "skills",
    ROOT / "components", ROOT / "workflows", ROOT / "content",
    ROOT / "accessibility", ROOT / "frameworks",
    ROOT / "design-systems",
]
EXTS = {".md", ".mdx", ".html", ".htm", ".tsx", ".jsx", ".ts", ".js",
        ".vue", ".svelte", ".css", ".scss", ".astro", ".json"}

# Emoji + dingbat pictographs (check marks, stars, etc.). Deliberately EXCLUDES
# arrows (U+2190-21FF) and box-drawing, which are legitimate typographic notation.
# Ranges are referenced by codepoint only (this file stays emoji-free itself).
EMOJI = re.compile(
    "[\U0001F000-\U0001FAFF"   # symbols & pictographs, emoticons, transport, supplemental
    "\U00002600-\U000026FF"    # misc symbols
    "\U00002700-\U000027BF"    # dingbats (check marks, stars, scissors, ...)
    "\U00002B00-\U00002BFF"    # misc symbols & arrow pictographs (star, ...)
    "\U0001FA70-\U0001FAFF"
    "\U0000FE0F\U000020E3]"    # variation selector + combining keycap
)


def iter_files(paths):
    for p in paths:
        pp = Path(p)
        if pp.is_dir():
            for f in pp.rglob("*"):
                if f.suffix in EXTS and "node_modules" not in f.parts:
                    yield f
        elif pp.is_file():
            yield pp


UI_EXTS = {".html", ".htm", ".tsx", ".jsx", ".vue", ".svelte"}
DASH = re.compile("[—–]")  # em-dash / en-dash — an AI-pattern tell in UI copy

def main(argv):
    paths = [Path(a) for a in argv] or DEFAULT
    hits = []
    files = list(iter_files(paths))
    for f in files:
        try:
            text = f.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        ui = f.suffix in UI_EXTS
        for n, line in enumerate(text.splitlines(), 1):
            for m in EMOJI.finditer(line):
                hits.append(f"{f}:{n}: emoji/pictograph {m.group(0)!r} - use lucide / plain text")
            if ui:
                for m in DASH.finditer(line):
                    hits.append(f"{f}:{n}: em/en-dash {m.group(0)!r} - AI-pattern tell; use a period, comma, or hyphen")
    print(f"Scanned {len(files)} file(s).")
    if hits:
        print(f"\nFAIL: {len(hits)} emoji/pictograph(s) found:")
        for h in hits:
            print("  x " + h)
        return 1
    print("OK: no emoji in UI output or taste files.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
