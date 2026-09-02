"use client";

import { motion } from "framer-motion";
import { prefersReducedMotion } from "@/lib/motion/tokens";
import { LINE_ART_STROKE, LINE_ART_FLOAT } from "@/lib/lineArtStyle";

// Purely decorative, one per habits-table row (GR-019.1, extended GR-020) —
// deliberately kept in the same thin-line, low-opacity register as
// QuestionArt so these read as background texture, not as functional icons
// competing with the real controls. Never aria-labeled: every row already
// has a proper field label read by screen readers.

function Cigarette() {
  return (
    <g {...LINE_ART_STROKE} stroke="var(--color-copper)">
      <rect
        x="20"
        y="78"
        width="52"
        height="12"
        rx="2"
        transform="rotate(-18 20 78)"
      />
      <line x1="34" y1="72" x2="37" y2="83" transform="rotate(-18 34 72)" />
      <path d="M64 52 C 60 46, 66 42, 62 34" strokeWidth="1.1" opacity="0.8" />
      <path d="M72 56 C 68 49, 75 45, 70 36" strokeWidth="1.1" opacity="0.6" />
    </g>
  );
}

function WineGlass() {
  return (
    <g {...LINE_ART_STROKE} stroke="var(--color-copper)">
      <path d="M34 20 C 34 42, 42 50, 50 50 C 58 50, 66 42, 66 20 Z" />
      <path d="M38 24 C 42 34, 58 34, 62 24" strokeWidth="1.1" opacity="0.7" />
      <line x1="50" y1="50" x2="50" y2="78" />
      <line x1="34" y1="86" x2="66" y2="86" />
      <line x1="50" y1="78" x2="50" y2="86" />
    </g>
  );
}

function WaterDroplet() {
  return (
    <g {...LINE_ART_STROKE} stroke="var(--color-moss)">
      <path d="M50 18 C 64 40, 74 54, 74 66 C 74 82, 62 92, 50 92 C 38 92, 26 82, 26 66 C 26 54, 36 40, 50 18 Z" />
      <line x1="44" y1="30" x2="76" y2="30" strokeWidth="1.1" opacity="0.6" />
      <line x1="56" y1="16" x2="80" y2="16" strokeWidth="1.1" opacity="0.5" />
    </g>
  );
}

function ShowerHead() {
  return (
    <g {...LINE_ART_STROKE} stroke="var(--color-moss)">
      <path d="M24 30 C 24 20, 76 20, 76 30 C 76 38, 24 38, 24 30 Z" />
      <line x1="34" y1="46" x2="30" y2="60" />
      <line x1="46" y1="46" x2="43" y2="64" />
      <line x1="58" y1="46" x2="57" y2="64" />
      <line x1="70" y1="46" x2="70" y2="60" />
    </g>
  );
}

function BlowDryer() {
  return (
    <g {...LINE_ART_STROKE} stroke="var(--color-copper)">
      <path d="M28 42 C 28 30, 60 30, 64 42 C 66 48, 62 52, 56 52 L 40 52 C 34 52, 28 48, 28 42 Z" />
      <path d="M40 52 L 34 88 L 46 88 L 48 58" />
      <line x1="66" y1="40" x2="88" y2="34" strokeWidth="1.1" opacity="0.7" />
      <line x1="66" y1="46" x2="88" y2="46" strokeWidth="1.1" opacity="0.5" />
    </g>
  );
}

function Scissors() {
  return (
    <g {...LINE_ART_STROKE} stroke="var(--color-moss)">
      <circle cx="30" cy="66" r="10" />
      <circle cx="30" cy="30" r="10" />
      <line x1="38" y1="60" x2="80" y2="24" />
      <line x1="38" y1="36" x2="80" y2="72" />
    </g>
  );
}

const HABIT_ART: Record<string, () => React.JSX.Element> = {
  smoking: Cigarette,
  alcohol: WineGlass,
  hard_water: WaterDroplet,
  hair_wash_frequency: ShowerHead,
  heating_tools_styling_chemicals: BlowDryer,
  salon_treatments: Scissors,
};

export function HabitRowArt({ habitKey }: { habitKey: string }) {
  const Art = HABIT_ART[habitKey];
  if (!Art) return null;
  const reduceMotion = prefersReducedMotion();

  return (
    <motion.svg
      key={habitKey}
      viewBox="0 0 100 100"
      className="pointer-events-none absolute top-0 right-0 hidden h-28 w-28 sm:block lg:h-32 lg:w-32"
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={
        reduceMotion
          ? { opacity: 0.28 }
          : { opacity: 0.28, ...LINE_ART_FLOAT.animate }
      }
      transition={
        reduceMotion
          ? { duration: 0 }
          : { opacity: { duration: 0.4 }, y: LINE_ART_FLOAT.transition }
      }
    >
      <Art />
    </motion.svg>
  );
}
