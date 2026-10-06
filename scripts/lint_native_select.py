#!/usr/bin/env python3
"""Never ship a native `<select>`.

A rule the maintainer set. The native control draws its own chevron, and that
glyph sits pressed against the control's edge with no breathing room. Even with
`appearance: none` and a custom chevron the result fights the platform instead of
matching the rest of the system. Use the kit's Listbox or Combobox pattern: a
button trigger, the chevron placed with inner padding from tokens, and full
keyboard parity (typeahead, arrows, Home/End, Escape, `aria-expanded`). Losing
native select means accessibility stops being free, so the custom one has to pass
every state, keyboard and axe gate before it counts.

The maintainer's other rule - no colored border on one side only - is NOT here.
It was, briefly, and the source spelling cannot tell an accent strip from a tab
underline, a spinner ring, or a list divider: the first run flagged all three.
It lives in slop_tells.mjs instead, where it measures computed style and can
compare one side against the other three. See the "one-sided accent border" tell.

A deliberate exception is written the way this repo already writes one: put
`ds-allow-native-select` in a comment on the same line or the line above.

Usage:
  python3 scripts/lint_native_select.py <file|dir> [...]
Exit 0 = clean; 1 = a finding; 2 = unusable input.
"""
import re
import sys
from pathlib import Path

MARKUP_EXT = {".html", ".htm", ".tsx", ".jsx", ".vue", ".svelte", ".astro"}
SKIP_DIRS = {"node_modules", ".git", "dist", "__pycache__", ".ds-receipts"}

NATIVE_SELECT = re.compile(r"<select\b", re.I)
ALLOW_SELECT = "ds-allow-native-select"


def iter_files(paths):
    for raw in paths:
        p = Path(raw)
        if p.is_file():
            yield p
        elif p.is_dir():
            for f in sorted(p.rglob("*")):
                if f.is_file() and f.suffix in MARKUP_EXT and not (set(f.parts) & SKIP_DIRS):
                    yield f


def strip_comments(text):
    """Blank out comment bodies, keeping line numbers intact.

    Without this the gate flags the word `<select` inside the very comment that
    explains why native select is banned - which is how the first run of it
    reported two findings in its own documentation. The raw line is still what
    the exception marker is read from, because an exception is itself a comment.
    """
    def blank(m):
        return re.sub(r"[^\n]", " ", m.group(0))
    # <!-- ... -->, /* ... */ and // ... to end of line
    text = re.sub(r"<!--.*?-->", blank, text, flags=re.S)
    text = re.sub(r"/\*.*?\*/", blank, text, flags=re.S)
    text = re.sub(r"(?m)//[^\n]*", blank, text)
    return text


def allowed(lines, idx):
    """The exception may sit on the line itself or the line above it."""
    for n in (idx, idx - 1):
        if 0 <= n < len(lines) and ALLOW_SELECT in lines[n]:
            return True
    return False


def main(argv):
    paths = [a for a in argv if not a.startswith("-")]
    if not paths:
        print("ERROR: give at least one file or directory to scan.")
        return 2
    missing = [p for p in paths if not Path(p).exists()]
    if missing:
        print("ERROR: path(s) not found: " + ", ".join(missing))
        return 2

    files = list(iter_files(paths))
    if not files:
        print(f"ERROR: no scannable markup under {', '.join(paths)}")
        return 2

    found, unreadable = [], []
    for f in files:
        try:
            raw = f.read_text()
        except (OSError, UnicodeDecodeError) as err:
            unreadable.append((f, err))
            continue
        lines = raw.splitlines()
        code = strip_comments(raw).splitlines()
        for i, line in enumerate(code):
            # scan the comment-free line, but read the exception off the raw one
            if NATIVE_SELECT.search(line) and not allowed(lines, i):
                found.append((f, i + 1, lines[i].strip()[:90]))

    print(f"Scanned {len(files) - len(unreadable)} of {len(files)} file(s).")

    for f, err in unreadable:
        print(f"ERROR: could not read {f}: {err}", file=sys.stderr)
    if unreadable:
        print(f"FAIL: {len(unreadable)} file(s) could not be read, so this run cannot report clean.")
        return 1

    if found:
        print(f"\nFAIL: {len(found)} native <select> element(s). The native control draws its own")
        print("chevron hard against the edge and cannot be made to match the system.")
        for f, n, line in found:
            print(f"  x {f}:{n}: {line}")
        print("\nUse the Listbox or Combobox pattern in components/forms-advanced.md, or add a")
        print(f"`{ALLOW_SELECT}` comment if this one is deliberate.")
        return 1

    print("OK: no native <select> in generated UI.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
