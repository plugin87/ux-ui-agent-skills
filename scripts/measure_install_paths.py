#!/usr/bin/env python3
"""Measure H1: install-path parity.

Every skill, command and agent in the plugin surface names kit files - a doc to
read, a script to run. Whether those names resolve depends entirely on how the
kit was installed, and until this script existed nobody had counted:

  plugin      Claude Code copies .claude/{skills,commands,agents} into its own
              plugin directory. The user's cwd is their own project. A
              repo-root-relative name like `scripts/measure_render.mjs` resolves
              against the cwd, where the kit does not exist.
  init        `npx ux-ui-agent-skills init` copies the kit INTO the project, so
              repo-root-relative names resolve.
  skills-add  `npx skills add` copies the skill folders ONLY. accessibility/,
              taste/, scripts/, components/ and the rest never arrive.

Usage:
  python3 scripts/measure_install_paths.py            # table + the H1 score
  python3 scripts/measure_install_paths.py --json     # machine-readable
  python3 scripts/measure_install_paths.py --list-unresolved <route>
  python3 scripts/measure_install_paths.py --gate      # fail if a bare path is back
  python3 scripts/measure_install_paths.py --root DIR  # measure a copy

Reporting is the default and always exits 0. `--gate` is the half that can say
no: it fails when any reference in the surface is NOT built from a path variable,
which is the state the whole surface was in before 2026-10-05 and the state it
would silently return to the first time somebody writes `scripts/foo.mjs` in a
skill.

`skills-add` is deliberately NOT gated. On that route the kit is never copied, so
no spelling of a path can reach it; closing that gap is a different fix, and
gating it here would only tempt someone to weaken the measurement.
"""
import json
import re
import sys
from pathlib import Path

def _root():
    """`--root <dir>` points the gate at a copy, which is the only way to show it
    refusing a surface that has gone back to bare paths."""
    argv = sys.argv[1:]
    if "--root" in argv:
        i = argv.index("--root")
        if i + 1 < len(argv):
            return Path(argv[i + 1]).resolve()
    return Path(__file__).resolve().parent.parent


ROOT = _root()
SURFACE = [
    ROOT / ".claude" / "skills",
    ROOT / ".claude" / "commands",
    ROOT / ".claude" / "agents",
]

# What `npx skills add` brings: the skill folder and nothing else.
SKILLS_ADD_KEEPS = {".claude"}

# A reference to a kit file. Three shapes appear in the surface today:
#   `scripts/measure_render.mjs`        - inline code span
#   node scripts/measure_render.mjs     - a command in a fenced block
#   read `accessibility/wcag-checklist.md`
# Only the top-level directories the kit actually ships are counted, so prose
# like "components/atoms" in a sentence about the user's own repo is not.
KIT_DIRS = (
    "scripts", "tokens", "components", "taste", "design-systems", "frameworks",
    "accessibility", "workflows", "content", "examples", "evals", "templates",
    "docs", "tests",
)
# The same body in both patterns, so a reference counts identically whether or
# not it is prefixed: a denominator that moves when you fix something makes the
# before and after incomparable.
_BODY = r"((?:" + "|".join(KIT_DIRS) + r")/[A-Za-z0-9_./*-]*[A-Za-z0-9_*])"
REF = re.compile(r"(?<![\w./-])" + _BODY)
# Extensions the kit's own files use. A match that neither exists in the repo nor
# ends in one of these is prose, not a path: "SemVer for tokens/components" means
# tokens and components, and counting it as a broken reference would inflate the
# very number this script exists to report honestly.
FILE_EXT = (".md", ".mjs", ".js", ".py", ".json", ".html", ".css", ".tsx", ".jsx",
            ".vue", ".svelte", ".swift", ".txt", ".yml", ".yaml")


def is_path_reference(text: str) -> bool:
    if "*" in text:
        # `taste/*` means "the files in taste/" - a real reference to a real dir
        return (ROOT / text.split("*")[0].rstrip("/")).is_dir()
    return (ROOT / text).exists() or text.endswith(FILE_EXT)
# A reference already built from a path variable. It must still be COUNTED, or
# fixing a reference would make it disappear from the denominator instead of
# moving it into the resolved column - an instrument that flatters itself.
# $KIT is the convention for a subagent, which gets no CLAUDE_SKILL_DIR of its
# own: the invoking skill passes KIT=<absolute path> in its delegation message.
# It is a reference like any other and must stay in the denominator - the first
# version of this script lost four of them the moment they were fixed.
GUARDED = re.compile(
    r"(?:\$\{?CLAUDE_(?:SKILL_DIR|PLUGIN_ROOT|PROJECT_DIR)\}?|\$\{?KIT\}?)"
    r"(?:/\.\.)*/" + _BODY
)


def surface_files():
    for base in SURFACE:
        if not base.exists():
            continue
        if base.is_file():
            yield base
            continue
        for p in sorted(base.rglob("*.md")):
            yield p


