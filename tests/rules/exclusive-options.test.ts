import { describe, it, expect } from "vitest";
import { applyExclusiveSelection } from "@/lib/rules";

describe("applyExclusiveSelection", () => {
  it("selecting an exclusive option replaces the whole selection", () => {
    const result = applyExclusiveSelection(
      "family_history",
      ["Father had hair loss"],
      "No known family history"
    );
    expect(result).toEqual(["No known family history"]);
  });

  it("selecting a normal option after an exclusive one was active drops the exclusive option", () => {
    const result = applyExclusiveSelection(
      "family_history",
      ["No known family history"],
      "Father had hair loss"
    );
    expect(result).toEqual(["Father had hair loss"]);
  });

  it("tapping the exclusive option again when it's the only selection clears it", () => {
    const result = applyExclusiveSelection(
      "diagnosed_conditions",
      ["None"],
      "None"
    );
    expect(result).toEqual([]);
  });

  it("plain toggle when no exclusive option is involved", () => {
    const selected = applyExclusiveSelection(
      "pattern",
      ["Receding hairline"],
      "Thinning at crown"
    );
    expect(selected).toEqual(["Receding hairline", "Thinning at crown"]);

    const deselected = applyExclusiveSelection(
      "pattern",
      selected,
      "Receding hairline"
    );
    expect(deselected).toEqual(["Thinning at crown"]);
  });

  it("a question with no declared exclusive options behaves as a plain multi-select", () => {
    const result = applyExclusiveSelection(
      "past_6_months",
      [],
      "Recent surgery"
    );
    expect(result).toEqual(["Recent surgery"]);
  });
});
