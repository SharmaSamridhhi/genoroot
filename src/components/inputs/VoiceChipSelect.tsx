"use client";

import { useState } from "react";
import { ChipSelect } from "./ChipSelect";
import { MicButton } from "./MicButton";
import { VoiceVisualizer } from "./VoiceVisualizer";
import { useVoiceInput } from "@/lib/voice/useVoiceInput";
import { interpretTranscript } from "@/lib/voice/interpretTranscript";
import { applyExclusiveSelection } from "@/lib/rules";
import { ENABLE_VOICE } from "@/lib/featureFlags";

interface VoiceChipSelectProps {
  questionKey: string;
  options: string[];
  mode: "single" | "multi";
  value: string | string[] | null;
  onChange: (value: string | string[]) => void;
}

// A high-confidence spoken match (an exact/near-exact hit, the common case)
// commits straight to the selection — asking the patient to then tap a "did
// you mean" chip to confirm what they just clearly said defeats the point of
// using their voice at all. Only a genuinely uncertain match (confidence
// "low") falls back to an explicit tap-to-confirm suggestion.
export function VoiceChipSelect({
  questionKey,
  options,
  mode,
  value,
  onChange,
}: VoiceChipSelectProps) {
  const {
    isSupported,
    isListening,
    transcript,
    error,
    levels,
    level,
    start,
    stop,
  } = useVoiceInput();
  const [suggested, setSuggested] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);

  function commitOption(option: string) {
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
  }

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
    const matched = result.suggestedOptions ?? [];
    if (result.confidence === "high" && matched.length > 0) {
      matched.forEach(commitOption);
    } else {
      setSuggested(matched);
    }
  }

  function acceptSuggestion(option: string) {
    commitOption(option);
    setSuggested((current) => current.filter((o) => o !== option));
  }

  // ENABLE_VOICE is a build-time constant, never toggled at runtime, so this
  // early return after all the hooks above have already run doesn't risk a
  // conditional-hooks violation — same hooks every render, just the JSX.
  if (!ENABLE_VOICE) {
    return (
      <ChipSelect
        questionKey={questionKey}
        options={options}
        mode={mode}
        value={value}
        onChange={onChange}
      />
    );
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
          level={level}
          onStart={start}
          onStop={handleStop}
        />
      </div>

      {isListening && (
        <VoiceVisualizer levels={levels} transcript={transcript} />
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
