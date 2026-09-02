import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConsentScreen } from "@/components/questions/ConsentScreen";

describe("ConsentScreen", () => {
  it("neither option is pre-selected on load", () => {
    render(<ConsentScreen value={null} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "I agree" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
    expect(
      screen.getByRole("button", { name: "I do not agree" })
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("clicking 'I agree' reports true", async () => {
    const onChange = vi.fn();
    render(<ConsentScreen value={null} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "I agree" }));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("clicking 'I do not agree' reports false — a real, complete answer, not a dead end", async () => {
    const onChange = vi.fn();
    render(<ConsentScreen value={null} onChange={onChange} />);
    await userEvent.click(
      screen.getByRole("button", { name: "I do not agree" })
    );
    expect(onChange).toHaveBeenCalledWith(false);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("both choices remain clickable and neither is disabled after the other is chosen", () => {
    render(<ConsentScreen value={false} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "I agree" })).not.toBeDisabled();
    expect(
      screen.getByRole("button", { name: "I do not agree" })
    ).not.toBeDisabled();
  });
});
