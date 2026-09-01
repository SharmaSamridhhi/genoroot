import { describe, it, expect } from "vitest";
import { getVisibleSteps, getNextStep, getPrevStep } from "@/lib/engine";
import { emptyAnswers } from "@/lib/engine/store";
import type { Answers, PatientProfile } from "@/lib/schema/types";

const male: PatientProfile = { age: 32, sex: "Male" };
const female: PatientProfile = { age: 28, sex: "Female" };

function stepKeys(steps: { questionKey: string; subKey?: string }[]) {
  return steps.map((s) => s.subKey ?? s.questionKey);
}

describe("getVisibleSteps", () => {
  it("returns onboarding first, then all 16 questions in order for a male patient, minus Q6/Q7", () => {
    const steps = getVisibleSteps(male, emptyAnswers());
    expect(steps[0]).toEqual({ section: "onboarding", questionKey: "profile" });
    expect(stepKeys(steps)).not.toContain("menstrual_cycle");
    expect(stepKeys(steps)).not.toContain("pregnancy_related");
    expect(stepKeys(steps)).toEqual([
      "profile",
      "age_hair_loss_began",
      "duration",
      "family_history",
      "pattern",
      "diagnosed_conditions",
      "adult_acne_oily_skin",
      "excess_body_facial_hair",
      "past_6_months",
      "habits",
      "products",
      "procedures",
      "past_treatment_side_effects",
      "sample_type",
      "consent",
    ]);
  });

  it("includes menstrual_cycle and pregnancy_related for a female patient", () => {
    const steps = getVisibleSteps(female, emptyAnswers());
    expect(stepKeys(steps)).toContain("menstrual_cycle");
    expect(stepKeys(steps)).toContain("pregnancy_related");
  });

  it("treats 'Prefer not to say' like Male for gating purposes", () => {
    const steps = getVisibleSteps(
      { age: 40, sex: "Prefer not to say" },
      emptyAnswers()
    );
    expect(stepKeys(steps)).not.toContain("menstrual_cycle");
    expect(stepKeys(steps)).not.toContain("pregnancy_related");
  });

  it("no steps at all before onboarding is done (profile is null)", () => {
    const steps = getVisibleSteps(null, emptyAnswers());
    expect(steps).toHaveLength(16 - 2 + 1); // 16 questions minus Q6/Q7, plus onboarding
    expect(stepKeys(steps)).not.toContain("menstrual_cycle");
  });

  it("reveals the `describe` followup only after past_treatment_side_effects is answered true", () => {
    const notYet = getVisibleSteps(male, emptyAnswers());
    expect(stepKeys(notYet)).not.toContain("describe");

    const answers: Answers = {
      ...emptyAnswers(),
      D: { ...emptyAnswers().D, past_treatment_side_effects: true },
    };
    const withFollowup = getVisibleSteps(male, answers);
    expect(stepKeys(withFollowup)).toContain("describe");
  });

  it("does not reveal describe when past_treatment_side_effects is explicitly false", () => {
    const answers: Answers = {
      ...emptyAnswers(),
      D: { ...emptyAnswers().D, past_treatment_side_effects: false },
    };
    const steps = getVisibleSteps(male, answers);
    expect(stepKeys(steps)).not.toContain("describe");
  });
});

describe("getNextStep / getPrevStep", () => {
  it("back-navigating from Q8 for a male patient goes to Q5, skipping hidden Q6/Q7", () => {
    const answers = emptyAnswers();
    const q8: { section: "B"; questionKey: string } = {
      section: "B",
      questionKey: "adult_acne_oily_skin",
    };
    const prev = getPrevStep(q8, male, answers);
    expect(prev).toEqual({ section: "B", questionKey: "diagnosed_conditions" });
  });

  it("next-navigating from Q5 for a female patient goes to Q6 (menstrual_cycle)", () => {
    const answers = emptyAnswers();
    const q5 = { section: "B" as const, questionKey: "diagnosed_conditions" };
    const next = getNextStep(q5, female, answers);
    expect(next).toEqual({ section: "B", questionKey: "menstrual_cycle" });
  });

  it("next-navigating from Q5 for a male patient skips straight to Q8", () => {
    const answers = emptyAnswers();
    const q5 = { section: "B" as const, questionKey: "diagnosed_conditions" };
    const next = getNextStep(q5, male, answers);
    expect(next).toEqual({ section: "B", questionKey: "adult_acne_oily_skin" });
  });

  it("returns null past the last step (consent)", () => {
    const answers = emptyAnswers();
    const consent = { section: "E" as const, questionKey: "consent" };
    expect(getNextStep(consent, male, answers)).toBeNull();
  });

  it("returns null before the first step (onboarding)", () => {
    const onboarding = {
      section: "onboarding" as const,
      questionKey: "profile",
    };
    expect(getPrevStep(onboarding, male, emptyAnswers())).toBeNull();
  });
});
