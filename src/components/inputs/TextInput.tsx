"use client";

import { IconMic } from "@/components/icons/manifest";

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  /** Reserved slot for GR-011's voice capture — omitted entirely (no mic button
   * rendered) until voice input actually exists, rather than shipping a dead button. */
  onVoiceRequest?: () => void;
}

export function TextInput({
  value,
  onChange,
  placeholder,
  multiline,
  onVoiceRequest,
}: TextInputProps) {
  const sharedClasses =
    "w-full rounded-lg border border-line bg-card p-3 text-base text-ink focus:border-copper focus:outline-none";

  return (
    <div className="flex items-start gap-2">
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={sharedClasses}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${sharedClasses} h-11`}
        />
      )}
      {onVoiceRequest && (
        <button
          type="button"
          aria-label="Speak your answer"
          onClick={onVoiceRequest}
          className="border-line text-ink-soft hover:border-copper flex h-11 w-11 shrink-0 items-center justify-center rounded-full border"
        >
          <IconMic size={18} animate={false} />
        </button>
      )}
    </div>
  );
}
