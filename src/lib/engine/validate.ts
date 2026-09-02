import type { Answers, PatientProfile } from "@/lib/schema/types";
import { getVisibleSteps, ONBOARDING_STEP, type StepId } from "./steps";
import { isStepAnswered } from "./completeness";

export interface ValidationResult {
  valid: boolean;
  missingSteps: StepId[];
}

/**
 * A required step being unanswered makes the output invalid. An explicit
 * `consent: false` is NOT a missing answer — declining is a complete, valid
 * response (see GR-013); only a step nobody has touched at all is "missing".
 */
export function validateOutput(
  profile: PatientProfile | null,
  answers: Answers
): ValidationResult {
  if (!profile) {
    return { valid: false, missingSteps: [ONBOARDING_STEP] };
  }

  const steps = getVisibleSteps(profile, answers);
  const missingSteps = steps.filter(
    (step) => step.section !== "onboarding" && !isStepAnswered(step, answers)
  );

  return { valid: missingSteps.length === 0, missingSteps };
}
