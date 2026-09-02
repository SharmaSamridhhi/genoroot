# GR-021: Voice input UX overhaul

## Description

### Requirement

The mic-dictation flow (click to start, speak, click to stop, then tap a
"did you mean" chip to confirm) was slow and opaque — no feedback that the
mic was actually hearing anything, no way to trigger it without reaching
for the mouse, and a mandatory confirm-tap even when the transcript matched
an option exactly, which defeats the point of using voice at all.

### Design

- **Tooltip**: hovering (or keyboard-focusing) the mic button shows
  `Dictate (⌥M)` idle / `Stop dictating (⌥M)` while listening — platform-
  aware shortcut label (`⌥M` on Mac, `Alt+M` elsewhere), CSS-only
  `group-hover`/`group-focus-within` reveal (no JS show/hide state, so
  nothing here depends on an animation-completion callback the way earlier
  `AnimatePresence` issues did).
- **Icon swap**: `IconMic` → new `IconStop` (a filled square) while
  listening — same red-bordered button styling as before, just now with a
  glyph that actually communicates "recording."
- **Keyboard shortcut**: `Alt+M` (⌥M) toggles dictation for whichever
  question is on screen — matched on `event.code === "KeyM"` (not
  `event.key`, which produces `"µ"` for Option+M on a US Mac layout) so it's
  layout-independent, with `preventDefault()` so it can't leak a stray
  character into a focused text field. A `window`-level listener scoped to
  `MicButton`'s own mount lifetime, since only one `MicButton` is ever
  mounted at a time (one question on screen).
- **Live level visualizer**: `useVoiceInput` now also opens a second,
  independent `getUserMedia` stream (Web Speech API never exposes raw
  audio/amplitude, only transcripts) feeding a Web Audio `AnalyserNode`,
  producing a 0–1 `level` on every animation frame. `MicButton` renders
  three small bars with slightly different sensitivities off of it. Fully
  optional — wrapped in try/catch, degrades to a flat `level: 0` (no
  visualizer, dictation itself unaffected) if the stream can't be opened.
- **Skip the confirm tap on a confident match**: `VoiceChipSelect` and
  `VoiceTextInput` already received a `confidence: "high" | "low"` on every
  `interpretTranscript()` result (unused for this before) — a `"high"`
  result now commits directly (`onChange`), and the "did you mean"/"use
  this" confirm UI only appears for a genuinely uncertain (`"low"`) match.

### Tasks

1. `useVoiceInput`: add the `level` meter (getUserMedia + AnalyserNode
   alongside the existing SpeechRecognition instance).
2. `IconStop` in the icon manifest.
3. `MicButton`: tooltip, icon swap, `Alt+M` keyboard listener, level-bar
   visualizer.
4. `VoiceChipSelect` / `VoiceTextInput`: branch on `confidence` — commit
   directly on `"high"`, keep the confirm UI for `"low"`.
5. Tests for the new commit-on-high-confidence behavior (none existed at
   the component level before this).

## Status

Done

Live-verified as far as this session's sandboxed browser tooling allows:
mic permission itself is blocked in this Browser pane by policy (confirmed
by the tool's own notice, not a bug), so real dictation/transcription and
the visualizer's actual audio response can't be exercised end-to-end here.
What _was_ verified live: the tooltip renders and reads correctly on
hover, the `Alt+M` shortcut correctly reaches the real `getUserMedia` call
(proven by the pane's mic-blocked notice firing exactly when expected),
and the resulting "Mic access denied" error surfaces through the existing
non-blocking inline-error UI with no dead end. The confidence-based
auto-commit behavior is covered by new component tests (mocking
`useVoiceInput`/`interpretTranscript` directly, since no real transcript
is obtainable in this environment either). Recommend a manual pass on a
real device with mic access to confirm the visualizer and end-to-end
dictation feel.

## Acceptance Criteria

- [x] Hovering or keyboard-focusing the mic button shows a tooltip with the
      correct action word and the platform-appropriate shortcut.
- [x] The mic button's icon visibly differs between idle and listening.
- [x] `Alt+M` starts/stops dictation for the currently visible question
      without a mouse.
- [x] A live level meter is wired from mic input through to the button's
      visualizer, gracefully absent (not broken) when it can't be opened.
- [x] A high-confidence transcript match commits without a confirm tap; a
      low-confidence one still asks for one — covered by new tests.
- [x] `tsc`/`lint`/`npm test`/`npm run build` all clean.
