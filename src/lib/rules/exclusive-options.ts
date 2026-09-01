// Multi-select exclusivity: some options are mutually exclusive with every other
// option in the same question ("No known family history" vs the other family_history
// options; "None" vs the other diagnosed_conditions options). Declared per-question
// here, not hardcoded inside any UI component.
export const EXCLUSIVE_OPTIONS: Record<string, string[]> = {
  family_history: ["No known family history"],
  diagnosed_conditions: ["None"],
};

/**
 * Applies one tap to a multi-select's current selection, honoring exclusivity:
 * - Tapping an exclusive option replaces the whole selection with just that option
 *   (tapping it again when it's the only thing selected clears it).
 * - Tapping a normal option while an exclusive option is active drops the exclusive
 *   option and selects only the new one.
 * - Otherwise, a plain toggle (add if absent, remove if present).
 */
export function applyExclusiveSelection(
  questionKey: string,
  currentSelection: string[],
  justTapped: string
): string[] {
  const exclusiveOptions = EXCLUSIVE_OPTIONS[questionKey] ?? [];

  if (exclusiveOptions.includes(justTapped)) {
    const isOnlySelected =
      currentSelection.length === 1 && currentSelection[0] === justTapped;
    return isOnlySelected ? [] : [justTapped];
  }

  const hasExclusiveSelected = currentSelection.some((option) =>
    exclusiveOptions.includes(option)
  );
  if (hasExclusiveSelected) {
    return [justTapped];
  }

  return currentSelection.includes(justTapped)
    ? currentSelection.filter((option) => option !== justTapped)
    : [...currentSelection, justTapped];
}
