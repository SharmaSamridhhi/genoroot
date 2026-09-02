# GenoRoot — Hair & Scalp Intake

**Live demo: https://airform-nu.vercel.app** _(mock/placeholder data only — never enter real personal information)_

A self-filling replacement for a clinic's static 16-question hair-loss intake form. Each question gets the input its type deserves — a swipe for a yes/no, a chip for a multiple-choice, voice for anything free-text — instead of one generic input for everything. A small deterministic rules engine handles auto-skips and exclusive-option logic; a narrow LLM assist only ever _suggests_ a spoken answer, and the patient always taps to confirm before anything is written.

**No login, no admin panel, no database.** It's a stateless, single-patient-at-a-time client app; the only server-side code is a narrow API route that proxies a Groq LLM call for free-text interpretation, which is also the only place the Groq API key is ever read.

## Stack

Next.js 15 (App Router, TypeScript) · Tailwind CSS · Framer Motion · Zustand (with `persist`) · Vitest + React Testing Library · Web Speech API (voice capture) · Groq / Llama 3.1 8B (LLM assist)

## Feature flags

`src/lib/featureFlags.ts` — plain constants, edit and redeploy to change:

- `ENABLE_SCALP_DIAGRAM` (default off) — the interactive scalp SVG on the pattern question; falls back to a plain chip picker.
- `ENABLE_VOICE` (default on) — mic buttons and voice-interpretation suggestions everywhere they appear.

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
npm test          # run once
npm run test:watch
```

## More

Architecture, task breakdown, and per-feature design notes live in [`/specs`](./specs/README.md).
