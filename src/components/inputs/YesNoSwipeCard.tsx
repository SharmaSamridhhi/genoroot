"use client";

import {
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion";
import { motionTransition } from "@/lib/motion/tokens";

interface YesNoSwipeCardProps {
  value: boolean | null;
  onChange: (value: boolean) => void;
}

const SWIPE_THRESHOLD = 80;

// Swipe is an accelerator, not the only way in — the Yes/No buttons below are a
// first-class, always-visible affordance so mouse/keyboard users (and the swipe
// gesture failing to register) never hit a dead end.
export function YesNoSwipeCard({ value, onChange }: YesNoSwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-150, 150], [-8, 8]);
  const background = useTransform(
    x,
    [-150, 0, 150],
    ["rgba(193,114,62,0.16)", "rgba(0,0,0,0)", "rgba(47,107,79,0.16)"]
  );

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > SWIPE_THRESHOLD) {
      onChange(true);
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      onChange(false);
    }
    x.set(0);
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        onDragEnd={handleDragEnd}
        style={{ x, rotate, background }}
        transition={motionTransition()}
        className="border-line text-ink-soft flex h-28 w-full max-w-xs cursor-grab items-center justify-center rounded-2xl border select-none active:cursor-grabbing"
      >
        Swipe or tap below
      </motion.div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => onChange(false)}
          aria-pressed={value === false}
          className={[
            "min-h-11 min-w-28 rounded-full border px-6 py-2 text-base font-medium transition-colors",
            value === false
              ? "border-copper-deep bg-copper-deep text-white"
              : "border-line bg-card text-ink hover:border-copper",
          ].join(" ")}
        >
          No
        </button>
        <button
          type="button"
          onClick={() => onChange(true)}
          aria-pressed={value === true}
          className={[
            "min-h-11 min-w-28 rounded-full border px-6 py-2 text-base font-medium transition-colors",
            value === true
              ? "border-moss bg-moss text-white"
              : "border-line bg-card text-ink hover:border-moss",
          ].join(" ")}
        >
          Yes
        </button>
      </div>
    </div>
  );
}
