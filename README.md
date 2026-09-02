# GenoRoot — Hair & Scalp Intake

**Live demo: https://airform-nu.vercel.app** _(mock/placeholder data only — never enter real personal information)_

A hackathon submission: a self-filling replacement for a clinic's static 16-question hair-loss intake form. The bet is that a rigid five-section paper form and a "smart chatbot" are both wrong shapes for this problem — instead, each question gets the input its *type* deserves (a diagram for a spatial question, a swipe for a yes/no, a chip for a multiple-choice, voice for anything free-text), a small deterministic rules engine handles the auto-skips and exclusive-option logic a form-brain would otherwise have to remember, and a narrow LLM assist only ever *suggests* — the patient always taps to confirm before anything is written. See [`/specs`](./specs/README.md) for the full spec-driven build log (18 specs, one epic-branch PR per group).

**By design, this app has no login, no admin panel, and no database.** It's a stateless, single-patient-at-a-time client app; the only server-side code is a narrow API route that proxies a Groq LLM call for free-text interpretation (see [GR-012](./specs/GR-012-llm-parse-route-groq.md)), which is also the only place the Groq API key is ever read.

## Stack

Next.js 15 (App Router, TypeScript) · Tailwind CSS · Framer Motion · Zustand (with `persist`) · Vitest + React Testing Library · Web Speech API (voice capture) · Groq / Llama 3.1 8B (LLM assist)

## Resourcefulness

Every paid/hosted piece was chosen to be the cheapest thing that could plausibly ship correctness, not the most impressive:

| Piece | Choice | Why |
|---|---|---|
| Voice capture | Web Speech API (browser-native) | Zero cost, zero API key, runs entirely client-side. No STT vendor needed for this. |
| Voice/free-text interpretation | Groq, `llama-3.1-8b-instant`, free tier | See comparison below. |
| Matching a spoken answer to a chip option | A local, deterministic word-overlap matcher (`lib/voice/matchTranscript.ts`) runs **first**, with zero network calls; Groq is only invoked as a fallback when the local match is inconclusive or the field is genuinely free text. Most spoken answers never reach the network at all. | Correctness-for-free where possible; the LLM is reserved for where it's actually needed. |
| Persistence | `localStorage` via Zustand's `persist` | No login, no multi-device sync requirement — a database would be solving a problem this app doesn't have. |
| Hosting | Vercel | Git-connected deploys, generous free tier, zero ops for a stateless Next.js app. |

**Why Groq over the alternatives considered:**

| Option | Verdict |
|---|---|
| Anthropic Claude | Ruled out early — general-purpose frontier model is significant overkill (and cost) for "clean up a transcript" / "pick from these 6 options," a task that doesn't need frontier reasoning. |
| OpenAI GPT-4o-mini | Cheap, but still metered per-token from day one; no free tier for a hackathon budget. |
| Self-hosted (Hugging Face inference) | Removes the API-key/cost question entirely, but trades it for cold-start latency and infra to babysit — the wrong trade for a task sitting in the middle of a patient's interaction, where they're actively waiting. |
| **Groq, free tier, `llama-3.1-8b-instant`** | **Chosen.** Free, and Groq's inference hardware is built for exactly this: fast enough that "wait for the model" doesn't break the interaction's pace. Llama 3.1 8B is more than sufficient for "match this transcript to one of these options" or "clean up this sentence" — no need for a bigger model. |

Every Groq call also runs behind a ~4s timeout and a strict guardrail (its `choice_match` output is validated against the real options list — the model can narrow down, never invent an option), and every suggestion — local-matched or Groq-matched — is shown as an editable, explicitly-confirmed suggestion, never written straight to the record. See [GR-012](./specs/GR-012-llm-parse-route-groq.md).

## Correctness

The main correctness evidence is [GR-017](./specs/GR-017-persona-test-suite.md)'s persona test suite: six full scripted patients (a straightforward male patient, three female-specific branches — regular cycle, pregnant, menopausal/PCOS — a consent-declined patient, and an all-declined/auto-skip patient) each driven through the real store's `answer()` action end to end and asserted against a complete, hand-written expected output — not spot checks. Run it yourself:

```bash
npm test
```

151 tests across 31 files, no network calls, no browser — done in a few seconds. This also covers the deterministic rules engine (exclusive-option clearing, table auto-skip — [GR-004](./specs/GR-004-inference-rules-engine.md)), the output assembler/validator ([GR-005](./specs/GR-005-output-assembler-validator.md)), and the Groq route's fallback/guardrail behavior in isolation ([GR-012](./specs/GR-012-llm-parse-route-groq.md)).

