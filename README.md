# GenoRoot — Hair & Scalp Intake

A self-filling 16-question patient intake for a hair & scalp clinic. Built for a hackathon — see [`/specs`](./specs/README.md) for the full architecture, task breakdown, and status.

**By design, this app has no login, no admin panel, and no database/backend persistence.** It's a stateless, single-patient-at-a-time client app; the only server-side code is a narrow API route that proxies a Groq LLM call for free-text parsing (see [GR-012](./specs/GR-012-llm-parse-route-groq.md)), keeping that API key out of the client bundle.

## Stack

Next.js 15 (App Router, TypeScript) · Tailwind CSS · Framer Motion · Zustand · Vitest + React Testing Library · Web Speech API (voice) · Groq (LLM assist)

## Requirements

Node 20+ (pinned via `.nvmrc`; run `nvm use` if you have nvm).

## Local dev

```bash
npm install
cp .env.example .env.local   # then fill in GROQ_API_KEY
npm run dev
```

## Tests

```bash
npm test          # run once
npm run test:watch
```

## Full write-up

A judge-facing README (resourcefulness rationale, per-question design decisions, correctness verification, "one more week" ideas) lands as part of [GR-018](./specs/GR-018-deploy-judge-readme.md), once the app is functionally complete.
