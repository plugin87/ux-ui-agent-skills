# Motion Choreography

Tokens in `tokens/motion.json` define the *vocabulary* (durations, easings, presets). This file is the *grammar* — how to compose motion that feels intentional and premium instead of busy or janky.

> Motion serves the **Aesthetics** tier and must honor `prefers-reduced-motion` (WCAG 2.3.3). Every effect below has a reduced-motion fallback. Never block content or delay interaction on animation.

---

## Principles

1. **Purpose only.** Motion exists to (a) guide attention, (b) show spatial/causal connection, or (c) confirm an action. If it does none of these, cut it.
2. **Fast and out of the way.** UI feedback lands in `duration.fast`–`duration.base`. Nothing routine exceeds `duration.moderate`. Only full-screen/hero transitions may reach `duration.slow`.
3. **Easing carries meaning.** `ease-out` for entrances (arrive fast, settle), `ease-in` for exits (accelerate away), `ease-in-out` for in-place state changes, `spring` for rare celebratory emphasis.
4. **Transform + opacity only.** Animate `transform` and `opacity` — they are GPU-composited and hit 60fps. Avoid animating `width`, `height`, `top`, `left`, `box-shadow`, `filter` in hot paths.
5. **Restraint reads as premium.** One signature motion per view. Stacking parallax + glow + spring + scrub looks cheap. Pick one focal motion and keep the rest quiet.

---

## Patterns

### Entrance reveals (on scroll / mount)
- Translate ≤ 8–16px + fade. Never animate from far offscreen.
- `duration.moderate`, `ease-out`. Use `tokens/motion.json` → `transition.enter`.
- **Reduced motion:** opacity-only fade, ≤ `duration.fast`, no translate.

### Stagger
- Reveal grouped items with a small delay step (40–80ms) to imply order.
- Cap total stagger so the last item isn't perceptibly late (< ~400ms overall).
- **Reduced motion:** reveal the whole group at once.

### Hover physics (pointer devices)
- Subtle lift: `translateY(-2px)` + elevation step up, `duration.fast`, `ease-out`.
- Optional colored shadow on primary CTAs only (`tokens/shadows.json` → `colored`).
- **Touch:** no hover dependency — the resting state must be complete on its own.

### Press / active feedback
- Scale down slightly (`scale(0.97)`) on press, snap back on release, `duration.fast`.
- Gives tactile confirmation without layout shift.

### Section transitions / scroll scrub
- Use sparingly for storytelling. Pin + scrub must remain interruptible and never trap scroll.
- Keep scrubbed movement to transform/opacity; avoid heavy per-frame layout.
- **Reduced motion:** disable pin/scrub; show sections statically.

### Overlay enter/exit (modal, drawer, popover, toast)
- Enter: `scale-in` (0.96→1) + fade, `transition.enter`. Exit: faster fade, `transition.exit`.
- Backdrop fades with the surface. Focus moves on enter; focus restores on exit (see `accessibility/aria-patterns.md`).
- **Reduced motion:** fade only, no scale.

### Loading
- Skeleton `pulse` (opacity 1↔0.5) or shimmer, `linear`, infinite. Spinner `spin`, 600–1000ms, `linear`.
- Prefer skeletons that match final layout over spinners for perceived speed.

---

## Anti-Patterns (the cheap tells)

- **Avoid:** everything animates on load — nothing feels important.
- **Avoid:** long durations (> 500ms) on routine UI — feels sluggish.
- **Avoid:** bounce/spring on every element — toy-like.
- **Avoid:** animating `box-shadow`/`filter`/`width` — jank.
- **Avoid:** motion with no reduced-motion fallback — accessibility failure.
- **Avoid:** scroll-jacking that fights the user's scroll — abandon.

---

## Implementation notes by target

- **CSS:** `@media (prefers-reduced-motion: reduce)` to strip transforms; `transition` shorthands from motion tokens.
- **React/Framer-Motion etc.:** read the reduced-motion media query; gate variants on it.
- **SwiftUI:** `@Environment(\.accessibilityReduceMotion)`; replace `.animation` with instant or `.opacity`.
- **Native (RN/Flutter/Compose):** query platform reduce-motion setting; default to fade.

Cross-reference the per-framework motion specifics in each adapter under `frameworks/`.
