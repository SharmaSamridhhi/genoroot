import { describe, it, expect } from "vitest";
import { createIntakeStore } from "@/lib/engine/store";
import { assembleOutput, validateOutput } from "@/lib/engine";
import { ALL_PRODUCTS_DECLINED, ALL_PROCEDURES_DECLINED } from "./fixtures";

describe("persona: female, menopausal, with PCOS/PCOD", () => {
  it("exercises the diagnosed_conditions multi-select plus a Menopausal cycle answer", () => {
    const useStore = createIntakeStore();
    const s = useStore.getState();

    s.setProfile({ name: "Lakshmi Menon", age: 52, sex: "Female" });

    s.answer({ section: "A", questionKey: "age_hair_loss_began" }, 48);
    s.answer({ section: "A", questionKey: "duration" }, "Over a year");
    s.toggleMultiOption(
      { section: "A", questionKey: "family_history" },
      "Mother had hair loss"
    );
    s.toggleMultiOption(
      { section: "A", questionKey: "family_history" },
      "Siblings with thinning or baldness"
    );
    s.toggleMultiOption(
      { section: "A", questionKey: "pattern" },
      "Widening part line"
    );

    s.toggleMultiOption(
      { section: "B", questionKey: "diagnosed_conditions" },
      "PCOS/PCOD"
    );
    s.toggleMultiOption(
      { section: "B", questionKey: "diagnosed_conditions" },
      "Thyroid disorder"
    );
    s.answer({ section: "B", questionKey: "menstrual_cycle" }, "Menopausal");
    s.answer(
      { section: "B", questionKey: "pregnancy_related" },
      "Not applicable"
    );
    s.answer({ section: "B", questionKey: "adult_acne_oily_skin" }, true);
    s.answer({ section: "B", questionKey: "excess_body_facial_hair" }, true);

    s.answer({ section: "C", questionKey: "past_6_months" }, []);
    s.answer(
      { section: "C", questionKey: "habits" },
      {
        smoking: false,
        smoking_severity: null,
        alcohol: false,
        hard_water: false,
        hair_wash_frequency: "Alternate Days",
        heating_tools_styling_chemicals: true,
        salon_treatments: true,
        salon_treatment_detail: "Keratin smoothening, twice a year",
      }
    );

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
    expect(output.sections.B.diagnosed_conditions).toEqual([
      "PCOS/PCOD",
      "Thyroid disorder",
    ]);
    expect(output.sections.B.menstrual_cycle).toBe("Menopausal");
    expect(output.sections.C.habits.salon_treatment_detail).toBe(
      "Keratin smoothening, twice a year"
    );
  });
});
