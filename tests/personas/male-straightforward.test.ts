import { describe, it, expect } from "vitest";
import { createIntakeStore } from "@/lib/engine/store";
import { assembleOutput, validateOutput } from "@/lib/engine";

describe("persona: male, straightforward case", () => {
  it("produces a complete, correct IntakeOutput", () => {
    const useStore = createIntakeStore();
    const s = useStore.getState();

    s.setProfile({ name: "Rahul Verma", age: 34, sex: "Male" });

    s.answer({ section: "A", questionKey: "age_hair_loss_began" }, 29);
    s.answer({ section: "A", questionKey: "duration" }, "Over a year");
    s.toggleMultiOption(
      { section: "A", questionKey: "family_history" },
      "Father had hair loss"
    );
    s.toggleMultiOption(
      { section: "A", questionKey: "pattern" },
      "Receding hairline"
    );
    s.toggleMultiOption(
      { section: "A", questionKey: "pattern" },
      "Thinning at crown"
    );

    // "None" tapped after another option was selected clears it (GR-004 exclusivity).
    s.toggleMultiOption(
      { section: "B", questionKey: "diagnosed_conditions" },
      "Thyroid disorder"
    );
    s.toggleMultiOption(
      { section: "B", questionKey: "diagnosed_conditions" },
      "None"
    );
    s.answer({ section: "B", questionKey: "adult_acne_oily_skin" }, false);
    s.answer({ section: "B", questionKey: "excess_body_facial_hair" }, false);

    s.toggleMultiOption(
      { section: "C", questionKey: "past_6_months" },
      "High stress or emotional trauma"
    );
    s.answer(
      { section: "C", questionKey: "habits" },
      {
        smoking: true,
        smoking_severity: "Mild <5/day",
        alcohol: false,
        hard_water: true,
        hair_wash_frequency: "Alternate Days",
        heating_tools_styling_chemicals: false,
        salon_treatments: false,
        salon_treatment_detail: null,
      }
    );

    s.answer({ section: "D", questionKey: "products" }, [
      {
        row: "OTC/Medicated Shampoos",
        used: false,
        duration: null,
        helped: null,
        side_effects: null,
      },
      {
        row: "Hair Oils/Serums",
        used: false,
        duration: null,
        helped: null,
        side_effects: null,
      },
      {
        row: "Topical Minoxidil",
        used: true,
        duration: "3-6mo",
        helped: true,
        side_effects: false,
      },
      {
        row: "Oral Minoxidil",
        used: false,
        duration: null,
        helped: null,
        side_effects: null,
      },
      {
        row: "Supplements",
        used: false,
        duration: null,
        helped: null,
        side_effects: null,
      },
    ]);
    s.answer({ section: "D", questionKey: "procedures" }, [
      { row: "PRP/GFC/iPRF", done: false, sessions: null, helped: null },
      { row: "Stem Cells/Exosomes", done: false, sessions: null, helped: null },
      { row: "Hair Transplant", done: false, sessions: null, helped: null },
      { row: "Other", done: false, sessions: null, helped: null },
    ]);
    s.answer(
      { section: "D", questionKey: "past_treatment_side_effects" },
      false
    );

    s.answer({ section: "E", questionKey: "sample_type" }, "Saliva");
    s.answer({ section: "E", questionKey: "consent" }, true);

    const finalState = useStore.getState();
    const validation = validateOutput(finalState.profile, finalState.answers);
    expect(validation.valid).toBe(true);

    const output = assembleOutput(finalState.profile!, finalState.answers);
    expect(output).toEqual({
      form: "GenoRoot Hair & Scalp Intake",
      generatedAt: expect.any(String),
      patient: { name: "Rahul Verma", age: 34, sex: "Male" },
      sections: {
        A: {
          age_hair_loss_began: 29,
          duration: "Over a year",
          family_history: ["Father had hair loss"],
          pattern: ["Receding hairline", "Thinning at crown"],
        },
        B: {
          diagnosed_conditions: ["None"],
          menstrual_cycle: "Not applicable",
          pregnancy_related: "Not applicable",
          adult_acne_oily_skin: false,
          excess_body_facial_hair: false,
        },
        C: {
          past_6_months: ["High stress or emotional trauma"],
          habits: {
            smoking: true,
            smoking_severity: "Mild <5/day",
            alcohol: false,
            hard_water: true,
            hair_wash_frequency: "Alternate Days",
            heating_tools_styling_chemicals: false,
            salon_treatments: false,
            salon_treatment_detail: null,
          },
        },
        D: {
          products: [
            {
              row: "OTC/Medicated Shampoos",
              used: false,
              duration: null,
              helped: null,
              side_effects: null,
            },
            {
              row: "Hair Oils/Serums",
              used: false,
              duration: null,
              helped: null,
              side_effects: null,
            },
            {
              row: "Topical Minoxidil",
              used: true,
              duration: "3-6mo",
              helped: true,
              side_effects: false,
            },
            {
              row: "Oral Minoxidil",
              used: false,
              duration: null,
              helped: null,
              side_effects: null,
            },
            {
              row: "Supplements",
              used: false,
              duration: null,
              helped: null,
              side_effects: null,
            },
          ],
          procedures: [
            { row: "PRP/GFC/iPRF", done: false, sessions: null, helped: null },
            {
              row: "Stem Cells/Exosomes",
              done: false,
              sessions: null,
              helped: null,
            },
            {
              row: "Hair Transplant",
              done: false,
              sessions: null,
              helped: null,
            },
            { row: "Other", done: false, sessions: null, helped: null },
          ],
          past_treatment_side_effects: false,
          describe: null,
        },
        E: { sample_type: "Saliva", consent: true },
      },
    });
  });
});
