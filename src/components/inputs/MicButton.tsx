"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { IconMic, IconStop } from "@/components/icons/manifest";
import { motionTransition, prefersReducedMotion } from "@/lib/motion/tokens";

interface MicButtonProps {
  isSupported: boolean;
  isListening: boolean;
  error: string | null;
  /** 0–1 live mic level, for the bar visualizer — see useVoiceInput. */
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

/** Three small bars reacting to the live mic level — a real amplitude
 * visualizer, not a generic "something is happening" pulse. Each bar has a
 * different sensitivity so it reads as a wave rather than three identical
 * blocks moving in lockstep. */
function LevelBars({ level }: { level: number }) {
  const heights = [0.35 + level * 0.5, 0.3 + level * 0.9, 0.4 + level * 0.6];
  return (
    <div className="flex h-4 items-end gap-[3px]" aria-hidden="true">
      {heights.map((h, i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-red-500"
          style={{
            height: `${Math.min(1, h) * 100}%`,
            transition: "height 70ms linear",
          }}
        />
      ))}
    </div>
  );
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
          className={[
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border",
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

      {isListening && <LevelBars level={level} />}

      {error && (
        <span className="max-w-[10rem] text-right text-xs text-red-500">
          {error}
        </span>
      )}
    </div>
  );
}
