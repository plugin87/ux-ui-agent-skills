#!/usr/bin/env python3
"""Validate the starter template in templates/product-design/.

The template is what /scaffold-project copies into a new product repo, so a
mistake here ships to every project started with the kit. This gate proves the
template is not just present but correct:

  1. LAYOUT   — every file of the reference layout exists (and nothing empty is
                left uncommittable).
  2. TOKENS   — design-tokens.json parses and every {alias} resolves. Unresolved
                aliases FAIL here (unlike the multi-file engine check, this file
                is self-contained, so an unresolved ref is always a bug).
  3. CONTRAST — the seeded theme passes WCAG 2.2 AA on the required pairs in
                BOTH light and dark, so a new project starts accessible.
  4. RULES    — CLAUDE.md points at rules that exist, and the rules point at
                gates that exist.

Usage:
  python3 scripts/validate_template.py
Exit 0 = template is sound, 1 = problems found.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TPL = ROOT / "templates" / "product-design"
ALIAS = re.compile(r"\{([^}]+)\}")

sys.path.insert(0, str(Path(__file__).resolve().parent))
from validate_contrast import ratio, resolve  # noqa: E402  (same DTCG shape)

# The reference layout, in the reference order. CLAUDE.local.md ships with a
# .template suffix so the kit's own gitignore cannot swallow it; the scaffold
# command drops the suffix on copy.
LAYOUT = [
    "CLAUDE.md",
    "CLAUDE.local.md.template",
    ".mcp.json",
    ".claude/rules",
    ".claude/skills",
    ".claude/commands",
    ".claude/settings.json",
    "design-tokens.json",
    "src/components",
    "public/images",
    "reference",
]

REQUIRED_PAIRS = [
    ("semantic.text.primary",   "semantic.surface.page",   4.5, "body text on page"),
    ("semantic.text.primary",   "semantic.surface.card",   4.5, "body text on card"),
    ("semantic.text.secondary", "semantic.surface.page",   4.5, "secondary text on page"),
    ("semantic.text.link",      "semantic.surface.page",   4.5, "link on page"),
    ("semantic.text.on-action", "semantic.action.primary", 4.5, "text on primary action"),
    ("semantic.text.on-action", "semantic.action.danger",  4.5, "text on destructive action"),
    ("semantic.border.strong",  "semantic.surface.page",   3.0, "essential control border"),
]


def flat_leaves(obj, prefix=""):
    out = {}
    if isinstance(obj, dict):
        if "$value" in obj:
            out[prefix] = obj["$value"]
        for k, v in obj.items():
            if not k.startswith("$"):
                out.update(flat_leaves(v, f"{prefix}.{k}" if prefix else k))
    return out


def check_layout():
    issues = []
    for rel in LAYOUT:
        p = TPL / rel
        if not p.exists():
            issues.append(f"layout: missing {rel}")
        elif p.is_dir() and not any(p.iterdir()):
            issues.append(f"layout: {rel}/ is empty and would not survive a commit (add .gitkeep)")
    return issues


def check_tokens(data):
    issues = []
    leaves = flat_leaves(data)
    # a token path is addressable bare and, for dark overrides, under dark.*
    known = set(leaves)
    for path, val in leaves.items():
        refs = ALIAS.findall(val) if isinstance(val, str) else []
        for ref in refs:
            ref = ref.strip()
            if ref not in known:
                issues.append(f"tokens: {path} -> {{{ref}}} does not resolve")
    for need in ("primitive", "semantic", "component", "dark"):
        if need not in data:
            issues.append(f"tokens: missing the '{need}' tier")
    return issues


def check_contrast(data):
    issues = []
    dark = data.get("dark") if isinstance(data.get("dark"), dict) else None
    if dark is None:
        return ["contrast: no dark section, so dark mode is unproven"]
    for mode, ov in (("light", None), ("dark", dark)):
        for fg_path, bg_path, minr, label in REQUIRED_PAIRS:
            fg, bg = resolve(data, fg_path, ov), resolve(data, bg_path, ov)
            if fg is None or bg is None:
                issues.append(f"contrast ({mode}): {label} - token missing ({fg_path}, {bg_path})")
                continue
            r = ratio(fg, bg)
            print(f"  {'PASS' if r >= minr else 'FAIL'} {mode:5} {label}: {r:.2f}:1 (need {minr})  [{fg} on {bg}]")
            if r < minr:
                issues.append(f"contrast ({mode}): {label} {r:.2f}:1 < {minr}")
    return issues


def check_rules():
    issues = []
    brief = (TPL / "CLAUDE.md").read_text(encoding="utf-8")
    for m in re.findall(r"`(\.claude/rules/[a-z-]+\.md)`", brief):
        if not (TPL / m).exists():
            issues.append(f"rules: CLAUDE.md points at {m}, which does not exist")
    for rule in sorted((TPL / ".claude" / "rules").glob("*.md")):
        for script in re.findall(r"scripts/([a-z_]+\.(?:mjs|py))", rule.read_text(encoding="utf-8")):
            if not (ROOT / "scripts" / script).exists():
                issues.append(f"rules: {rule.name} points at scripts/{script}, which does not exist")
    return issues


def main():
    if not TPL.is_dir():
        print(f"ERROR: {TPL} not found")
        return 1
    data = json.loads((TPL / "design-tokens.json").read_text(encoding="utf-8"))
    issues = check_layout() + check_tokens(data) + check_contrast(data) + check_rules()
    print(f"\nChecked layout ({len(LAYOUT)} entries), tokens, contrast (light + dark), rule links.")
    if issues:
        print(f"\nFAIL: {len(issues)} problem(s) in the starter template:")
        for i in issues:
            print("  x " + i)
        return 1
    print("OK: starter template layout, tokens, contrast, and rule links are sound.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
