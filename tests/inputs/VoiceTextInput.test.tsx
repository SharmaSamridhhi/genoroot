import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VoiceTextInput } from "@/components/inputs/VoiceTextInput";
import { useVoiceInput } from "@/lib/voice/useVoiceInput";
import { interpretTranscript } from "@/lib/voice/interpretTranscript";

vi.mock("@/lib/voice/useVoiceInput");
vi.mock("@/lib/voice/interpretTranscript");

// isListening has to actually flip to false once stop() is called — the
// component re-invokes useVoiceInput() on every render, and VoiceTextInput
// only shows the confirm-suggestion box once !isListening, so a static
// mockReturnValue (stuck at isListening: true forever) would hide it.
function mockListening(transcript: string) {
  const state = { isListening: true };
  const stop = vi.fn(() => {
    state.isListening = false;
  });
  vi.mocked(useVoiceInput).mockImplementation(() => ({
    isSupported: true,
    isListening: state.isListening,
    transcript,
    error: null,
    level: 0,
    start: vi.fn(),
    stop,
  }));
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("VoiceTextInput", () => {
  it("fills the field directly on a high-confidence transcript — no confirm tap needed", async () => {
    const onChange = vi.fn();
    mockListening("keratin treatment last spring");
    vi.mocked(interpretTranscript).mockResolvedValue({
      suggestedText: "Keratin treatment, last spring",
      confidence: "high",
    });

    render(<VoiceTextInput value="" onChange={onChange} />);

    await userEvent.click(
      screen.getByRole("button", { name: "Stop recording" })
    );

    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith("Keratin treatment, last spring")
    );
    expect(screen.queryByText("Use this")).not.toBeInTheDocument();
  });

  it("asks for explicit confirmation on a low-confidence transcript", async () => {
    const onChange = vi.fn();
    mockListening("mumble mumble");
    vi.mocked(interpretTranscript).mockResolvedValue({
      suggestedText: "mumble mumble",
      confidence: "low",
    });

    render(<VoiceTextInput value="" onChange={onChange} />);

    await userEvent.click(
      screen.getByRole("button", { name: "Stop recording" })
    );

    await waitFor(() =>
      expect(screen.getByText("mumble mumble")).toBeInTheDocument()
    );
    expect(onChange).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "Use this" }));
    expect(onChange).toHaveBeenCalledWith("mumble mumble");
  });
});
