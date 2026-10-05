# Rule: Taste

Loaded when designing or building any page, screen or component — which is most
of the work.

Gates prove a screen is correct. They cannot prove it is good, and a screen can
pass every one of them while still reading as machine-generated. That half is
decided here, before anything is styled.

---

## Decide before you generate

Slop comes from generating first. Write this block into your reply, then build to
it. If you cannot name the mood and the layout family, the result will regress to
the mean.

```
Domain:          fintech | editorial | dev-tool | healthcare | consumer | ...
Audience & tone: expert vs first-time, calm vs energetic, premium vs utilitarian
Mood:            the one adjective the result must earn - "expensive", "precise", "warm"
Motion depth:    none | subtle feedback | expressive choreography
Layout family:   the section sequence you will use, named, and varied per section
Reference anchor: the archetype or named system you are aiming at
```

---

## Banned defaults

Each of these is a defect to break, not a starting point.

| The default | Why it reads as generated | Instead |
|---|---|---|
| Three or four identical equal-weight cards | The eye lands nowhere | One thing leads: more size, more weight, or its own row |
| Everything centered | No tension, no hierarchy | Asymmetry on a real grid; center sparingly |
| The same left-text / right-image row repeated | Monotonous, obviously templated | Vary the composition per section |
| A heading that is just bold body text | Not a display scale | Largest heading at least 2.5x body, short, on an 18-24ch measure |
| A drop shadow on every box | Muddy, dated depth | Most things flat; elevation layered and rare |
| `#000` on `#fff` | Harsh and amateur | Off-black on warm-white, from the theme |
| A rainbow of accents | No discipline | One primary, one accent at most; neutrals carry it |
| Emoji as an icon, bullet, or status dot | The loudest tell there is | lucide inline SVG with `currentColor`, or plain words |
| A colored border on one side only | The tinted strip is a cliche | Full hairline border or surface separation, status by icon plus text |
| Cramped vertical rhythm | Dense and anxious | Generous macro-whitespace between sections |

## Copy tells

Banned in interface text: em-dashes, marketing filler ("elevate", "seamless",
"unlock", "supercharge"), hollow triads ("powerful, intuitive, and beautiful"),
fake structure labels ("SECTION 01", lorem ipsum, "Your headline here"), and
over-hedged microcopy. Say the concrete, verifiable thing or say nothing.

Read it aloud. If it sounds like a press release or a model warming up, rewrite
it shorter and more specific.

---

## Mobile is the base

Base styles ARE the phone layout. Wider screens are layered on with `min-width`.
`max-width` queries are fine for a genuine narrow refinement, or for a range
between two breakpoints - what is forbidden is a desktop-first stylesheet where
the base assumes a wide screen and mobile is patched in afterwards.

(The `max-width` *property* is unaffected: it is right for reading measure, a
container cap, and `max-width: 100%` on an image.)

## Before you call it done

Screenshot the screen and look at it. Click every control and confirm something
actually changed. Then ask for a critique — a reviewer that argues for rejection
catches what a gate cannot see, and a passing gate is never evidence of taste.
