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

// Two explicit functions rather than one overload that guesses the row's shape
// from its own keys (e.g. `"used" in row`) — that heuristic breaks for a row
// still being filled in interactively (TableCardFlow commits partial row
// objects field-by-field), where an unanswered product row has no `used` key
// yet and would be misdetected as a procedure row, injecting a stray
// `sessions` field. The call site always knows which table it's in, so it
// should say so rather than have this function infer it.
export function clearProductRowDependents(row: ProductRow): ProductRow {
  return clearIfFalse(row, "used", ["duration", "helped", "side_effects"]);
}

export function clearProcedureRowDependents(row: ProcedureRow): ProcedureRow {
  return clearIfFalse(row, "done", ["sessions", "helped"]);
}

export function clearHabitsDependentFields(habits: Habits): Habits {
  const afterSmoking = clearIfFalse(habits, "smoking", ["smoking_severity"]);
  return clearIfFalse(afterSmoking, "salon_treatments", [
    "salon_treatment_detail",
  ]);
}
