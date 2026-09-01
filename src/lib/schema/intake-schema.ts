// Machine-readable transcription of the GenoRoot intake brief. This is the single
// source of truth for question order, options, and branching flags — no other file
// should hardcode an option list. Option strings are copied verbatim from the brief's
// machine-readable schema (not the prose descriptions), since that's what's graded.

export type QuestionType = "number" | "single" | "multi" | "yesno" | "text";

export interface FollowupSpec {
  key: string;
  type: "single" | "text";
  options?: string[];
}

export interface SimpleQuestion {
  n: number;
  key: string;
  type: QuestionType;
  options?: string[];
  femaleOnly?: boolean;
  followup?: FollowupSpec;
}

export interface HabitsRow {
  key: string;
  type: "yesno" | "single";
  options?: string[];
  followup?: FollowupSpec;
}

export interface HabitsTableQuestion {
  n: number;
  key: "habits";
  type: "table";
  rows: HabitsRow[];
}

export interface ColumnSpec {
  key: string;
  type: "bool" | "single" | "yesno";
  options?: string[];
}

export interface UniformTableQuestion {
  n: number;
  key: "products" | "procedures";
  type: "table";
  rows: string[];
  columns: ColumnSpec[];
}

export type Question =
  SimpleQuestion | HabitsTableQuestion | UniformTableQuestion;

export interface Section {
  id: "A" | "B" | "C" | "D" | "E";
  title: string;
  questions: Question[];
}

export interface IntakeSchema {
  form: string;
  sections: Section[];
}

export const INTAKE_SCHEMA: IntakeSchema = {
  form: "GenoRoot Hair & Scalp Intake",
  sections: [
    {
      id: "A",
      title: "Personal & Family Hair Loss History",
      questions: [
        { n: 1, key: "age_hair_loss_began", type: "number" },
        {
          n: 2,
          key: "duration",
          type: "single",
          options: ["Less than 6 months", "6-12 months", "Over a year"],
        },
        {
          n: 3,
          key: "family_history",
          type: "multi",
          options: [
            "Father had hair loss",
            "Mother had hair loss",
            "Siblings with thinning or baldness",
            "No known family history",
          ],
        },
        {
          n: 4,
          key: "pattern",
          type: "multi",
          options: [
            "Receding hairline",
            "Thinning at crown",
            "Widening part line",
            "Diffuse thinning",
            "Patchy loss",
            "Sudden excessive shedding",
          ],
        },
      ],
    },
    {
      id: "B",
      title: "Hormonal & Health Influences",
      questions: [
        {
          n: 5,
          key: "diagnosed_conditions",
          type: "multi",
          options: [
            "PCOS/PCOD",
            "Thyroid disorder",
            "Diabetes",
            "Autoimmune disease",
            "Anemia",
            "None",
          ],
        },
        {
          n: 6,
          key: "menstrual_cycle",
          type: "single",
          options: ["Regular", "Irregular", "Menopausal", "Not applicable"],
          femaleOnly: true,
        },
        {
          n: 7,
          key: "pregnancy_related",
          type: "single",
          options: [
            "Currently pregnant",
            "Postpartum <1 year",
            "Not applicable",
          ],
          femaleOnly: true,
        },
        { n: 8, key: "adult_acne_oily_skin", type: "yesno" },
        { n: 9, key: "excess_body_facial_hair", type: "yesno" },
      ],
    },
    {
      id: "C",
      title: "Lifestyle & Environmental Triggers",
      questions: [
        {
          n: 10,
          key: "past_6_months",
          type: "multi",
          options: [
            "Crash dieting or major weight loss",
            "High stress or emotional trauma",
            "Fever with illness (COVID, Dengue, Typhoid)",
            "Recent surgery",
            "Change in location/water/air quality",
          ],
        },
        {
          n: 11,
          key: "habits",
          type: "table",
          rows: [
            {
              key: "smoking",
              type: "yesno",
              followup: {
                key: "smoking_severity",
                type: "single",
                options: ["Mild <5/day", "Moderate 5-10/day", "Severe >10/day"],
              },
            },
            { key: "alcohol", type: "yesno" },
            { key: "hard_water", type: "yesno" },
            {
              key: "hair_wash_frequency",
              type: "single",
              options: ["Daily", "Alternate Days", "Weekly"],
            },
            { key: "heating_tools_styling_chemicals", type: "yesno" },
            {
              key: "salon_treatments",
              type: "yesno",
              followup: { key: "salon_treatment_detail", type: "text" },
            },
          ],
        },
      ],
    },
    {
      id: "D",
      title: "Current Hair Care & Treatments",
      questions: [
        {
          n: 12,
          key: "products",
          type: "table",
          rows: [
            "OTC/Medicated Shampoos",
            "Hair Oils/Serums",
            "Topical Minoxidil",
            "Oral Minoxidil",
            "Supplements",
          ],
          columns: [
            { key: "used", type: "bool" },
            {
              key: "duration",
              type: "single",
              options: ["<3mo", "3-6mo", ">6mo"],
            },
            { key: "helped", type: "yesno" },
            { key: "side_effects", type: "yesno" },
          ],
        },
        {
          n: 13,
          key: "procedures",
          type: "table",
          rows: [
            "PRP/GFC/iPRF",
            "Stem Cells/Exosomes",
            "Hair Transplant",
            "Other",
          ],
          columns: [
            { key: "done", type: "bool" },
            { key: "sessions", type: "single", options: ["1-3", "4-6", ">6"] },
            { key: "helped", type: "yesno" },
          ],
        },
        {
          n: 14,
          key: "past_treatment_side_effects",
          type: "yesno",
          followup: { key: "describe", type: "text" },
        },
      ],
    },
    {
      id: "E",
      title: "Sample Collection & Consent",
      questions: [
        {
          n: 15,
          key: "sample_type",
          type: "single",
          options: ["Saliva", "Blood", "Either"],
        },
        { n: 16, key: "consent", type: "yesno" },
      ],
    },
  ],
};
