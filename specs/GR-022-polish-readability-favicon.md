# GR-022: Readability, swipe-card polish, favicon

## Description

### Requirement

Three small, direct pieces of user feedback after the last live pass:

1. The secondary row-label text shown above product/procedure rows (e.g.
   "OTC/Medicated Shampoos") was too small and too low-contrast to read
   comfortably.
2. The yes/no swipe card had no ambient hint that it's draggable — first-time
   users might not realize swiping is an option at all.
3. The app was still shipping Next.js's unmodified default favicon.

### Design

- **Row-label readability**: bumped the row-label `<p>` in both places it
  appears — `TableCardFlow`'s in-flow question header and `SummaryView`'s
  review-screen row header — from small/muted (`text-sm`/`text-ink-soft`, or
  unsized/`font-medium`) to a clearly bolder, higher-contrast treatment
  (`text-lg font-semibold text-ink` in the flow; `text-base font-semibold
text-ink` in the denser review list) without approaching the size of the
  actual question headline above/below it, so it still reads as secondary
  context, not the question itself.
- **Swipe-card idle buzz**: a quiet left-right nudge on the draggable card,
  implemented as an imperative `animate()` loop on the same `x` MotionValue
  the drag gesture already controls (`framer-motion`'s `animate(motionValue,
keyframes, options)`, not a `style`/`animate` prop conflict — those can't
  target the same value at once). Keyframes `[0, -6, 6, -3, 0]`, ~1s per
  cycle, a 1.4s initial delay so it doesn't buzz the instant the row mounts,
  and a 3s pause between cycles so it reads as an occasional hint, not a
  constant jitter. Stopped the instant a real drag starts
  (`onDragStart`) and restarted once the card settles back to 0
  (`onDragEnd`), so it never fights the user's own gesture. Respects
  `prefersReducedMotion()` like every other animation in the app — skipped
  entirely rather than reduced.
- **Favicon**: reused the app's existing sprout mark (the same curve
  geometry as `OnboardingStep`'s decorative `Sprout` line-art) rather than
  inventing a new symbol, redrawn with a much bolder stroke (9 units in a
  100-unit viewBox vs. the line-art system's normal 1.4) so it survives
  downscaling to 16px, on a solid sage rounded-square backing for contrast
  against any browser chrome. Shipped as `src/app/icon.svg` (Next.js's file
  convention — auto-wired into `<head>` with no metadata changes needed),
  and `src/app/favicon.ico` was regenerated from the identical mark (via
  `sharp`, already present as a Next.js transitive dependency, hand-packing
  a minimal PNG-in-ICO container at 16/32/48px) so the two icon files never
  disagree.

### Tasks

1. `TableCardFlow.tsx`: bump the row-label `<p>` styling.
2. `SummaryView.tsx`: bump `TableRowSummary`'s row-header `<p>` styling to
   match.
3. `YesNoSwipeCard.tsx`: add the idle-buzz `animate()` loop, gated on
   `prefersReducedMotion()`, paused during an active drag.
4. `src/app/icon.svg` + regenerated `src/app/favicon.ico`.

## Status

Done

Live-verified in this session's Browser pane: navigated to the exact
product-row screen and read the rendered `OTC/Medicated Shampoos` label's
computed style directly — `18px`/`600`/`#241d18` (full ink contrast), up
from the old `14px`/`500`/muted `ink-soft`. Confirmed both `<link rel="icon">`
tags Next.js emits (`favicon.ico` and `icon.svg`) point at the new files, and
rendered the SVG mark downscaled to a real 16×16 PNG to confirm it still
reads as a two-leaf sprout at favicon size before shipping it.

The idle-buzz animation could **not** be pixel-verified live: this session's
Browser pane reports `document.hidden === true` regardless of which tab is
selected (a client-side panel-visibility state these tools can't force),
which throttles/pauses `requestAnimationFrame` — the same mechanism
Framer Motion's imperative `animate()` relies on — well past this tool's
45s script timeout. No console errors on mount, the drag gesture and
Yes/No buttons both still work with no regression, and the implementation
follows Framer Motion's documented pattern for animating a MotionValue
that's simultaneously drag-controlled. Recommend a quick real-tab visual
check (the animation should read as a subtle ~1s wiggle every few seconds
while a swipe card sits idle).

## Acceptance Criteria

- [x] Product/procedure row labels are visibly larger, bolder, and
      higher-contrast in both the intake flow and the review screen.
- [x] The swipe card nudges left-right on an idle loop, pauses during an
      active drag, and is skipped entirely under `prefers-reduced-motion`.
- [x] The browser tab shows an on-brand favicon (not the Next.js default),
      consistent between `icon.svg` and `favicon.ico`.
- [x] `tsc`/`lint`/`npm test`/`npm run build` all clean.
