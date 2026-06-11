# Feedback & Status Components

Communicate system status, progress, and outcomes. Status changes must reach assistive tech via live regions (`accessibility/aria-patterns.md`). Render via the [Framework Adapter Protocol](../frameworks/adapter-protocol.md).

---

## 1. Toast / Notification

Transient, non-blocking message about a completed action or event.

**Anatomy:** `[icon] [title + message] [action?] [dismiss (x) ]`

**Variants:**
| Variant | Icon + Color | Token |
|---------|--------------|-------|
| Success | check / green | `semantic.feedback.success` |
| Error | alert / red | `semantic.feedback.error` |
| Warning | triangle / amber | `semantic.feedback.warning` |
| Info | i / blue | `semantic.feedback.info` |

**Behavior:** auto-dismiss success/info (~4–6s); errors persist until dismissed. Stack newest-first; cap visible count; pause on hover/focus.

**States (8):** enter (`transition.enter` slide-up+fade), default, hover (pause timer), focus (within), dismissing (`transition.exit`), action-pressed, loading (in-toast progress), error.

**Accessibility:**
- Container `role="region" aria-label="Notifications"`; messages in a live region — `aria-live="polite"` (info/success), `role="alert"`/`aria-live="assertive"` (errors).
- Dismiss is a real button with `aria-label`. Never auto-dismiss content the user must act on.
- Elevation `shadow.elevation.2xl`.

---

## 2. Banner / Inline Alert

Persistent, contextual message tied to a region or page (not transient).

**Anatomy:** `[icon] [message + optional link] [action?] [dismiss?]`

**Variants:** info/success/warning/error; page-level (full-width, square edges) vs. inline (within a card, radius). Dismissible or sticky.

**States:** default, hover/focus on interactive parts, dismissing, disabled action.

**Accessibility:**
- Informational: `role="status"`. Critical/error: `role="alert"`.
- Color + icon + text (never color alone). Dismiss = labeled button.

---

## 3. Skeleton (Loading Placeholder)

Structural placeholder that mirrors final content while loading.

**Anatomy:** shapes (lines, blocks, circles) matching the real layout's geometry.

**Variants:** text lines, avatar/circle, card, table row, media block.

**Behavior:** `pulse` or shimmer (`tokens/motion.json`), `linear`, infinite; matches final dimensions to avoid layout shift.

**States:** loading (animated) → resolved (swap to content) / error (replace with error state).

**Accessibility:**
- Wrap loading region with `aria-busy="true"`; mark skeletons `aria-hidden="true"`.
- Reduced motion: disable shimmer, show static placeholder.

---

## 4. Progress

Communicate determinate or indeterminate progress.

**Anatomy:** bar track + fill, or circular ring; optional label/percentage.

**Variants:** linear bar, circular, indeterminate (unknown duration), segmented/stepped.

**Sizes:** sm/md/lg thickness; icon-ring sizes from `tokens/sizing.json`.

**States:** in-progress (value 0–100), indeterminate (animated), success (complete), error (failed fill `feedback.error`).

**Accessibility:**
- `role="progressbar"` with `aria-valuenow/min/max` (omit `valuenow` when indeterminate).
- Label via `aria-label`/`aria-labelledby`; announce milestones politely, not every tick.

---

## 5. Empty State

Guide the user when there is no content yet.

**Anatomy:** `[illustration/icon] [headline] [supporting text] [primary action] [secondary?]`

**Variants:** first-use (guide to first action), no-results (search/filter — offer to clear), cleared (reassure), error/permission (explain + recover).

**Layout:** centered, generous whitespace, illustration sized via `sizing.aspectRatio` constraints; one clear primary action.

**Copy:** value → action (`content/voice-tone.md`). Never bare "No data".

**Accessibility:**
- Headline is a real heading in the page hierarchy.
- Illustration decorative (`aria-hidden`) unless it conveys meaning.
- Primary action is the natural next focus target.
