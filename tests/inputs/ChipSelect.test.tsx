import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChipSelect } from "@/components/inputs/ChipSelect";

describe("ChipSelect", () => {
  it("single mode: clicking an option calls onChange with that option", async () => {
    const onChange = vi.fn();
    render(
      <ChipSelect
        questionKey="duration"
        options={["Less than 6 months", "6-12 months", "Over a year"]}
        mode="single"
        value={null}
        onChange={onChange}
      />
    );
    await userEvent.click(screen.getByText("6-12 months"));
    expect(onChange).toHaveBeenCalledWith("6-12 months");
  });

  it("multi mode: plain toggle when no exclusive option is involved", async () => {
    const onChange = vi.fn();
    render(
      <ChipSelect
        questionKey="pattern"
        options={["Receding hairline", "Thinning at crown"]}
        mode="multi"
        value={["Receding hairline"]}
        onChange={onChange}
      />
    );
    await userEvent.click(screen.getByText("Thinning at crown"));
    expect(onChange).toHaveBeenCalledWith([
      "Receding hairline",
      "Thinning at crown",
    ]);
  });

  it("multi mode: selecting an exclusive option clears the rest (GR-004 wiring)", async () => {
    const onChange = vi.fn();
    render(
      <ChipSelect
        questionKey="diagnosed_conditions"
        options={["PCOS/PCOD", "Thyroid disorder", "None"]}
        mode="multi"
        value={["PCOS/PCOD", "Thyroid disorder"]}
        onChange={onChange}
      />
    );
    await userEvent.click(screen.getByText("None"));
    expect(onChange).toHaveBeenCalledWith(["None"]);
  });

  it("marks the currently selected chip with aria-checked", () => {
    render(
      <ChipSelect
        questionKey="sample_type"
        options={["Saliva", "Blood", "Either"]}
        mode="single"
        value="Blood"
        onChange={() => {}}
      />
    );
    expect(screen.getByText("Blood")).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("Saliva")).toHaveAttribute("aria-checked", "false");
  });
});
