import { describe, it, expect } from "vitest";
import { createIntakeStore } from "@/lib/engine/store";
import { assembleOutput, validateOutput } from "@/lib/engine";
import {
  ALL_PRODUCTS_DECLINED,
  ALL_PROCEDURES_DECLINED,
  HABITS_ALL_NO,
} from "./fixtures";

describe("persona: every gating question answered No — proves the auto-skip path", () => {
  it("produces a fully-null-but-complete, valid output with zero dangling dependent fields", () => {
    const useStore = createIntakeStore();
    const s = useStore.getState();

    s.setProfile({ age: 30, sex: "Male" });

    s.answer({ section: "A", questionKey: "age_hair_loss_began" }, 30);
    s.answer({ section: "A", questionKey: "duration" }, "Less than 6 months");
    s.toggleMultiOption(
      { section: "A", questionKey: "family_history" },
      "No known family history"
    );
    s.toggleMultiOption(
      { section: "A", questionKey: "pattern" },
      "Diffuse thinning"
    );

    s.toggleMultiOption(
      { section: "B", questionKey: "diagnosed_conditions" },
      "None"
    );
    s.answer({ section: "B", questionKey: "adult_acne_oily_skin" }, false);
    s.answer({ section: "B", questionKey: "excess_body_facial_hair" }, false);

    s.answer({ section: "C", questionKey: "past_6_months" }, []);
    // smoking:false and salon_treatments:false here — this is the row-level auto-skip
    // this persona exists to prove (GR-004's clearDependentFields via the store).
    s.answer({ section: "C", questionKey: "habits" }, HABITS_ALL_NO);

    s.answer({ section: "D", questionKey: "products" }, ALL_PRODUCTS_DECLINED);
    s.answer(
      { section: "D", questionKey: "procedures" },
      ALL_PROCEDURES_DECLINED
    );
    s.answer(
      { section: "D", questionKey: "past_treatment_side_effects" },
      false
    );

    s.answer({ section: "E", questionKey: "sample_type" }, "Either");
    s.answer({ section: "E", questionKey: "consent" }, true);

    const final = useStore.getState();
    const validation = validateOutput(final.profile, final.answers);
    expect(validation.valid).toBe(true);

    const output = assembleOutput(final.profile!, final.answers);

    // Every gated dependent field is null (present, never undefined/missing).
    expect(output.sections.C.habits.smoking_severity).toBeNull();
    expect(output.sections.C.habits.salon_treatment_detail).toBeNull();
    expect(output.sections.D.describe).toBeNull();
    for (const row of output.sections.D.products) {
      expect(row.duration).toBeNull();
      expect(row.helped).toBeNull();
      expect(row.side_effects).toBeNull();
    }
    for (const row of output.sections.D.procedures) {
      expect(row.sessions).toBeNull();
      expect(row.helped).toBeNull();
    }

    // And still every key is present — "null" not "missing".
    expect(Object.keys(output.sections.C.habits)).toContain("smoking_severity");
    expect(Object.keys(output.sections.D)).toContain("describe");
  });
});
