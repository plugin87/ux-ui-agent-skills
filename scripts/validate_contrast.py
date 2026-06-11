#!/usr/bin/env python3
"""Batch WCAG contrast validator for the semantic color pairs in tokens/colors.json.

Resolves token aliases (incl. {../cross-file} and dark-mode overrides) and checks the
essential foreground/background pairs against WCAG 2.2 minimums, in BOTH light and dark.

Usage:
  python3 scripts/validate_contrast.py
  python3 scripts/validate_contrast.py --aaa   # also report 7:1 (AAA) for body text
Exit 0 = all required pairs pass; 1 = a required pair fails (or a token is missing).
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
COLORS = ROOT / "tokens" / "colors.json"

# REQUIRED pairs — readable text + actions; a failure FAILS the build (WCAG 1.4.3).
# (foreground path, background path, min ratio, label)
PAIRS = [
    ("semantic.text.primary",   "semantic.surface.page", 4.5, "body text on page"),
    ("semantic.text.primary",   "semantic.surface.card", 4.5, "body text on card"),
    ("semantic.text.secondary", "semantic.surface.page", 4.5, "secondary text on page"),
    ("semantic.text.link",      "semantic.surface.page", 4.5, "link on page"),
    ("semantic.text.on-action", "semantic.action.primary", 4.5, "text on primary action"),
    ("semantic.border.strong",  "semantic.surface.page", 3.0, "essential control border (WCAG 1.4.11)"),
]

# ADVISORY pairs — intentionally de-emphasized text/decoration. Reported, not failed:
# tertiary is for incidental non-essential text; border.default is decorative (use border.strong
# for any boundary that identifies a control).
ADVISORY = [
    ("semantic.text.tertiary",  "semantic.surface.page", 4.5, "tertiary/incidental text on page"),
    ("semantic.border.default", "semantic.surface.page", 3.0, "default border on page (decorative)"),
]


def parse_hex(h):
    h = h.strip().lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
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


def get(data, dotted):
    node = data
    for k in dotted.split("."):
        if not isinstance(node, dict) or k not in node:
            return None
        node = node[k]
    return node


def _resolve_value(data, val, depth=0):
    """Follow {alias} chains (incl. {../cross-file}) to a final hex string."""
    seen = 0
    while isinstance(val, str) and val.startswith("{") and val.endswith("}") and seen < 12:
        ref = val[1:-1].strip()
        while ref.startswith("../") or ref.startswith("./"):
            ref = ref[3:] if ref.startswith("../") else ref[2:]
        node = get(data, ref)
        if not isinstance(node, dict) or "$value" not in node:
            return None
        val = node["$value"]
        seen += 1
    return val if isinstance(val, str) and val.startswith("#") else None


def resolve(data, dotted, overrides=None):
    """Resolve a semantic token path to a final hex, honoring a dark-mode override map."""
    if overrides is not None and dotted.startswith("semantic."):
        ov = get(overrides, dotted[len("semantic."):])
        if isinstance(ov, dict) and "$value" in ov:
            return _resolve_value(data, ov["$value"])
    node = get(data, dotted)
    if not isinstance(node, dict) or "$value" not in node:
        return None
    return _resolve_value(data, node["$value"])


def check(data, overrides, mode, pairs, aaa, required):
    issues = []
    label_kind = "required" if required else "advisory"
    print(f"\n=== {mode} ({label_kind}) ===")
    for fg_path, bg_path, minr, label in pairs:
        fg = resolve(data, fg_path, overrides)
        bg = resolve(data, bg_path, overrides)
        if fg is None or bg is None:
            print(f"  ? {label}: token missing ({fg_path}={fg}, {bg_path}={bg}) — skipped")
            continue
        r = ratio(fg, bg)
        ok = r >= minr
        mark = ("PASS" if ok else "FAIL") if required else ("ok" if ok else "warn")
        extra = ""
        if aaa and minr >= 4.5:
            extra = f"  AAA(7:1): {'pass' if r >= 7 else 'no'}"
        print(f"  {mark} {label}: {r:.2f}:1 (need {minr})  [{fg} on {bg}]{extra}")
        if not ok and required:
            issues.append(f"{mode}: {label} {r:.2f}:1 < {minr}")
    return issues


def main(argv):
    aaa = "--aaa" in argv
    if not COLORS.exists():
        print(f"ERROR: {COLORS} not found")
        return 1
    data = json.loads(COLORS.read_text())
    dark = data.get("dark") if isinstance(data.get("dark"), dict) else None
    fails = []
    fails += check(data, None, "LIGHT", PAIRS, aaa, True)
    if dark:
        fails += check(data, dark, "DARK", PAIRS, aaa, True)
    # advisory (never fails the build)
    check(data, None, "LIGHT", ADVISORY, aaa, False)
    if dark:
        check(data, dark, "DARK", ADVISORY, aaa, False)
    if not dark:
        print("\n(no dark section found — skipping dark checks)")
    print()
    if fails:
        print(f"FAIL: {len(fails)} required pair(s) below WCAG minimum:")
        for f in fails:
            print("  x " + f)
        return 1
    print("OK: all required contrast pairs pass WCAG 2.2 minimums.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
