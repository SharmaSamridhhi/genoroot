import { INTAKE_SCHEMA } from "@/lib/schema/intake-schema";
import type {
  Answers,
  Habits,
  PatientProfile,
  ProcedureRow,
  ProductRow,
} from "@/lib/schema/types";
import { getVisibleSteps, type StepId } from "./steps";

// Uniform completeness rule across every question type: undefined/null means
// unanswered, anything else (including false, 0, or an empty array) counts as an
// explicit, complete answer. This is what makes an explicit `consent: false` valid
// rather than a blocker (see GR-005/GR-013).
function isAnswered(value: unknown): boolean {
  return value !== undefined && value !== null;
}

function isHabitsRowComplete(habits: Partial<Habits>): boolean {
  if (!isAnswered(habits.smoking)) return false;
  if (habits.smoking && !isAnswered(habits.smoking_severity)) return false;
  if (!isAnswered(habits.alcohol)) return false;
  if (!isAnswered(habits.hard_water)) return false;
  if (!isAnswered(habits.hair_wash_frequency)) return false;
  if (!isAnswered(habits.heating_tools_styling_chemicals)) return false;
  if (!isAnswered(habits.salon_treatments)) return false;
  if (habits.salon_treatments && !isAnswered(habits.salon_treatment_detail))
    return false;
  return true;
}

function isProductRowComplete(row: Partial<ProductRow>): boolean {
  if (!isAnswered(row.used)) return false;
  if (row.used) {
    return (
      isAnswered(row.duration) &&
      isAnswered(row.helped) &&
      isAnswered(row.side_effects)
    );
  }
  return true;
}

function isProcedureRowComplete(row: Partial<ProcedureRow>): boolean {
  if (!isAnswered(row.done)) return false;
  if (row.done) {
    return isAnswered(row.sessions) && isAnswered(row.helped);
  }
  return true;
}

function getTableRowCount(questionKey: "products" | "procedures"): number {
  for (const section of INTAKE_SCHEMA.sections) {
    const question = section.questions.find((q) => q.key === questionKey);
    if (question && "rows" in question && Array.isArray(question.rows)) {
      return question.rows.length;
    }
  }
  return 0;
}

export function isStepAnswered(step: StepId, answers: Answers): boolean {
  const sectionAnswers = answers[step.section as keyof Answers] as
    Record<string, unknown> | undefined;
  if (!sectionAnswers) return false;

  if (step.subKey) {
    return isAnswered(sectionAnswers[step.subKey]);
  }

  if (step.questionKey === "habits") {
    return isHabitsRowComplete(
      (sectionAnswers.habits ?? {}) as Partial<Habits>
    );
  }
  if (step.questionKey === "products") {
    const rows = (sectionAnswers.products ?? []) as Partial<ProductRow>[];
    return (
      rows.length === getTableRowCount("products") &&
      rows.every(isProductRowComplete)
    );
  }
  if (step.questionKey === "procedures") {
    const rows = (sectionAnswers.procedures ?? []) as Partial<ProcedureRow>[];
    return (
      rows.length === getTableRowCount("procedures") &&
      rows.every(isProcedureRowComplete)
    );
  }

  return isAnswered(sectionAnswers[step.questionKey]);
}

export function isComplete(
  profile: PatientProfile | null,
  answers: Answers
): boolean {
  if (!profile) return false;
  const steps = getVisibleSteps(profile, answers);
  return steps.every(
    (s) => s.section === "onboarding" || isStepAnswered(s, answers)
  );
}

export interface Progress {
  completed: number;
  total: number;
  percent: number;
}

export function getProgress(
  profile: PatientProfile | null,
  answers: Answers
): Progress {
  const steps = getVisibleSteps(profile, answers);
  const total = steps.length;
  const completed = steps.filter((s) =>
    s.section === "onboarding" ? profile !== null : isStepAnswered(s, answers)
  ).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { completed, total, percent };
}
