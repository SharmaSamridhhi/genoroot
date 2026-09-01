import type { ProcedureRow, ProductRow } from "@/lib/schema/types";

// Shared "nothing tried" rows, reused across personas that didn't use any
// products/procedures — keeps each persona file focused on what's distinctive
// about that patient rather than repeating this boilerplate five times.
export const ALL_PRODUCTS_DECLINED: ProductRow[] = [
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
    used: false,
    duration: null,
    helped: null,
    side_effects: null,
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
];

export const ALL_PROCEDURES_DECLINED: ProcedureRow[] = [
  { row: "PRP/GFC/iPRF", done: false, sessions: null, helped: null },
  { row: "Stem Cells/Exosomes", done: false, sessions: null, helped: null },
  { row: "Hair Transplant", done: false, sessions: null, helped: null },
  { row: "Other", done: false, sessions: null, helped: null },
];

export const HABITS_ALL_NO = {
  smoking: false,
  smoking_severity: null,
  alcohol: false,
  hard_water: false,
  hair_wash_frequency: "Weekly" as const,
  heating_tools_styling_chemicals: false,
  salon_treatments: false,
  salon_treatment_detail: null,
};
