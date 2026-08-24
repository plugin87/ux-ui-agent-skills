#!/usr/bin/env python3
"""Validate DTCG token files.

Checks:
  1. Every token file parses as valid JSON.
  2. Every {alias.reference} resolves to a token defined in the same set.

Usage:
  python3 scripts/validate_tokens.py                    # the engine's tokens/ directory
  python3 scripts/validate_tokens.py design-tokens.json # any file or directory

With explicit paths the set is treated as self-contained, so an unresolved alias
FAILS. The default tokens/ run only warns, because a reference there may point at
a token that is about to be added.
Exit code 0 = all good, 1 = problems found.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TOKENS = ROOT / "tokens"
ALIAS = re.compile(r"\{([^}]+)\}")


def flatten(obj, prefix=""):
    """Yield dotted token paths that have a $value (DTCG leaf tokens)."""
    out = {}
    if isinstance(obj, dict):
        if "$value" in obj:
            out[prefix] = obj["$value"]
        for k, v in obj.items():
            if k.startswith("$"):
                continue
            child = f"{prefix}.{k}" if prefix else k
            out.update(flatten(v, child))
    return out


def collect_aliases(value):
    """Find all {ref} strings inside a value (which may be nested)."""
    found = []
    if isinstance(value, str):
        found += ALIAS.findall(value)
    elif isinstance(value, dict):
        for v in value.values():
            found += collect_aliases(v)
    elif isinstance(value, list):
        for v in value:
            found += collect_aliases(v)
    return found


def main(argv=()):
    explicit = [Path(a) for a in argv if not a.startswith("-")]
    if explicit:
        files = []
        for p in explicit:
            if p.is_dir():
                files += sorted(p.glob("*.json"))
            elif p.is_file():
                files.append(p)
            else:
                print(f"ERROR: {p} not found")
                return 1
    else:
        if not TOKENS.is_dir():
            print(f"ERROR: {TOKENS} not found")
            return 1
        files = sorted(TOKENS.glob("*.json"))
    if not files:
        print("ERROR: no token files found")
        return 1

    all_tokens = {}
    errors = []

    # Pass 1: parse + collect every defined token path (per file namespace + global)
    parsed = {}
    for f in files:
        try:
            data = json.loads(f.read_text())
        except json.JSONDecodeError as e:
            errors.append(f"{f.name}: invalid JSON — {e}")
            continue
        parsed[f] = data
        flat = flatten(data)
        for path, val in flat.items():
            all_tokens[path] = val           # e.g. "duration.fast"
            all_tokens[f"{f.stem}.{path}"] = val  # e.g. "motion.duration.fast"

    # Pass 2: resolve aliases
    unresolved = []
    for f, data in parsed.items():
        for path, val in flatten(data).items():
            for ref in collect_aliases(val):
                ref = ref.strip()
                # normalize cross-file refs like {../colors.semantic.border.default}
                norm = ref
                while norm.startswith("../") or norm.startswith("./"):
                    norm = norm[3:] if norm.startswith("../") else norm[2:]
                if ref in all_tokens or norm in all_tokens:
                    continue
                # tolerate cross-file refs that omit the file prefix
                tail = norm.split(".", 1)[-1]
                if tail in all_tokens:
                    continue
                if any(k.endswith(norm) for k in all_tokens):
                    continue
                unresolved.append(f"{f.name}: {path} → {{{ref}}} (unresolved)")

    print(f"Parsed {len(parsed)}/{len(files)} token files, {len(all_tokens)//2} tokens defined.")
    for e in errors:
        print("  x " + e)
    for u in unresolved:
        print("  ! " + u)

    if errors:
        print("\nFAIL: JSON errors above.")
        return 1
    if unresolved:
        if explicit:
            print(f"\nFAIL: {len(unresolved)} unresolved alias(es) in a self-contained token set.")
            return 1
        print(f"\nWARN: {len(unresolved)} unresolved alias(es) — may reference tokens to be added.")
        # warnings don't fail the build
    print("\nOK: all token files valid JSON.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
