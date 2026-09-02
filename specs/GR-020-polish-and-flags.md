# GR-020: Late polish — question clarity, feature flags, README cleanup

## Description

### Requirement

Deadline-driven polish pass, user-directed: (1) extend the subtle per-row
line-art (GR-019.1) to every question, not just the habits table, sized up
slightly with a subtle idle float; (2) the scalp diagram reads as "mountain
ranges," not a scalp — gate it behind a feature flag, default off, falling
back to the plain chip picker every other multi-select question already
uses; (3) `TableCardFlow`'s row header duplicated the question text in tiny
type above the real (also too-small) question, which read as confusing;
(4) voice input behind a feature flag as a safety switch, default on; (5)
`README.md` trimmed to what a developer actually needs — drop the
judge-facing hackathon framing (cost tables, per-question rationale, "one
more week").

### Design

- **`src/lib/featureFlags.ts`**: two named booleans,
  `ENABLE_SCALP_DIAGRAM` (default `false`) and `ENABLE_VOICE` (default
  `true`) — plain constants, no env var indirection, since the user edits
  this file directly to flip them.
- **Scalp diagram gate**: `useQuestionRender.tsx`'s `pattern` case checks
  the flag — renders `ScalpPatternPicker` when on, otherwise the same
  `VoiceChipSelect` multi-select every other question uses (all 6 pattern
  options as chips). `ScalpPatternPicker.tsx` itself is untouched, just
  unreachable by default.
- **Voice gate**: `VoiceChipSelect`/`VoiceTextInput` check the flag and,
  when off, render the plain `ChipSelect`/`TextInput` with no mic button
  and no suggestion UI — same external props/behavior otherwise, so nothing
  upstream needs to change.
- **`TableCardFlow` header**: drop the row label from the breadcrumb when
  it's identical to the current field's own label (the habits case — reuses
  the exact `showHeader` pattern `SummaryView.tsx` already has for this);
  breadcrumb becomes a small mono "eyebrow" (`ROW 1 OF 6`) instead of
  competing with the real question; the field question itself moves from
  `text-lg` to a properly prominent size matching the weight of every other
  question headline in the app.
- **Per-question line-art**: `RootLineArt` becomes `QuestionArt`, keyed by
  `questionKey` instead of always drawing the same root lines — one small
  icon per top-level question (hourglass, clock, family, stethoscope,
  calendar, droplet, wave, bandage, vial, shield, etc.), same thin-stroke
  copper/moss register as `HabitRowArt`. Both `QuestionArt` and
  `HabitRowArt` get a slightly larger footprint and a slow, small
  `y: [0,-5,0]` loop (gated on `prefersReducedMotion()`, same as every
  other animation in the app).
- **README**: keep name/pitch, live link, stack, requirements, local dev,
  tests, a one-line pointer at `/specs`. Drop the hackathon-judge framing —
  cost-comparison table, 16-row per-question rationale table, "with one
  more week."

## Status

Done

## Acceptance Criteria

- [x] `pattern` question renders the plain chip picker by default; setting
      `ENABLE_SCALP_DIAGRAM = true` restores the diagram with no other
      change needed.
- [x] Setting `ENABLE_VOICE = false` removes every mic button/suggestion UI
      app-wide with no other change needed; default (`true`) is
      behaviorally identical to before this spec.
- [x] The habits table's row header no longer shows the same text twice;
      the actual question is the single largest, clearest text on screen
      for every row of every table question.
- [x] Every top-level question shows a themed, subtly-animated line-art
      icon on the desktop left panel (or the habits-table's existing
      per-row icon), not just the six habit rows.
- [x] `README.md` contains no hackathon/judging language.
- [x] `tsc`/`lint`/`npm test`/`npm run build` all clean.
