import { describe, it, expect } from "vitest";
import type { IntakeOutput } from "@/lib/schema";

// A fully-answered fixture (male patient) — exercises every key IntakeOutput declares.
// This is also the shape GR-005's assembleOutput() and GR-017's persona tests must produce.
const fixture: IntakeOutput = {
  form: "GenoRoot Hair & Scalp Intake",
  generatedAt: new Date().toISOString(),
  patient: { name: "Rahul Verma", age: 32, sex: "Male" },
  sections: {
    A: {
      age_hair_loss_began: 27,
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
          row: "Topical Minoxidil",
          used: true,
          duration: "3-6mo",
          helped: true,
          side_effects: false,
        },
        {
          row: "OTC/Medicated Shampoos",
          used: false,
          duration: null,
          helped: null,
          side_effects: null,
        },
      ],
      procedures: [
        { row: "PRP/GFC/iPRF", done: false, sessions: null, helped: null },
      ],
      past_treatment_side_effects: false,
      describe: null,
    },
    E: {
      sample_type: "Saliva",
      consent: true,
    },
  },
};

// Keys as declared in the brief's machine-readable schema — the thing that's graded.
const EXPECTED_SECTION_KEYS = {
  A: ["age_hair_loss_began", "duration", "family_history", "pattern"],
  B: [
    "diagnosed_conditions",
    "menstrual_cycle",
    "pregnancy_related",
    "adult_acne_oily_skin",
    "excess_body_facial_hair",
  ],
  C: ["past_6_months", "habits"],
  D: ["products", "procedures", "past_treatment_side_effects", "describe"],
  E: ["sample_type", "consent"],
};

const EXPECTED_HABITS_KEYS = [
  "smoking",
  "smoking_severity",
  "alcohol",
  "hard_water",
  "hair_wash_frequency",
  "heating_tools_styling_chemicals",
  "salon_treatments",
  "salon_treatment_detail",
];

const EXPECTED_PRODUCT_ROW_KEYS = [
  "row",
  "used",
  "duration",
  "helped",
  "side_effects",
];
const EXPECTED_PROCEDURE_ROW_KEYS = ["row", "done", "sessions", "helped"];

describe("IntakeOutput shape matches the brief's keys exactly", () => {
  it("top-level has form, generatedAt, patient, sections", () => {
    expect(Object.keys(fixture).sort()).toEqual(
      ["form", "generatedAt", "patient", "sections"].sort()
    );
  });

  it.each(Object.entries(EXPECTED_SECTION_KEYS))(
    "section %s has exactly the brief's keys",
    (id, keys) => {
      const section = fixture.sections[id as keyof typeof fixture.sections];
      expect(Object.keys(section).sort()).toEqual([...keys].sort());
    }
  );

  it("habits has exactly the brief's row keys plus followups", () => {
    expect(Object.keys(fixture.sections.C.habits).sort()).toEqual(
      [...EXPECTED_HABITS_KEYS].sort()
    );
  });

  it("every product row has exactly the brief's column keys", () => {
    for (const row of fixture.sections.D.products) {
      expect(Object.keys(row).sort()).toEqual(
        [...EXPECTED_PRODUCT_ROW_KEYS].sort()
      );
    }
  });

  it("every procedure row has exactly the brief's column keys", () => {
    for (const row of fixture.sections.D.procedures) {
      expect(Object.keys(row).sort()).toEqual(
        [...EXPECTED_PROCEDURE_ROW_KEYS].sort()
      );
    }
  });

  it("a row left at used:false / done:false has null dependent fields, not missing keys", () => {
    const skippedProduct = fixture.sections.D.products.find((p) => !p.used);
    expect(skippedProduct).toMatchObject({
      duration: null,
      helped: null,
      side_effects: null,
    });

    const skippedProcedure = fixture.sections.D.procedures.find((p) => !p.done);
    expect(skippedProcedure).toMatchObject({ sessions: null, helped: null });
  });
});
