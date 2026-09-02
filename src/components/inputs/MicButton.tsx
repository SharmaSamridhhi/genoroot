"use client";

import { motion } from "framer-motion";
import { IconMic } from "@/components/icons/manifest";
import { motionTransition, prefersReducedMotion } from "@/lib/motion/tokens";

interface MicButtonProps {
  isSupported: boolean;
  isListening: boolean;
  error: string | null;
  onStart: () => void;
  onStop: () => void;
}

// Never rendered by the caller when isSupported is false — this component
// itself also refuses to render in that case as a second line of defense,
// since a mic button that doesn't work is worse than no mic button at all.
export function MicButton({
  isSupported,
  isListening,
  error,
  onStart,
  onStop,
}: MicButtonProps) {
  if (!isSupported) return null;

  return (
    <div className="flex flex-col items-end gap-1">
      <motion.button
        type="button"
        aria-label={isListening ? "Stop recording" : "Speak your answer"}
        aria-pressed={isListening}
        onClick={isListening ? onStop : onStart}
        animate={
          isListening && !prefersReducedMotion()
            ? { scale: [1, 1.08, 1] }
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
            ? "border-red-500 bg-red-50 text-red-600 dark:bg-red-950/40"
            : "border-neutral-300 hover:border-indigo-400 dark:border-neutral-700",
        ].join(" ")}
      >
        <IconMic size={18} animate={false} />
      </motion.button>
      {error && (
        <span className="max-w-[10rem] text-right text-xs text-red-500">
          {error}
        </span>
      )}
    </div>
  );
}
