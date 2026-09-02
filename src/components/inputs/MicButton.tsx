"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { IconMic, IconStop } from "@/components/icons/manifest";
import { motionTransition, prefersReducedMotion } from "@/lib/motion/tokens";

interface MicButtonProps {
  isSupported: boolean;
  isListening: boolean;
  error: string | null;
  /** 0–1 live mic level, for a subtle glow synced to loudness while
   * listening — the full per-band visualizer lives in VoiceVisualizer,
   * rendered separately by the caller with more room to work with. */
  level?: number;
  onStart: () => void;
  onStop: () => void;
}

function useShortcutLabel(): string {
  const [label, setLabel] = useState("Alt+M");
  useEffect(() => {
    const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
    setLabel(isMac ? "⌥M" : "Alt+M");
  }, []);
  return label;
}

// Never rendered by the caller when isSupported is false — this component
// itself also refuses to render in that case as a second line of defense,
// since a mic button that doesn't work is worse than no mic button at all.
export function MicButton({
  isSupported,
  isListening,
  error,
  level = 0,
  onStart,
  onStop,
}: MicButtonProps) {
  const shortcutLabel = useShortcutLabel();

  // Alt+M (⌥M on Mac) toggles dictation for whichever question is currently
  // on screen — there's only ever one MicButton mounted at a time, so a
  // global listener scoped to this component's lifetime is unambiguous.
  // event.code (physical key) rather than event.key is used deliberately:
  // on a Mac, Option+M types "µ" via event.key depending on layout, but
  // event.code is layout-independent.
  useEffect(() => {
    if (!isSupported) return;
    function handleKeydown(e: KeyboardEvent) {
      if (e.altKey && e.code === "KeyM") {
        e.preventDefault();
        if (isListening) onStop();
        else onStart();
      }
    }
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [isSupported, isListening, onStart, onStop]);

  if (!isSupported) return null;

  const tooltip = isListening
    ? `Stop dictating (${shortcutLabel})`
    : `Dictate (${shortcutLabel})`;

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="group/mic relative">
        <motion.button
          type="button"
          aria-label={isListening ? "Stop recording" : "Speak your answer"}
          aria-pressed={isListening}
          onClick={isListening ? onStop : onStart}
          animate={
            isListening && !prefersReducedMotion()
              ? { scale: [1, 1.06, 1] }
              : { scale: 1 }
          }
          transition={
            isListening
              ? { duration: 1.1, repeat: Infinity, ease: "easeInOut" }
              : motionTransition()
          }
          style={
            isListening
              ? {
                  boxShadow: `0 0 0 ${4 + level * 10}px rgba(239,68,68,${0.08 + level * 0.12})`,
                }
              : undefined
          }
          className={[
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-shadow",
            isListening
              ? "border-red-500 bg-red-50 text-red-600"
              : "border-line text-ink-soft hover:border-copper",
          ].join(" ")}
        >
          {isListening ? (
            <IconStop size={16} animate={false} />
          ) : (
            <IconMic size={18} animate={false} />
          )}
        </motion.button>

        <span
          role="tooltip"
          className="border-line bg-ink text-linen pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 rounded-md px-2 py-1 text-xs whitespace-nowrap opacity-0 shadow-md transition-opacity delay-300 group-focus-within/mic:opacity-100 group-hover/mic:opacity-100"
        >
          {tooltip}
        </span>
      </div>

      {error && (
        <span className="max-w-[10rem] text-right text-xs text-red-500">
          {error}
        </span>
      )}
    </div>
  );
}
