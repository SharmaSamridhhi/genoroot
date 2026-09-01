import { describe, it, expect } from "vitest";
import { createIntakeStore } from "@/lib/engine/store";
import { assembleOutput, validateOutput } from "@/lib/engine";
import {
  ALL_PRODUCTS_DECLINED,
  ALL_PROCEDURES_DECLINED,
  HABITS_ALL_NO,
} from "./fixtures";

describe("persona: otherwise fully answered, consent declined", () => {
  it("is still a VALID output — declining is a complete answer, not a blocker", () => {
    const useStore = createIntakeStore();
    const s = useStore.getState();

    s.setProfile({ name: "Vikram Rao", age: 41, sex: "Male" });

    s.answer({ section: "A", questionKey: "age_hair_loss_began" }, 38);
    s.answer({ section: "A", questionKey: "duration" }, "Over a year");
    s.toggleMultiOption(
      { section: "A", questionKey: "family_history" },
      "No known family history"
    );
    s.toggleMultiOption(
      { section: "A", questionKey: "pattern" },
      "Thinning at crown"
    );

    s.toggleMultiOption(
      { section: "B", questionKey: "diagnosed_conditions" },
      "None"
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

    s.answer({ section: "E", questionKey: "sample_type" }, "Saliva");
    s.answer({ section: "E", questionKey: "consent" }, false); // <-- the point of this persona

    const final = useStore.getState();
    const validation = validateOutput(final.profile, final.answers);
    expect(validation.valid).toBe(true);
    expect(validation.missingSteps).toEqual([]);

    const output = assembleOutput(final.profile!, final.answers);
    expect(output.sections.E.consent).toBe(false);
  });
});
