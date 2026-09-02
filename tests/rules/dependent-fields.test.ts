import { describe, it, expect } from "vitest";
import {
  clearProductRowDependents,
  clearProcedureRowDependents,
  clearHabitsDependentFields,
} from "@/lib/rules";
import type { Habits, ProcedureRow, ProductRow } from "@/lib/schema/types";

describe("clearProductRowDependents", () => {
  it("flipping a product row's used from true to false nulls duration/helped/side_effects", () => {
    const row: ProductRow = {
      row: "Topical Minoxidil",
      used: false,
      duration: "3-6mo",
      helped: true,
      side_effects: false,
    };
    expect(clearProductRowDependents(row)).toEqual({
      row: "Topical Minoxidil",
      used: false,
      duration: null,
      helped: null,
      side_effects: null,
    });
  });

  it("leaves a used:true product row untouched", () => {
    const row: ProductRow = {
      row: "Topical Minoxidil",
      used: true,
      duration: "3-6mo",
      helped: true,
      side_effects: false,
    };
    expect(clearProductRowDependents(row)).toEqual(row);
  });

  it("flipping back to true does not resurrect old stale values — starts blank", () => {
    const declined: ProductRow = {
      row: "Oral Minoxidil",
      used: false,
      duration: null,
      helped: null,
      side_effects: null,
    };
    const reEnabled: ProductRow = { ...declined, used: true };
    expect(clearProductRowDependents(reEnabled)).toEqual(reEnabled);
    expect(reEnabled.duration).toBeNull();
  });

  it("regression: a row with no `used` key yet (still being filled in interactively) is never mistaken for a procedure row", () => {
    // TableCardFlow commits a row's fields one at a time — before the lead
    // field is answered, the row is just `{ row: "label" }`. This must never
    // gain a stray `sessions` key (a procedure-only field) from misdetecting
    // the row's shape.
    const barelyStarted = {
      row: "OTC/Medicated Shampoos",
    } as unknown as ProductRow;
    const result = clearProductRowDependents(barelyStarted);
    expect(result).not.toHaveProperty("sessions");
  });
});

describe("clearProcedureRowDependents", () => {
  it("flipping a procedure row's done from true to false nulls sessions/helped", () => {
    const row: ProcedureRow = {
      row: "PRP/GFC/iPRF",
      done: false,
      sessions: "4-6",
      helped: true,
    };
    expect(clearProcedureRowDependents(row)).toEqual({
      row: "PRP/GFC/iPRF",
      done: false,
      sessions: null,
      helped: null,
    });
  });

  it("regression: a row with no `done` key yet is never mistaken for a product row", () => {
    const barelyStarted = { row: "PRP/GFC/iPRF" } as unknown as ProcedureRow;
    const result = clearProcedureRowDependents(barelyStarted);
    expect(result).not.toHaveProperty("duration");
    expect(result).not.toHaveProperty("side_effects");
  });
});

describe("clearHabitsDependentFields", () => {
  const baseHabits: Habits = {
    smoking: true,
    smoking_severity: "Moderate 5-10/day",
    alcohol: false,
    hard_water: true,
    hair_wash_frequency: "Daily",
    heating_tools_styling_chemicals: false,
    salon_treatments: true,
    salon_treatment_detail: "Keratin treatment",
  };

  it("nulls smoking_severity when smoking is false", () => {
    const result = clearHabitsDependentFields({
      ...baseHabits,
      smoking: false,
    });
    expect(result.smoking_severity).toBeNull();
  });

  it("nulls salon_treatment_detail when salon_treatments is false", () => {
    const result = clearHabitsDependentFields({
      ...baseHabits,
      salon_treatments: false,
    });
    expect(result.salon_treatment_detail).toBeNull();
  });

  it("leaves both dependent fields when both triggers are true", () => {
    expect(clearHabitsDependentFields(baseHabits)).toEqual(baseHabits);
  });
});
