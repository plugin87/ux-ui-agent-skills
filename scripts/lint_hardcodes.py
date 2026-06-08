#!/usr/bin/env python3
"""Lint generated component code for hardcoded values that should be design tokens.

The kit's rule is "zero hardcoded values" — every color/size/radius/duration must come
from a token (CSS var, theme key, asset). Point this at YOUR component source.

Usage:
  python3 scripts/lint_hardcodes.py src/components            # a dir
  python3 scripts/lint_hardcodes.py Button.tsx Card.vue       # files
  python3 scripts/lint_hardcodes.py --ext .tsx,.vue src/

Flags a line with a raw hex color, px length, or ms/s duration UNLESS it:
  - is inside a CSS var / token reference (var(--…), {token…}, theme(…)),
  - is a token-definition file (tokens/*.json),
  - carries an inline allow comment containing 'ds-allow-hardcode'.
Exit 0 = clean, 1 = violations found.
"""
import re
import sys
from pathlib import Path

CODE_EXT = {".css", ".scss", ".tsx", ".jsx", ".ts", ".js", ".vue", ".svelte",
            ".swift", ".kt", ".dart", ".html"}

HEX = re.compile(r"(?<![\w&])#[0-9a-fA-F]{3,8}\b")
PX = re.compile(r"(?<![\w.])\d+(?:\.\d+)?px\b")
MS = re.compile(r"(?<![\w.])\d+(?:\.\d+)?m?s\b")
# raw Tailwind palette utilities (bg-gray-500, text-blue-600, border-red-400 …) that
# bypass semantic tokens — the #1 real-world drift (527 of these in one audited project).
_TW_PREFIX = r"(?:bg|text|border|ring|ring-offset|fill|stroke|from|via|to|divide|outline|decoration|accent|caret|placeholder|shadow)"
_TW_COLOR = r"(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)"
TW = re.compile(rf"(?<![\w-]){_TW_PREFIX}-{_TW_COLOR}-(?:50|100|200|300|400|500|600|700|800|900|950)\b")
# hardcoded font-family not coming from a token/var
FONT = re.compile(r"font-family\s*:\s*(?!.*var\()")
# contexts that mean "this is a token, not a hardcode"
TOKEN_CTX = re.compile(r"var\(--|theme\(|tokens?[./]|\{[\w.\-]+\}|--[\w\-]+\s*:")
ALLOW = "ds-allow-hardcode"
# px values that are conventionally fine (hairlines, zero, 1px borders) — still reported as info? keep strict but allow 0/1px
PX_OK = {"0px", "1px"}


def iter_files(paths, exts):
    for p in paths:
        pp = Path(p)
        if pp.is_dir():
            for f in pp.rglob("*"):
                if f.suffix in exts and "node_modules" not in f.parts:
                    yield f
        elif pp.is_file() and pp.suffix in exts:
            yield pp


def lint_line(line, tailwind=True):
    if ALLOW in line or TOKEN_CTX.search(line):
        return []
    stripped = line.strip()
    if stripped.startswith(("//", "*", "/*", "#", "<!--")):
        return []
    hits = []
    # @media / @container conditions can't use var() (a CSS limitation) — breakpoint px there
    # is not drift; skip px/ms on those lines (still check hex/tailwind/font).
    media_cond = "@media" in line or "@container" in line
    for m in HEX.finditer(line):
        hits.append(("hex", m.group(0)))
    if not media_cond:
        for m in PX.finditer(line):
            if m.group(0) not in PX_OK:
                hits.append(("px", m.group(0)))
        for m in MS.finditer(line):
            hits.append(("time", m.group(0)))
    if tailwind:
        for m in TW.finditer(line):
            hits.append(("tailwind-palette", m.group(0)))
    if FONT.search(line):
        hits.append(("font-family", "literal font-family"))
    return hits


def main(argv):
    exts = CODE_EXT
    tailwind = True
    args = []
    i = 0
    while i < len(argv):
        if argv[i] == "--ext" and i + 1 < len(argv):
            exts = {e if e.startswith(".") else "." + e for e in argv[i + 1].split(",")}
            i += 2
        elif argv[i] in ("--no-tw", "--no-tailwind"):
            tailwind = False
            i += 1
        else:
            args.append(argv[i])
            i += 1
    if not args:
        print(__doc__)
        return 0

    files = list(iter_files(args, exts))
    violations = 0
    for f in files:
        try:
            text = f.read_text()
        except (UnicodeDecodeError, OSError):
            continue
        in_allow = False
        for n, line in enumerate(text.splitlines(), 1):
            if "ds-allow-hardcode:start" in line:
                in_allow = True
                continue
            if "ds-allow-hardcode:end" in line:
                in_allow = False
                continue
            if in_allow:
                continue
            for kind, val in lint_line(line, tailwind):
                print(f"{f}:{n}: hardcoded {kind} '{val}' — use a token")
                violations += 1

    print(f"\nScanned {len(files)} file(s).")
    if violations:
        print(f"FAIL: {violations} hardcoded value(s). Map each to a token, "
              f"or add a '{ALLOW}' comment for a justified exception.")
        return 1
    print("OK: no hardcoded values found.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
