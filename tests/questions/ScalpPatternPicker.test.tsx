import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScalpPatternPicker } from "@/components/questions/ScalpPatternPicker";

describe("ScalpPatternPicker", () => {
  it("clicking a spatial region toggles it into the value", async () => {
    const onChange = vi.fn();
    render(<ScalpPatternPicker value={[]} onChange={onChange} />);
    await userEvent.click(
      screen.getByLabelText("Thinning at crown — back of scalp")
    );
    expect(onChange).toHaveBeenCalledWith(["Thinning at crown"]);
  });

  it("clicking an already-selected region deselects it", async () => {
    const onChange = vi.fn();
    render(
      <ScalpPatternPicker value={["Thinning at crown"]} onChange={onChange} />
    );
    await userEvent.click(
      screen.getByLabelText("Thinning at crown — back of scalp")
    );
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("the non-spatial shedding option is reachable via its own chip", async () => {
    const onChange = vi.fn();
    render(
      <ScalpPatternPicker value={["Thinning at crown"]} onChange={onChange} />
    );
    await userEvent.click(
      screen.getByRole("checkbox", { name: "Sudden excessive shedding" })
    );
    expect(onChange).toHaveBeenCalledWith([
      "Thinning at crown",
      "Sudden excessive shedding",
    ]);
  });

  it("all 6 schema options are reachable: 5 spatial regions + 1 standalone chip", () => {
    render(<ScalpPatternPicker value={[]} onChange={() => {}} />);
    expect(
      screen.getByLabelText("Receding hairline — front")
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Thinning at crown — back of scalp")
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Widening part line — center")
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Diffuse thinning — overall scalp")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Patchy loss")).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: "Sudden excessive shedding" })
    ).toBeInTheDocument();
  });

  it("multiple regions can be active at once, matching a plain multi-select's value shape", async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <ScalpPatternPicker value={[]} onChange={onChange} />
    );
    await userEvent.click(screen.getByLabelText("Receding hairline — front"));
    rerender(
      <ScalpPatternPicker value={["Receding hairline"]} onChange={onChange} />
    );
    await userEvent.click(
      screen.getByLabelText("Thinning at crown — back of scalp")
    );
    expect(onChange).toHaveBeenLastCalledWith([
      "Receding hairline",
      "Thinning at crown",
    ]);
  });

  it("always shows a readable text summary of the current selection", () => {
    render(
      <ScalpPatternPicker
        value={["Receding hairline", "Thinning at crown"]}
        onChange={() => {}}
      />
    );
    expect(
      screen.getByText("Selected: Receding hairline, Thinning at crown")
    ).toBeInTheDocument();
  });
});
