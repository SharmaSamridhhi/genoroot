# Persona test suite — the correctness proof

This directory is the answer to "how you checked the form actually gets filled correctly"
(GR-017). No Playwright, no browser — each test drives the real Zustand store
(`lib/engine/store.ts`) through a realistic mock patient's answers via `answer()` /
`toggleMultiOption()`, then asserts `assembleOutput()` produces the exact `IntakeOutput`
shape and `validateOutput()` agrees it's complete. Because this exercises the actual
engine, rules, and assembler — not hand-built fixture JSON — it catches the same class
of bugs an end-to-end browser test would, at a fraction of the runtime.

Run it: `npm test` (whole suite runs in well under a second, no network, no browser).

## Personas

| File                             | Proves                                                                                                                                                                                                |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `male-straightforward.test.ts`   | Baseline path; Q6/Q7 resolve to `"Not applicable"` for a male patient despite never being shown; exclusive-option clearing on `diagnosed_conditions`; a `used:true` product row keeps its sub-fields. |
| `female-regular-cycle.test.ts`   | Q6/Q7 render and are captured correctly for a female patient.                                                                                                                                         |
| `female-pregnant.test.ts`        | `pregnancy_related: "Currently pregnant"` flows through alongside a realistic hormonal-symptom answer set.                                                                                            |
| `female-menopausal-pcos.test.ts` | Multi-value `diagnosed_conditions`, `menstrual_cycle: "Menopausal"`, and a salon-treatment followup text field.                                                                                       |
| `consent-declined.test.ts`       | An otherwise-complete intake with `consent: false` is still **valid** — declining is a complete answer, not a blocker.                                                                                |
| `all-declined-autoskip.test.ts`  | Every gating question answered "No" — proves the auto-skip mechanism (GR-004) nulls every dependent field while keeping every key present, and the result still validates.                            |

`fixtures.ts` holds the "declined everything" product/procedure/habits rows shared across
personas that didn't use any products or procedures, so each test file stays focused on
what's actually distinctive about that patient.
