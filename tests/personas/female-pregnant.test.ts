import { describe, it, expect } from "vitest";
import { createIntakeStore } from "@/lib/engine/store";
import { assembleOutput, validateOutput } from "@/lib/engine";
import {
  ALL_PRODUCTS_DECLINED,
  ALL_PROCEDURES_DECLINED,
  HABITS_ALL_NO,
} from "./fixtures";

describe("persona: female, currently pregnant", () => {
  it("flows pregnancy_related through correctly alongside realistic hormonal symptoms", () => {
    const useStore = createIntakeStore();
    const s = useStore.getState();

    s.setProfile({ name: "Ananya Iyer", age: 29, sex: "Female" });

    s.answer({ section: "A", questionKey: "age_hair_loss_began" }, 29);
    s.answer({ section: "A", questionKey: "duration" }, "Less than 6 months");
    s.toggleMultiOption(
      { section: "A", questionKey: "family_history" },
      "No known family history"
    );
    s.toggleMultiOption(
      { section: "A", questionKey: "pattern" },
      "Sudden excessive shedding"
    );

    s.toggleMultiOption(
      { section: "B", questionKey: "diagnosed_conditions" },
      "Anemia"
    );
    s.answer({ section: "B", questionKey: "menstrual_cycle" }, "Irregular");
    s.answer(
      { section: "B", questionKey: "pregnancy_related" },
      "Currently pregnant"
    );
    s.answer({ section: "B", questionKey: "adult_acne_oily_skin" }, true);
    s.answer({ section: "B", questionKey: "excess_body_facial_hair" }, false);

    s.toggleMultiOption(
      { section: "C", questionKey: "past_6_months" },
      "High stress or emotional trauma"
    );
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
    expect(validateOutput(final.profile, final.answers).valid).toBe(true);

    const output = assembleOutput(final.profile!, final.answers);
    expect(output.sections.B.pregnancy_related).toBe("Currently pregnant");
    expect(output.sections.B.menstrual_cycle).toBe("Irregular");
    expect(output.sections.A.pattern).toEqual(["Sudden excessive shedding"]);
  });
});