def references():
    """[(file, line_no, path_text, had_variable)] for the whole plugin surface."""
    out = []
    for f in surface_files():
        try:
            text = f.read_text()
        except (OSError, UnicodeDecodeError) as err:
            print(f"ERROR: could not read {f}: {err}", file=sys.stderr)
            continue
        # Frontmatter is the listing text Claude Code shows the model when it
        # picks a skill, not an instruction to open anything. A path named there
        # is prose ("transform the DTCG tokens/*.json"), so it is not a
        # reference and must not be rewritten or counted as one.
        lines = text.splitlines()
        body_starts = 0
        if lines and lines[0].strip() == "---":
            for i, l in enumerate(lines[1:], 1):
                if l.strip() == "---":
                    body_starts = i + 1
                    break
        for n, line in enumerate(lines, 1):
            if n <= body_starts:
                continue
            seen_spans = []
            # guarded first, so the bare-path pattern does not re-match the tail
            # of a reference that is already prefixed
            for m in GUARDED.finditer(line):
                seen_spans.append(m.span(1))
                if is_path_reference(m.group(1)):
                    out.append((f.relative_to(ROOT), n, m.group(1), True))
            for m in REF.finditer(line):
                if any(a <= m.start(1) < b for a, b in seen_spans):
                    continue
                if not is_path_reference(m.group(1)):
                    continue
                out.append((f.relative_to(ROOT), n, m.group(1), False))
    return out


def resolves(path_text: str, guarded: bool, route: str) -> bool:
    """Would this reference open, on this install route?"""
    if guarded:
        # A variable fixes WHERE the kit root is. It cannot conjure a kit that was
        # never copied: `npx skills add` installs the skill folder alone, so
        # ../../../scripts points at a directory that does not exist on that
        # route no matter how the path is spelled. Treating a guarded reference
        # as resolved everywhere is how this script first reported H1 = 1.0.
        if route == "skills-add":
            return path_text.split("/", 1)[0] in SKILLS_ADD_KEEPS
        return True
    target = ROOT / path_text
    if not target.exists():
        # Broken in the repo itself - broken everywhere.
        return False
    if route == "init":
        # init copies the kit into the project, so a repo-relative path resolves
        # for every area the CLI installs.
        return installed_by_cli(path_text)
    if route == "plugin":
        # cwd is the user's project; the kit is in Claude Code's plugin dir and
        # a bare repo-relative path never points at it.
        return False
    if route == "skills-add":
        return path_text.split("/", 1)[0] in SKILLS_ADD_KEEPS
    raise ValueError(route)


_CLI_AREAS = None


def installed_by_cli(path_text: str) -> bool:
    """Does `init` actually copy the top-level area this path sits in?"""
    global _CLI_AREAS
    if _CLI_AREAS is None:
        cli = (ROOT / "bin" / "cli.js").read_text()
        block = cli[cli.index("const AREAS = {"):]
        block = block[:block.index("};")]
        # AREAS maps an area NAME to the path it installs; the paths are what
        # lands in the project, so those are what a reference can resolve against.
        _CLI_AREAS = {v.split("/")[-1] if v.startswith(".claude/") else v
                      for v in re.findall(r":\s*'([^']+)'", block)}
    top = path_text.split("/", 1)[0]
    return top in _CLI_AREAS


def main(argv):
    refs = references()
    routes = ["plugin", "init", "skills-add"]

    if "--gate" in argv:
        bare = [(f, n, p) for f, n, p, g in refs if not g]
        print(f"Plugin surface: {len(refs)} kit-file reference(s), "
              f"{len(refs) - len(bare)} built from a path variable.")
        if bare:
            print(f"\nFAIL: {len(bare)} reference(s) are bare repo-root paths. Under a "
                  f"plugin install they resolve against the user's project, where the "
                  f"kit is not:")
            for f, n, p in bare:
                print(f"  x {f}:{n}: {p}")
            print("\nWrite them as ${CLAUDE_SKILL_DIR}/../../../<path>, or for a "
                  "subagent as $KIT/<path> with the invoking skill passing KIT=.")
            return 1
        print("OK: every reference in the plugin surface carries a path variable.")
        return 0

    if "--list-unresolved" in argv:
        route = argv[argv.index("--list-unresolved") + 1]
        for f, n, p, g in refs:
            if not resolves(p, g, route):
                print(f"{f}:{n}: {p}")
        return 0

    table = {}
    for route in routes:
        ok = sum(1 for _, _, p, g in refs if resolves(p, g, route))
        table[route] = {"resolved": ok, "total": len(refs),
                        "share": round(ok / len(refs), 4) if refs else 0.0}

    guarded = sum(1 for *_, g in refs if g)
    h1 = round(sum(t["share"] for t in table.values()) / len(routes), 4)

    if "--json" in argv:
        print(json.dumps({"references": len(refs), "variable_guarded": guarded,
                          "routes": table, "H1": h1}, indent=2))
        return 0

    print(f"Plugin surface: {len(list(surface_files()))} file(s), "
          f"{len(refs)} kit-file reference(s), {guarded} already variable-guarded.")
    print()
    print(f"  {'route':<12} {'resolves':>10}  {'share':>7}")
    print(f"  {'-' * 12} {'-' * 10}  {'-' * 7}")
    for route in routes:
        t = table[route]
        print(f"  {route:<12} {t['resolved']:>4} / {t['total']:<3}  {t['share'] * 100:>6.1f}%")
    print()
    print(f"  H1 (mean across the three routes) = {h1}")
    print()
    print("  A reference counts as resolving only if the file would actually open")
    print("  on that route. This exits 0 always: it is an instrument, not a gate.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
