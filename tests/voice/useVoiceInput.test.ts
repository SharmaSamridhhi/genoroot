import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useVoiceInput } from "@/lib/voice/useVoiceInput";

class FakeSpeechRecognition extends EventTarget {
  static lastInstance: FakeSpeechRecognition | null = null;

  continuous = false;
  interimResults = false;
  lang = "";
  onresult:
    | ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void)
    | null = null;
  onerror: ((event: { error: string }) => void) | null = null;
  onend: (() => void) | null = null;
  start = vi.fn();
  stop = vi.fn(() => {
    this.onend?.();
  });

  constructor() {
    super();
    FakeSpeechRecognition.lastInstance = this;
  }
}

afterEach(() => {
  vi.unstubAllGlobals();
  delete (window as unknown as { SpeechRecognition?: unknown })
    .SpeechRecognition;
  delete (window as unknown as { webkitSpeechRecognition?: unknown })
    .webkitSpeechRecognition;
});

describe("useVoiceInput", () => {
  it("isSupported is false when the browser has no SpeechRecognition constructor", () => {
    const { result } = renderHook(() => useVoiceInput());
    expect(result.current.isSupported).toBe(false);
  });

  it("isSupported is true when webkitSpeechRecognition is present", () => {
    (
      window as unknown as { webkitSpeechRecognition: unknown }
    ).webkitSpeechRecognition = FakeSpeechRecognition;
    const { result } = renderHook(() => useVoiceInput());
    expect(result.current.isSupported).toBe(true);
  });

  it("start() begins listening and onresult updates the live transcript", () => {
    (window as unknown as { SpeechRecognition: unknown }).SpeechRecognition =
      FakeSpeechRecognition;
    const { result } = renderHook(() => useVoiceInput());

    act(() => result.current.start());
    expect(result.current.isListening).toBe(true);

    act(() => {
      FakeSpeechRecognition.lastInstance?.onresult?.({
        results: [{ 0: { transcript: "receding hairline" } }],
      });
    });

    expect(result.current.transcript).toBe("receding hairline");
  });

  it("stop() ends listening", () => {
    (window as unknown as { SpeechRecognition: unknown }).SpeechRecognition =
      FakeSpeechRecognition;
    const { result } = renderHook(() => useVoiceInput());

    act(() => result.current.start());
    expect(result.current.isListening).toBe(true);

    act(() => result.current.stop());
    expect(result.current.isListening).toBe(false);
  });

  it("a permission-denied error surfaces a non-blocking inline message, not a thrown error", () => {
    class DenyingRecognition extends FakeSpeechRecognition {
      start = vi.fn(() => {
        this.onerror?.({ error: "not-allowed" });
      });
    }
    (window as unknown as { SpeechRecognition: unknown }).SpeechRecognition =
      DenyingRecognition;
    const { result } = renderHook(() => useVoiceInput());

    act(() => result.current.start());

    expect(result.current.error).toBe(
      "Mic access denied — you can type instead"
    );
    expect(result.current.isListening).toBe(false);
  });
});
