#!/usr/bin/env python3
"""Unit checks for the pure functions the contrast gates are built on.

Plain asserts, no pytest: the repo has one devDependency and this keeps it that
way. Run directly, or through tests/unit/contrast.test.mjs.

Every expected value here is either an identity (white on black is 21:1 by
definition), a symmetry, or the published WCAG boundary grey #767676, which is
the standard worked example for "just passes AA on white".
"""
import importlib.util
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def load(name):
    spec = importlib.util.spec_from_file_location(name, ROOT / "scripts" / f"{name}.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


c = load("contrast")
failures = []


def check(label, got, want, tol=0.005):
    if isinstance(want, float) and abs(got - want) > tol:
        failures.append(f"{label}: got {got!r}, want {want!r}")
    elif not isinstance(want, float) and got != want:
        failures.append(f"{label}: got {got!r}, want {want!r}")


# --- parse_hex
check("parse_hex 6-digit", c.parse_hex("#2563EB"), (0x25, 0x63, 0xEB))
check("parse_hex 3-digit expands", c.parse_hex("#fff"), (255, 255, 255))
check("parse_hex tolerates no hash", c.parse_hex("1d1d1f"), (0x1D, 0x1D, 0x1F))
try:
    c.parse_hex("zz")
    failures.append("parse_hex should reject a bad hex")
except ValueError:
    pass

# --- luminance: the two anchors of the sRGB formula
check("luminance white", c.luminance((255, 255, 255)), 1.0)
check("luminance black", c.luminance((0, 0, 0)), 0.0)

# --- ratio
check("white on black is the maximum 21:1", round(c.ratio("#ffffff", "#000000"), 2), 21.0)
check("a colour against itself is 1:1", round(c.ratio("#1d4ed8", "#1d4ed8"), 2), 1.0)
check("ratio is symmetric", round(c.ratio("#1d1d1f", "#ffffff"), 4),
      round(c.ratio("#ffffff", "#1d1d1f"), 4))
# #767676 is the published grey that lands just above AA on white.
check("WCAG boundary grey on white", round(c.ratio("#767676", "#ffffff"), 2), 4.54)
check("one step darker still passes AA", c.ratio("#767676", "#ffffff") >= 4.5, True)
check("one step lighter fails AA", c.ratio("#777777", "#ffffff") >= 4.5, False)

if failures:
    print(f"FAIL: {len(failures)} unit check(s):")
    for f in failures:
        print("  x " + f)
    sys.exit(1)
print("OK: contrast unit checks pass.")
