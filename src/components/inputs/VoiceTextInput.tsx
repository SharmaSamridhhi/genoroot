"use client";

import { useState } from "react";
import { TextInput } from "./TextInput";
import { MicButton } from "./MicButton";
import { useVoiceInput } from "@/lib/voice/useVoiceInput";
import { interpretTranscript } from "@/lib/voice/interpretTranscript";

interface VoiceTextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
}

// Composes TextInput + MicButton rather than threading voice through
// TextInput's onVoiceRequest slot — that slot renders a plain static icon
// (GR-007), whereas voice needs real state (listening/processing/error) and a
// confirm step, so it's simpler for this wrapper to own that layer entirely
// and just not pass onVoiceRequest to TextInput at all.
export function VoiceTextInput({
  value,
  onChange,
  placeholder,
  multiline,
}: VoiceTextInputProps) {
  const { isSupported, isListening, transcript, error, start, stop } =
    useVoiceInput();
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  async function handleStop() {
    stop();
    if (!transcript.trim()) return;
    setProcessing(true);
    const result = await interpretTranscript(transcript, "free_text");
    setProcessing(false);
    setSuggestion(result.suggestedText ?? transcript);
  }

  function acceptSuggestion() {
    if (suggestion) onChange(suggestion);
    setSuggestion(null);
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-start gap-2">
        <TextInput
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          multiline={multiline}
        />
        <MicButton
          isSupported={isSupported}
          isListening={isListening}
          error={error}
          onStart={start}
          onStop={handleStop}
        />
      </div>

      {isListening && (
        <p className="text-sm text-neutral-500" aria-live="polite">
          {transcript || "Listening…"}
        </p>
      )}

      {processing && (
        <p className="text-sm text-neutral-500">Cleaning that up…</p>
      )}

      {suggestion && !isListening && !processing && (
        <div className="flex items-center gap-2 rounded-lg border border-indigo-300 bg-indigo-50 p-3 text-sm dark:border-indigo-800 dark:bg-indigo-950/40">
          <span className="flex-1">{suggestion}</span>
          <button
            type="button"
            onClick={acceptSuggestion}
            className="min-h-11 rounded-full bg-indigo-600 px-3 py-1 text-white"
          >
            Use this
          </button>
          <button
            type="button"
            onClick={() => setSuggestion(null)}
            className="text-neutral-500 underline underline-offset-2"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
