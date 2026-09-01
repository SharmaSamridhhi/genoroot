import type { Habits, ProductRow, ProcedureRow } from "@/lib/schema/types";

/**
 * Generic auto-skip primitive: when `triggerKey` on `obj` is falsy, null out every
 * key listed in `dependentKeys` rather than leaving stale values from a prior
 * true state around. No-op when the trigger is truthy.
 */
export function clearIfFalse<T extends object>(
  obj: T,
  triggerKey: keyof T,
  dependentKeys: (keyof T)[]
): T {
  if (obj[triggerKey]) return obj;
  const result = { ...obj };
  for (const key of dependentKeys) {
    (result as Record<string, unknown>)[key as string] = null;
  }
  return result;
}

export function clearDependentFields(row: ProductRow): ProductRow;
export function clearDependentFields(row: ProcedureRow): ProcedureRow;
export function clearDependentFields(
  row: ProductRow | ProcedureRow
): ProductRow | ProcedureRow {
  if ("used" in row) {
    return clearIfFalse(row, "used", ["duration", "helped", "side_effects"]);
  }
  return clearIfFalse(row, "done", ["sessions", "helped"]);
}

export function clearHabitsDependentFields(habits: Habits): Habits {
  const afterSmoking = clearIfFalse(habits, "smoking", ["smoking_severity"]);
  return clearIfFalse(afterSmoking, "salon_treatments", [
    "salon_treatment_detail",
  ]);
}
