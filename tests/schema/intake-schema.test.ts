import { describe, it, expect } from "vitest";
import { INTAKE_SCHEMA } from "@/lib/schema";

// Every option string here is copied verbatim from the brief's machine-readable
// JSON schema. This test exists to catch typos in intake-schema.ts — the thing
// graders will actually string-match against.
const EXPECTED_OPTIONS: Record<string, string[]> = {
  duration: ["Less than 6 months", "6-12 months", "Over a year"],
  family_history: [
    "Father had hair loss",
    "Mother had hair loss",
    "Siblings with thinning or baldness",
    "No known family history",
  ],
  pattern: [
    "Receding hairline",
    "Thinning at crown",
    "Widening part line",
    "Diffuse thinning",
    "Patchy loss",
    "Sudden excessive shedding",
  ],
  diagnosed_conditions: [
    "PCOS/PCOD",
    "Thyroid disorder",
    "Diabetes",
    "Autoimmune disease",
    "Anemia",
    "None",
  ],
  menstrual_cycle: ["Regular", "Irregular", "Menopausal", "Not applicable"],
  pregnancy_related: [
    "Currently pregnant",
    "Postpartum <1 year",
    "Not applicable",
  ],
  past_6_months: [
    "Crash dieting or major weight loss",
    "High stress or emotional trauma",
    "Fever with illness (COVID, Dengue, Typhoid)",
    "Recent surgery",
    "Change in location/water/air quality",
  ],
  sample_type: ["Saliva", "Blood", "Either"],
};

function findQuestion(key: string) {
  for (const section of INTAKE_SCHEMA.sections) {
    const q = section.questions.find((q) => q.key === key);
    if (q) return q;
  }
  return undefined;
}

describe("INTAKE_SCHEMA option strings", () => {
  for (const [key, expectedOptions] of Object.entries(EXPECTED_OPTIONS)) {
    it(`"${key}" options match the brief exactly`, () => {
      const question = findQuestion(key);
      expect(question).toBeDefined();
      expect((question as { options?: string[] }).options).toEqual(
        expectedOptions
      );
    });
  }

  it("menstrual_cycle and pregnancy_related are marked femaleOnly", () => {
    expect(
      (findQuestion("menstrual_cycle") as { femaleOnly?: boolean }).femaleOnly
    ).toBe(true);
    expect(
      (findQuestion("pregnancy_related") as { femaleOnly?: boolean }).femaleOnly
    ).toBe(true);
  });

  it("all 16 questions are present across the 5 sections", () => {
    const allQuestions = INTAKE_SCHEMA.sections.flatMap((s) => s.questions);
    expect(allQuestions).toHaveLength(16);
    expect(allQuestions.map((q) => q.n)).toEqual(
      Array.from({ length: 16 }, (_, i) => i + 1)
    );
  });

  it("Q11 habits table has the 6 rows from the brief with correct followups", () => {
    const habits = findQuestion("habits");
    expect(habits?.type).toBe("table");
    const rows = (habits as { rows: { key: string }[] }).rows;
    expect(rows.map((r) => r.key)).toEqual([
      "smoking",
      "alcohol",
      "hard_water",
      "hair_wash_frequency",
      "heating_tools_styling_chemicals",
      "salon_treatments",
    ]);
    const smoking = rows.find((r) => r.key === "smoking") as {
      followup?: { key: string; options?: string[] };
    };
    expect(smoking.followup?.key).toBe("smoking_severity");
    expect(smoking.followup?.options).toEqual([
      "Mild <5/day",
      "Moderate 5-10/day",
      "Severe >10/day",
    ]);
  });

  it("Q12 products and Q13 procedures have the row/column shape from the brief", () => {
    const products = findQuestion("products") as {
      rows: string[];
      columns: { key: string }[];
    };
    expect(products.rows).toEqual([
      "OTC/Medicated Shampoos",
      "Hair Oils/Serums",
      "Topical Minoxidil",
      "Oral Minoxidil",
      "Supplements",
    ]);
    expect(products.columns.map((c) => c.key)).toEqual([
      "used",
      "duration",
      "helped",
      "side_effects",
    ]);

    const procedures = findQuestion("procedures") as {
      rows: string[];
      columns: { key: string }[];
    };
    expect(procedures.rows).toEqual([
      "PRP/GFC/iPRF",
      "Stem Cells/Exosomes",
      "Hair Transplant",
      "Other",
    ]);
    expect(procedures.columns.map((c) => c.key)).toEqual([
      "done",
      "sessions",
      "helped",
    ]);
  });
});
