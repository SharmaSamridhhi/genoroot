import type {
  Answers,
  Habits,
  IntakeOutput,
  PatientProfile,
  ProcedureRow,
  ProductRow,
} from "@/lib/schema/types";

// assembleOutput expects a validated-complete answer set (see validateOutput below —
// callers should gate on that before assembling). The `?? fallback` defaults below
// exist only so this never throws on a defensively-incomplete call; they are not
// meant to be reached in the normal flow.

function coerceProductRow(row: Partial<ProductRow>): ProductRow {
  const used = row.used ?? false;
  return {
    row: row.row as ProductRow["row"],
    used,
    duration: used ? (row.duration ?? null) : null,
    helped: used ? (row.helped ?? null) : null,
    side_effects: used ? (row.side_effects ?? null) : null,
  };
}

function coerceProcedureRow(row: Partial<ProcedureRow>): ProcedureRow {
  const done = row.done ?? false;
  return {
    row: row.row as ProcedureRow["row"],
    done,
    sessions: done ? (row.sessions ?? null) : null,
    helped: done ? (row.helped ?? null) : null,
  };
}

function coerceHabits(habits: Partial<Habits>): Habits {
  const smoking = habits.smoking ?? false;
  const salonTreatments = habits.salon_treatments ?? false;
  return {
    smoking,
    smoking_severity: smoking ? (habits.smoking_severity ?? null) : null,
    alcohol: habits.alcohol ?? false,
    hard_water: habits.hard_water ?? false,
    hair_wash_frequency: habits.hair_wash_frequency ?? "Alternate Days",
    heating_tools_styling_chemicals:
      habits.heating_tools_styling_chemicals ?? false,
    salon_treatments: salonTreatments,
    salon_treatment_detail: salonTreatments
      ? (habits.salon_treatment_detail ?? null)
      : null,
  };
}

/**
 * The only place in the app that constructs an IntakeOutput. Female-only questions
 * (menstrual_cycle, pregnancy_related) resolve to "Not applicable" for a non-female
 * patient even though they never saw those steps — every key from the brief is
 * always present in the output, regardless of branching.
 */
export function assembleOutput(
  profile: PatientProfile,
  answers: Answers
): IntakeOutput {
  const isFemale = profile.sex === "Female";

  return {
    form: "GenoRoot Hair & Scalp Intake",
    generatedAt: new Date().toISOString(),
    patient: profile,
    sections: {
      A: {
        age_hair_loss_began: answers.A.age_hair_loss_began ?? 0,
        duration: answers.A.duration ?? "Less than 6 months",
        family_history: answers.A.family_history ?? [],
        pattern: answers.A.pattern ?? [],
      },
      B: {
        diagnosed_conditions: answers.B.diagnosed_conditions ?? [],
        menstrual_cycle: isFemale
          ? (answers.B.menstrual_cycle ?? "Not applicable")
          : "Not applicable",
        pregnancy_related: isFemale
          ? (answers.B.pregnancy_related ?? "Not applicable")
          : "Not applicable",
        adult_acne_oily_skin: answers.B.adult_acne_oily_skin ?? false,
        excess_body_facial_hair: answers.B.excess_body_facial_hair ?? false,
      },
      C: {
        past_6_months: answers.C.past_6_months ?? [],
        habits: coerceHabits(answers.C.habits ?? {}),
      },
      D: {
        products: (answers.D.products ?? []).map(coerceProductRow),
        procedures: (answers.D.procedures ?? []).map(coerceProcedureRow),
        past_treatment_side_effects:
          answers.D.past_treatment_side_effects ?? false,
        describe: answers.D.past_treatment_side_effects
          ? (answers.D.describe ?? null)
          : null,
      },
      E: {
        sample_type: answers.E.sample_type ?? "Either",
        consent: answers.E.consent ?? false,
      },
    },
  };
}
