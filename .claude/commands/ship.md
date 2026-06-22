---
description: Pre-release gate — run the full gate, responsive + render checks, then produce the release checklist (README badge/current/changelog). Use before tagging a release.
---

Gate first, then prepare the release. Do nothing destructive without explicit
confirmation (no tag, no publish) — this command verifies and drafts only.

1. Quality gate (must be fully green before continuing):
   - `node scripts/accuracy_report.mjs` — report the real N/N.
   - `node scripts/verify_responsive.mjs examples` — no overflow at 280/320/414.
   - `python3 scripts/check_no_emoji.py` — UI + taste + instruction surface.
   If anything fails, stop and fix; do not proceed to the checklist.

2. Release checklist (per the project release rule):
   - Update `README.md`: version badge, "current" line, and changelog entry.
   - Confirm the bump level (major/minor/patch) with the user — it is their call.
   - Confirm `examples/apple-home` stays gitignored (local IP).
   - List the commits since the last tag so the changelog is accurate.

3. Output a ready-to-review summary: the green N/N line, the proposed version,
   and the drafted changelog entry. Wait for the user to approve before any
   `git tag` / publish step.