## Per-question design rationale

How each of the brief's 16 questions is actually answered — the point being that this was decided deliberately per question, not defaulted to one generic input everywhere:

| # | Question | Interaction |
|---|---|---|
| 1 | At what age did your hair loss begin? | Tap +/− stepper, or type the number directly |
| 2 | How long have you been noticing hair loss? | Tap a chip, or speak it (voice → suggested chip → tap to confirm) |
| 3 | Does anyone in your family have hair loss? | Tap chips (multi-select; "No known family history" auto-clears the others and vice versa), or voice + confirm |
| 4 | What pattern does your hair loss follow? | Tap regions directly on an interactive scalp diagram (hairline / crown / part-line / diffuse / patchy), plus a standalone chip for "sudden excessive shedding" |
| 5 | Have you been diagnosed with any of these? | Tap chips (multi-select; "None" is exclusive with the rest), or voice + confirm |
| 6 | How would you describe your menstrual cycle? | Tap a chip, or voice + confirm — question is skipped entirely for patients whose profile isn't female |
| 7 | Are you currently pregnant or postpartum? | Tap a chip, or voice + confirm — same female-only auto-skip as above |
| 8 | Do you have acne or oily skin as an adult? | Swipe left/right, or tap Yes/No |
| 9 | Do you have excess body or facial hair growth? | Swipe left/right, or tap Yes/No |
| 10 | In the past 6 months, has any of this applied to you? | Tap chips (multi-select), or voice + confirm |
| 11 | Everyday hair-care habits (6-row table: smoking, alcohol, hard water, wash frequency, heat/chemical styling, salon treatments) | Table-as-cards: each row is its own swipe/tap yes-no (or chip, for wash frequency); a "yes" on smoking or salon treatments reveals a follow-up (severity chip, or a typed/voice-dictated detail) — rows that don't apply are never shown |
| 12 | Which of these have you used on your hair? (5-row product table) | Table-as-cards: tap/swipe "used" per product; a "yes" reveals duration (chip), helped (swipe/tap), and side effects (swipe/tap) for that row only |
| 13 | Have you had any in-clinic procedures? (4-row table) | Same table-as-cards pattern as products |
| 14 | Did any past treatment cause side effects or not help? | Swipe or tap Yes/No; a "yes" reveals a typed-or-spoken free-text follow-up |
| 15 | Which sample would you prefer to give? | Tap a chip, or voice + confirm |
| 16 | Do you consent to sample collection and genetic analysis? | Tap-only, deliberately — the one screen with no swipe gesture and no voice shortcut, so the interaction reads as formal and unambiguous rather than gamified |

## With one more week

Candid list of what didn't make the cut:

- **Freeform patch placement on the scalp diagram.** The shipped picker uses five fixed regions (hairline/crown/part-line/diffuse/patchy) rather than letting the patient drag out an arbitrary patch shape — the fixed-region version covers the brief's actual question well, but a freeform version would read as more "alive."
- **Multi-language / Hinglish voice prompts.** Web Speech API supports other locales; the interpretation prompt to Groq could be made language-aware too. Skipped for time — English-only for the hackathon.
- **A lightweight doctor-facing PDF export.** The review screen exports raw JSON and a formatted on-screen summary today; a one-click "print-friendly PDF" would close the loop for an actual clinic workflow better than JSON does.
- **Richer inferred-defaults coverage.** [GR-004](./specs/GR-004-inference-rules-engine.md)'s rules engine currently covers exclusive-option clearing and table auto-skip; there's room for more — e.g. pre-suggesting `duration` bucket from a freeform "since when" voice answer, rather than requiring the patient to pick the bucket themselves.
- **Offline/flaky-connection resilience.** The app assumes a live connection for the Groq fallback tier; a patient on a bad clinic wifi would fall back to manual entry today (which works, just isn't as smooth), rather than something smarter like queuing the interpretation request.

## Requirements

Node 20+ (pinned via `.nvmrc`; run `nvm use` if you have nvm).

## Local dev

```bash
npm install
cp .env.example .env.local   # then fill in your own GROQ_API_KEY
npm run dev
```

## Tests

```bash
npm test          # run once — this is what GR-017's correctness proof runs
npm run test:watch
```
