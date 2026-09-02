"use client";

import { useEffect, useState } from "react";
import { isSoundEnabled, setSoundEnabled } from "@/lib/sound";

// Deliberately small and quiet in its own right — a toggle for a subtle
// sound effect shouldn't itself demand attention. Sits next to the back
// button rather than anywhere more prominent.
export function SoundToggle() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    setEnabled(isSoundEnabled());
  }, []);

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    setSoundEnabled(next);
  }

  return (
    <button
      type="button"
      aria-label={enabled ? "Mute step sound" : "Unmute step sound"}
      aria-pressed={enabled}
      onClick={toggle}
      className="border-line text-ink-soft hover:border-copper flex h-11 w-11 items-center justify-center rounded-full border transition-colors"
    >
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
        <path
          d="M4 9v6h4l5 4V5L8 9H4Z"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
        {enabled ? (
          <path
            d="M16.5 9a4 4 0 0 1 0 6"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
          />
        ) : (
          <path
            d="M16 9l4 6M20 9l-4 6"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
          />
        )}
      </svg>
    </button>
  );
}
