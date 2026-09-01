import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TextInput } from "@/components/inputs/TextInput";

describe("TextInput", () => {
  it("typing fires onChange with the current value", async () => {
    const onChange = vi.fn();
    render(<TextInput value="" onChange={onChange} />);
    await userEvent.type(screen.getByRole("textbox"), "hi");
    expect(onChange).toHaveBeenCalled();
  });

  it("does not render a mic button when onVoiceRequest is not provided", () => {
    render(<TextInput value="" onChange={() => {}} />);
    expect(
      screen.queryByLabelText("Speak your answer")
    ).not.toBeInTheDocument();
  });

  it("renders a mic button when onVoiceRequest is provided, and calls it on click", async () => {
    const onVoiceRequest = vi.fn();
    render(
      <TextInput value="" onChange={() => {}} onVoiceRequest={onVoiceRequest} />
    );
    const mic = screen.getByLabelText("Speak your answer");
    expect(mic).toBeInTheDocument();
    await userEvent.click(mic);
    expect(onVoiceRequest).toHaveBeenCalled();
  });

  it("renders a textarea in multiline mode", () => {
    render(<TextInput value="" onChange={() => {}} multiline />);
    expect(screen.getByRole("textbox").tagName).toBe("TEXTAREA");
  });
});
