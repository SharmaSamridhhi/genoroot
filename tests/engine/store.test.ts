import { describe, it, expect } from "vitest";
import { createIntakeStore } from "@/lib/engine/store";

describe("intake store", () => {
  it("answer() writes a simple value into the right section/key", () => {
    const useStore = createIntakeStore();
    useStore
      .getState()
      .answer({ section: "A", questionKey: "age_hair_loss_began" }, 25);
    expect(useStore.getState().answers.A.age_hair_loss_began).toBe(25);
  });

  it("toggleMultiOption() applies GR-004's exclusive-selection rule, not a plain toggle", () => {
    const useStore = createIntakeStore();
    const step = { section: "A" as const, questionKey: "family_history" };
    useStore.getState().toggleMultiOption(step, "Father had hair loss");
    useStore.getState().toggleMultiOption(step, "No known family history");
    expect(useStore.getState().answers.A.family_history).toEqual([
      "No known family history",
    ]);
  });

  it("answer() on habits auto-nulls smoking_severity when smoking flips false", () => {
    const useStore = createIntakeStore();
    const step = { section: "C" as const, questionKey: "habits" };
    useStore.getState().answer(step, {
      smoking: true,
      smoking_severity: "Mild <5/day",
      alcohol: false,
      hard_water: false,
      hair_wash_frequency: "Daily",
      heating_tools_styling_chemicals: false,
      salon_treatments: false,
      salon_treatment_detail: null,
    });
    expect(useStore.getState().answers.C.habits.smoking_severity).toBe(
      "Mild <5/day"
    );

    useStore.getState().answer(step, {
      ...useStore.getState().answers.C.habits,
      smoking: false,
    });
    expect(useStore.getState().answers.C.habits.smoking_severity).toBeNull();
  });

  it("answer() on products auto-nulls a row's dependent fields when used flips false", () => {
    const useStore = createIntakeStore();
    const step = { section: "D" as const, questionKey: "products" };
    useStore.getState().answer(step, [
      {
        row: "Topical Minoxidil",
        used: true,
        duration: "3-6mo",
        helped: true,
        side_effects: false,
      },
    ]);
    expect(useStore.getState().answers.D.products[0].duration).toBe("3-6mo");

    useStore
      .getState()
      .answer(step, [
        { ...useStore.getState().answers.D.products[0], used: false },
      ]);
    expect(useStore.getState().answers.D.products[0].duration).toBeNull();
  });

  it("next()/back() move along the branch-aware step list and stay put at the boundaries", () => {
    const useStore = createIntakeStore();
    useStore.getState().setProfile({ age: 32, sex: "Male" });
    expect(useStore.getState().currentStep).toEqual({
      section: "onboarding",
      questionKey: "profile",
    });

    useStore.getState().next();
    expect(useStore.getState().currentStep).toEqual({
      section: "A",
      questionKey: "age_hair_loss_began",
    });

    useStore.getState().back();
    expect(useStore.getState().currentStep).toEqual({
      section: "onboarding",
      questionKey: "profile",
    });

    // back() at the first step is a no-op, not a crash
    useStore.getState().back();
    expect(useStore.getState().currentStep).toEqual({
      section: "onboarding",
      questionKey: "profile",
    });
  });

  it("reset() clears profile, answers, and currentStep back to onboarding", () => {
    const useStore = createIntakeStore();
    useStore.getState().setProfile({ age: 32, sex: "Male" });
    useStore
      .getState()
      .answer({ section: "A", questionKey: "age_hair_loss_began" }, 25);
    useStore.getState().reset();

    expect(useStore.getState().profile).toBeNull();
    expect(useStore.getState().answers.A.age_hair_loss_began).toBeUndefined();
    expect(useStore.getState().currentStep).toEqual({
      section: "onboarding",
      questionKey: "profile",
    });
  });
});
