import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NumberInput } from "@/components/inputs/NumberInput";

describe("NumberInput", () => {
  it("stepper buttons increment/decrement by 1", async () => {
    const onChange = vi.fn();
    render(<NumberInput value={25} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText("Increase"));
    expect(onChange).toHaveBeenCalledWith(26);

    await userEvent.click(screen.getByLabelText("Decrease"));
    expect(onChange).toHaveBeenCalledWith(24);
  });

  it("clamps the increment at max", async () => {
    const onChange = vi.fn();
    render(<NumberInput value={100} onChange={onChange} max={100} />);
    await userEvent.click(screen.getByLabelText("Increase"));
    expect(onChange).toHaveBeenCalledWith(100);
  });

  it("clamps the decrement at min", async () => {
    const onChange = vi.fn();
    render(<NumberInput value={1} onChange={onChange} min={1} />);
    await userEvent.click(screen.getByLabelText("Decrease"));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it("clamps direct keyboard entry outside bounds", () => {
    const onChange = vi.fn();
    render(<NumberInput value={50} onChange={onChange} min={5} max={90} />);
    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "500" } });
    expect(onChange).toHaveBeenLastCalledWith(90);
  });
});
