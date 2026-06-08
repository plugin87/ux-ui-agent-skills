#!/usr/bin/env python3
"""Fail if any emoji / decorative pictograph appears in UI output or the taste doctrine.

The kit forbids emoji in product UI (taste/design-taste.md) — this enforces it so it
can't drift back. Scans example UI + the taste files by default.

Usage:
  python3 scripts/check_no_emoji.py                      # examples/ + taste/
  python3 scripts/check_no_emoji.py path/to/src ...
Exit 0 = clean, 1 = an emoji/pictograph was found.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEFAULT = [ROOT / "examples", ROOT / "taste"]
EXTS = {".md", ".mdx", ".html", ".htm", ".tsx", ".jsx", ".ts", ".js",
        ".vue", ".svelte", ".css", ".scss", ".astro", ".json"}

# Emoji + dingbat pictographs (check marks, stars, etc.). Deliberately EXCLUDES
# arrows (U+2190–21FF) and box-drawing, which are legitimate typographic notation.
EMOJI = re.compile(
    "[\U0001F000-\U0001FAFF"   # symbols & pictographs, emoticons, transport, supplemental
    "\U00002600-\U000026FF"    # misc symbols
    "\U00002700-\U000027BF"    # dingbats (✅ ✔ ✗ ✨ ✂ …)
    "\U00002B00-\U00002BFF"    # misc symbols & arrows pictographs (⭐ …)
    "\U0001FA70-\U0001FAFF"
    "✅✔✖✨❌❓❔❕️⃣]"
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


def main(argv):
    paths = [Path(a) for a in argv] or DEFAULT
    hits = []
    files = list(iter_files(paths))
    for f in files:
        try:
            text = f.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        for n, line in enumerate(text.splitlines(), 1):
            for m in EMOJI.finditer(line):
                hits.append(f"{f}:{n}: emoji/pictograph {m.group(0)!r} — use lucide / plain text")
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
