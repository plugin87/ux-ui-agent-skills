#!/usr/bin/env python3
"""WCAG 2.2 contrast-ratio checker.

Usage:
  python3 scripts/contrast.py "#1d1d1f" "#ffffff"
  python3 scripts/contrast.py 1d1d1f f5f5f7 --large

Prints the ratio and pass/fail for AA/AAA (normal & large text, UI components).
Exit code 0 if it passes AA normal text, else 1.
"""
import sys


def parse_hex(h):
    h = h.strip().lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    if len(h) != 6:
        raise ValueError(f"bad hex: {h!r}")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def _lin(c):
    c = c / 255
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4


def luminance(rgb):
    r, g, b = (_lin(c) for c in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def ratio(fg, bg):
    l1, l2 = luminance(parse_hex(fg)), luminance(parse_hex(bg))
    hi, lo = max(l1, l2), min(l1, l2)
    return (hi + 0.05) / (lo + 0.05)


def main(argv):
    args = [a for a in argv if not a.startswith("--")]
    if len(args) != 2:
        print(__doc__)
        return 2
    fg, bg = args
    try:
        r = ratio(fg, bg)
    except ValueError as e:
        print(f"ERROR: {e}")
        return 2

    def mark(ok):
        return "PASS" if ok else "FAIL"

    print(f"Contrast {fg} on {bg}: {r:.2f}:1\n")
    print(f"  Normal text  AA  (4.5:1): {mark(r >= 4.5)}")
    print(f"  Normal text  AAA (7.0:1): {mark(r >= 7.0)}")
    print(f"  Large text   AA  (3.0:1): {mark(r >= 3.0)}")
    print(f"  Large text   AAA (4.5:1): {mark(r >= 4.5)}")
    print(f"  UI / graphics    (3.0:1): {mark(r >= 3.0)}")
    return 0 if r >= 4.5 else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
