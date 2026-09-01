import { describe, it, expect } from "vitest";
import { assembleOutput, validateOutput } from "@/lib/engine";
import { emptyAnswers } from "@/lib/engine/store";
import type { Answers, PatientProfile } from "@/lib/schema/types";

const male: PatientProfile = { age: 32, sex: "Male" };

function fullyAnsweredMaleAnswers(): Answers {
  return {
    A: {
      age_hair_loss_began: 27,
      duration: "Over a year",
      family_history: ["Father had hair loss"],
      pattern: ["Receding hairline"],
    },
    B: {
      diagnosed_conditions: ["None"],
      adult_acne_oily_skin: false,
      excess_body_facial_hair: false,
    },
    C: {
      past_6_months: [],
      habits: {
        smoking: false,
        smoking_severity: null,
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
        { row: "Hair Transplant", done: false, sessions: null, helped: null },
        { row: "Other", done: false, sessions: null, helped: null },
      ],
      past_treatment_side_effects: false,
      describe: null,
    },
    E: {
      sample_type: "Saliva",
      consent: true,
    },
  };
}

describe("validateOutput", () => {
  it("invalid with no profile", () => {
    expect(validateOutput(null, emptyAnswers()).valid).toBe(false);
  });

  it("invalid when required steps are unanswered", () => {
    const result = validateOutput(male, emptyAnswers());
    expect(result.valid).toBe(false);
    expect(result.missingSteps.length).toBeGreaterThan(0);
  });

  it("valid once every visible step is answered, including an explicit consent:false", () => {
    const answers = fullyAnsweredMaleAnswers();
    answers.E.consent = false;
    const result = validateOutput(male, answers);
    expect(result.valid).toBe(true);
    expect(result.missingSteps).toEqual([]);
  });
});

describe("assembleOutput", () => {
  it("produces the exact IntakeOutput shape for a fully-answered male patient", () => {
    const output = assembleOutput(male, fullyAnsweredMaleAnswers());
    expect(output.form).toBe("GenoRoot Hair & Scalp Intake");
    expect(output.patient).toEqual(male);
    expect(output.sections.B.menstrual_cycle).toBe("Not applicable");
    expect(output.sections.B.pregnancy_related).toBe("Not applicable");
    expect(output.sections.D.products).toHaveLength(5);
    expect(
      output.sections.D.products.find((p) => p.row === "Topical Minoxidil")
    ).toMatchObject({
      used: true,
      duration: "3-6mo",
    });
    expect(
      output.sections.D.products.find((p) => p.row === "OTC/Medicated Shampoos")
    ).toMatchObject({
      used: false,
      duration: null,
      helped: null,
      side_effects: null,
    });
    expect(output.sections.E.consent).toBe(true);
  });

  it("declining consent assembles as consent:false, never silently coerced to true", () => {
    const answers = fullyAnsweredMaleAnswers();
    answers.E.consent = false;
    const output = assembleOutput(male, answers);
    expect(output.sections.E.consent).toBe(false);
  });
});
