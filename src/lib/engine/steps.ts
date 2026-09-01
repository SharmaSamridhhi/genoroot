import { INTAKE_SCHEMA } from "@/lib/schema/intake-schema";
import type { Answers, PatientProfile } from "@/lib/schema/types";

export interface StepId {
  section: "onboarding" | "A" | "B" | "C" | "D" | "E";
  questionKey: string;
  subKey?: string;
}

export function stepEquals(a: StepId, b: StepId): boolean {
  return (
    a.section === b.section &&
    a.questionKey === b.questionKey &&
    a.subKey === b.subKey
  );
}

function isFemale(profile: PatientProfile | null): boolean {
  return profile?.sex === "Female";
}

/**
 * The ordered list of steps this specific patient will see, given their profile
 * and answers so far. A table question (habits/products/procedures) is a single
 * step here — the row-by-row micro-flow inside it is a UI concern (GR-010), not
 * something this engine enumerates separately.
 *
 * Branching encoded here:
 * - Onboarding always first.
 * - femaleOnly questions (menstrual_cycle, pregnancy_related) only for profile.sex === "Female".
 * - A top-level question's `followup` (only Q14 -> describe today) is visible only
 *   once that question's own answer is explicitly `true`.
 */
export function getVisibleSteps(
  profile: PatientProfile | null,
  answers: Answers
): StepId[] {
  const steps: StepId[] = [{ section: "onboarding", questionKey: "profile" }];

  for (const section of INTAKE_SCHEMA.sections) {
    for (const question of section.questions) {
      if (
        "femaleOnly" in question &&
        question.femaleOnly &&
        !isFemale(profile)
      ) {
        continue;
      }

      steps.push({ section: section.id, questionKey: question.key });

      if ("followup" in question && question.followup) {
        const sectionAnswers = answers[section.id] as Record<string, unknown>;
        const triggerValue = sectionAnswers?.[question.key];
        if (triggerValue === true) {
          steps.push({
            section: section.id,
            questionKey: question.key,
            subKey: question.followup.key,
          });
        }
      }
    }
  }

  return steps;
}

export function getNextStep(
  current: StepId,
  profile: PatientProfile | null,
  answers: Answers
): StepId | null {
  const steps = getVisibleSteps(profile, answers);
  const idx = steps.findIndex((s) => stepEquals(s, current));
  if (idx === -1 || idx === steps.length - 1) return null;
  return steps[idx + 1];
}

export function getPrevStep(
  current: StepId,
  profile: PatientProfile | null,
  answers: Answers
): StepId | null {
  const steps = getVisibleSteps(profile, answers);
  const idx = steps.findIndex((s) => stepEquals(s, current));
  if (idx <= 0) return null;
  return steps[idx - 1];
}
