import { describe, it, expect } from "vitest";
import { createIntakeStore } from "@/lib/engine/store";
import { assembleOutput, validateOutput } from "@/lib/engine";
import {
  ALL_PRODUCTS_DECLINED,
  ALL_PROCEDURES_DECLINED,
  HABITS_ALL_NO,
} from "./fixtures";

describe("persona: female, regular cycle, not pregnant", () => {
  it("captures Q6/Q7 correctly and produces a complete output", () => {
    const useStore = createIntakeStore();
    const s = useStore.getState();

    s.setProfile({ name: "Priya Nair", age: 26, sex: "Female" });

    s.answer({ section: "A", questionKey: "age_hair_loss_began" }, 24);
    s.answer({ section: "A", questionKey: "duration" }, "6-12 months");
    s.toggleMultiOption(
      { section: "A", questionKey: "family_history" },
      "Mother had hair loss"
    );
    s.toggleMultiOption(
      { section: "A", questionKey: "pattern" },
      "Diffuse thinning"
    );

    s.toggleMultiOption(
      { section: "B", questionKey: "diagnosed_conditions" },
      "None"
    );
    s.answer({ section: "B", questionKey: "menstrual_cycle" }, "Regular");
    s.answer(
      { section: "B", questionKey: "pregnancy_related" },
      "Not applicable"
    );
    s.answer({ section: "B", questionKey: "adult_acne_oily_skin" }, false);
    s.answer({ section: "B", questionKey: "excess_body_facial_hair" }, false);

    s.answer({ section: "C", questionKey: "past_6_months" }, []);
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

    s.answer({ section: "E", questionKey: "sample_type" }, "Blood");
    s.answer({ section: "E", questionKey: "consent" }, true);

    const final = useStore.getState();
    expect(validateOutput(final.profile, final.answers).valid).toBe(true);

    const output = assembleOutput(final.profile!, final.answers);
    expect(output.sections.B.menstrual_cycle).toBe("Regular");
    expect(output.sections.B.pregnancy_related).toBe("Not applicable");
    expect(output.sections.D.products).toEqual(ALL_PRODUCTS_DECLINED);
    expect(output.sections.E.sample_type).toBe("Blood");
  });
});
