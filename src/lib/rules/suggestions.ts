// Soft defaults the patient can accept with one tap or change — lower priority than
// exclusivity/auto-skip, kept intentionally small. A suggested value must never be
// treated as "answered" until the patient explicitly confirms it (that's enforced by
// the UI layer that consumes this, not here — this module only proposes values).
const SUGGESTED_DEFAULTS: Record<string, unknown> = {
  hair_wash_frequency: "Alternate Days",
};

export function getSuggestedDefault(questionKey: string): unknown | null {
  return SUGGESTED_DEFAULTS[questionKey] ?? null;
}
