# Design-System Governance

How the system evolves without fragmenting: versioning, contribution, deprecation, and change communication. A design system without governance drifts back into the inconsistency it was meant to solve.

---

## Versioning (SemVer for design)

Treat the token + component API as a public contract and version with SemVer:

| Bump | Meaning | Examples |
|------|---------|----------|
| **Major** (x.0.0) | Breaking | Renamed/removed token or prop; changed component anatomy or default behavior; restructured token tiers |
| **Minor** (1.x.0) | Additive, backward-compatible | New token, new component, new variant/size, new optional prop |
| **Patch** (1.0.x) | Fixes | Contrast fix, bug fix, doc/typo, value tweak within tolerance |

- Tokens version **with** the system; a token value change that alters appearance materially is at least minor (often major if it breaks a brand).
- Keep a `CHANGELOG.md` per release (this repo: README changelog + git tags + GitHub Release).

## Contribution workflow

1. **Propose** — open an issue: problem, evidence (where it recurs), proposed pattern. Check it isn't an existing component/variant first.
2. **Validate** — does it serve a real, repeated need? One-off → keep it in the product, not the system.
3. **Design to the bar** — full spec: anatomy, variants, sizes, the 8 states, token mapping, a11y (CLAUDE.md Component Quality Bar).
4. **Review** — run `workflows/design-review.md` + `a11y-audit`; verify tokens with `scripts/validate_tokens.py` and contrast with `scripts/contrast.py`.
5. **Document & ship** — add the spec file, wire it into CLAUDE.md (File Reference Map + relevant table), bump version, changelog.

**Promotion path:** product one-off → candidate (documented, used in ≥2 places) → core (stable API, versioned). Don't promote prematurely.

## Deprecation

Never delete silently. Deprecate, then remove:

1. **Mark** — flag the token/component/prop as deprecated in its spec with the reason, the replacement, and the removal version.
2. **Warn** — console warning in code adapters; visible note in docs. Keep it working through the deprecation window (≥ 1 minor cycle).
3. **Migrate** — provide a mapping (old → new) and, where possible, a codemod or `design-systems/crosswalk.md`-style table.
4. **Remove** — only in a **major** release, after the window, with the removal listed in the changelog.

## Change communication

- Every release: what changed, why, who's affected, and the migration path. Lead with breaking changes.
- Maintain a single source of truth (this repo / CLAUDE.md Request Router) so consumers know where to look.
- Adoption metrics: track token/component usage to find drift (hard-coded values, forked components) and prioritize fixes.

## Verification
- Does the proposed change have a SemVer level and a changelog entry?
- For removals: is there a deprecation period, a replacement, and a migration table?
- Is the spec at the full quality bar and wired into CLAUDE.md?
