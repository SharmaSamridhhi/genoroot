# Icon & motion style guide

Every icon in this app is hand-authored inline SVG via `AnimatedIcon` — no external
icon font or library. Consistency comes from all of them sharing the same shell:

- `viewBox="0 0 24 24"`, `stroke-width={2}`, `stroke-linecap/linejoin="round"`
- `stroke="currentColor"`, no fill (line-icon style) unless a shape genuinely needs one
- Entrance animation (scale+fade in) driven by `lib/motion/tokens.ts`'s shared
  duration/easing — never a bespoke timing per icon

## Adding a new icon

Add a component to `manifest.tsx` following the existing shape: wrap the `<path>`s
in `<AnimatedIcon>`, accept `{ size, className, animate }`. Keep the geometry simple —
these read at ~20-32px on a phone, not as detailed illustrations.

## Motion conventions (enforced by reuse, not a linter)

- Question icon draws/scales in when its question enters (`AnimatedIcon`'s default).
- Chip tap → brief scale-bounce (see `ChipSelect`).
- Section complete → `SuccessBurst`, a small SVG particle fan-out — not a Lottie/confetti
  dependency.
- Everything routes through `prefersReducedMotion()` / `motionTransition()` in
  `lib/motion/tokens.ts`, so reduced-motion is handled once, not per-component.
