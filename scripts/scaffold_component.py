#!/usr/bin/env python3
"""Scaffold a component spec stub in the house format (anatomy, variants,
sizes, 8 states, token mapping, accessibility).

Usage:
  python3 scripts/scaffold_component.py "Date Picker"
  python3 scripts/scaffold_component.py Tooltip --out components/_drafts/tooltip.md

Prints to stdout, or writes to --out.
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

TEMPLATE = """## {name}

> One-line purpose: <what it does and when to use it>.

**Anatomy:** `<slot> <slot> <slot>`

**Variants:**
| Variant | Use Case | Token Mapping |
|---------|----------|---------------|
| <variant> | <when> | `component.<name>.<...>` |

**Sizes:**
| Size | Height | Padding | Font | Icon |
|------|--------|---------|------|------|
| sm | `sizing.control.sm` | `space.3` | body-sm | `icon.sm` |
| md | `sizing.control.md` | `space.4` | body-base | `icon.md` |
| lg | `sizing.control.lg` | `space.5` | body-lg | `icon.lg` |

**States (8):**
1. **Default** — base tokens
2. **Hover** — `opacity.subtle` overlay / `-hover` token
3. **Focus** — `shadow.focus-ring`
4. **Active/Pressed** — `opacity.pressed` / `-active` token
5. **Disabled** — `state.disabled` (opacity 0.5, not-allowed, no pointer events)
6. **Loading** — spinner + `aria-busy="true"` (if async)
7. **Error** — `state.error.border` + message (if input)
8. **Selected** — `state.selected.bg` (if selectable)

**Accessibility:**
- ARIA pattern: see `accessibility/aria-patterns.md` (<pattern name>)
- Keyboard model: <keys>
- Screen reader: announces name, role, state
- Target size >= 24x24px (WCAG 2.5.8); color never the only indicator

**Framework:** render via `frameworks/adapter-protocol.md` for the target stack.
"""


def slug(name):
    return name.strip().lower().replace(" ", "-")


def main(argv):
    args = [a for a in argv if not a.startswith("--")]
    if not args:
        print(__doc__)
        return 2
    name = args[0]
    body = TEMPLATE.format(name=name)

    out = None
    if "--out" in argv:
        i = argv.index("--out")
        if i + 1 < len(argv):
            out = Path(argv[i + 1])
    if out:
        out = out if out.is_absolute() else ROOT / out
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(body)
        print(f"Wrote {out}")
    else:
        print(body)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
