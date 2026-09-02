"use client";

import { useState } from "react";
import { ChipSelect } from "./ChipSelect";
import { MicButton } from "./MicButton";
import { useVoiceInput } from "@/lib/voice/useVoiceInput";
import { interpretTranscript } from "@/lib/voice/interpretTranscript";
import { applyExclusiveSelection } from "@/lib/rules";

interface VoiceChipSelectProps {
  questionKey: string;
  options: string[];
  mode: "single" | "multi";
  value: string | string[] | null;
  onChange: (value: string | string[]) => void;
}

// A spoken answer never writes straight to the selection — it only ever
// produces a *suggestion* the patient explicitly taps to accept (GR-012's
// confirm-UI requirement applies to the local-match tier too, not just Groq).
export function VoiceChipSelect({
  questionKey,
  options,
  mode,
  value,
  onChange,
}: VoiceChipSelectProps) {
  const { isSupported, isListening, transcript, error, start, stop } =
    useVoiceInput();
  const [suggested, setSuggested] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);

  async function handleStop() {
    stop();
    if (!transcript.trim()) return;
    setProcessing(true);
    const result = await interpretTranscript(
      transcript,
      "choice_match",
      options
    );
    setProcessing(false);
    setSuggested(result.suggestedOptions ?? []);
  }

  function acceptSuggestion(option: string) {
    if (mode === "single") {
      onChange(option);
    } else {
      onChange(
        applyExclusiveSelection(
          questionKey,
          (value as string[] | null) ?? [],
          option
        )
      );
    }
    setSuggested((current) => current.filter((o) => o !== option));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <ChipSelect
            questionKey={questionKey}
            options={options}
            mode={mode}
            value={value}
            onChange={onChange}
          />
        </div>
        <MicButton
          isSupported={isSupported}
          isListening={isListening}
          error={error}
          onStart={start}
          onStop={handleStop}
        />
      </div>

      {isListening && (
        <p className="text-ink-soft text-sm" aria-live="polite">
          {transcript || "Listening…"}
        </p>
      )}

      {processing && <p className="text-ink-soft text-sm">Matching that…</p>}

      {suggested.length > 0 && (
        <div className="border-copper-soft bg-sage flex flex-wrap items-center gap-2 rounded-lg border p-3 text-sm">
          <span>Did you mean:</span>
          {suggested.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => acceptSuggestion(option)}
              className="bg-gradient-root-solid min-h-11 rounded-full px-3 py-1 text-white"
            >
              {option}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSuggested([])}
            className="text-ink-soft ml-auto underline underline-offset-2"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
