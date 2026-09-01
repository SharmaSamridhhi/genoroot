// Derived answer/output types. `yesno`/`bool`-typed schema fields serialize as
// TypeScript boolean here (not "Yes"/"No" strings) — see GR-002 for the rationale.
// `single`/`multi` fields keep the exact option strings from intake-schema.ts.

export type Sex = "Male" | "Female" | "Prefer not to say";

export interface PatientProfile {
  name?: string;
  age: number;
  sex: Sex;
}

export interface ProductRow {
  row:
    | "OTC/Medicated Shampoos"
    | "Hair Oils/Serums"
    | "Topical Minoxidil"
    | "Oral Minoxidil"
    | "Supplements";
  used: boolean;
  duration: "<3mo" | "3-6mo" | ">6mo" | null;
  helped: boolean | null;
  side_effects: boolean | null;
}

export interface ProcedureRow {
  row: "PRP/GFC/iPRF" | "Stem Cells/Exosomes" | "Hair Transplant" | "Other";
  done: boolean;
  sessions: "1-3" | "4-6" | ">6" | null;
  helped: boolean | null;
}

export interface Habits {
  smoking: boolean;
  smoking_severity:
    "Mild <5/day" | "Moderate 5-10/day" | "Severe >10/day" | null;
  alcohol: boolean;
  hard_water: boolean;
  hair_wash_frequency: "Daily" | "Alternate Days" | "Weekly";
  heating_tools_styling_chemicals: boolean;
  salon_treatments: boolean;
  salon_treatment_detail: string | null;
}

export interface IntakeOutput {
  form: "GenoRoot Hair & Scalp Intake";
  generatedAt: string; // ISO timestamp
  patient: PatientProfile;
  sections: {
    A: {
      age_hair_loss_began: number;
      duration: "Less than 6 months" | "6-12 months" | "Over a year";
      family_history: string[];
      pattern: string[];
    };
    B: {
      diagnosed_conditions: string[];
      menstrual_cycle:
        "Regular" | "Irregular" | "Menopausal" | "Not applicable";
      pregnancy_related:
        "Currently pregnant" | "Postpartum <1 year" | "Not applicable";
      adult_acne_oily_skin: boolean;
      excess_body_facial_hair: boolean;
    };
    C: {
      past_6_months: string[];
      habits: Habits;
    };
    D: {
      products: ProductRow[];
      procedures: ProcedureRow[];
      past_treatment_side_effects: boolean;
      describe: string | null;
    };
    E: {
      sample_type: "Saliva" | "Blood" | "Either";
      consent: boolean;
    };
  };
}

// The set of answers accumulated during the intake flow, before final assembly.
// Partial because most fields are unanswered until the patient reaches that step.
export interface Answers {
  A: Partial<IntakeOutput["sections"]["A"]>;
  B: Partial<IntakeOutput["sections"]["B"]>;
  C: Partial<Omit<IntakeOutput["sections"]["C"], "habits">> & {
    habits: Partial<Habits>;
  };
  D: Partial<Omit<IntakeOutput["sections"]["D"], "products" | "procedures">> & {
    products: Partial<ProductRow>[];
    procedures: Partial<ProcedureRow>[];
  };
  E: Partial<IntakeOutput["sections"]["E"]>;
}
