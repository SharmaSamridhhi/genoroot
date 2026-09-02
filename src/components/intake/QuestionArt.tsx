"use client";

import { motion } from "framer-motion";
import { prefersReducedMotion } from "@/lib/motion/tokens";
import { LINE_ART_STROKE, LINE_ART_FLOAT } from "@/lib/lineArtStyle";

function Hourglass() {
  return <path d="M30 15 H70 L50 50 L70 85 H30 L50 50 Z" />;
}
function Clock() {
  return (
    <g>
      <circle cx="50" cy="50" r="34" />
      <line x1="50" y1="50" x2="50" y2="28" />
      <line x1="50" y1="50" x2="65" y2="58" />
    </g>
  );
}
function Family() {
  return (
    <g>
      <circle cx="35" cy="28" r="10" />
      <path d="M17 68 C17 46 53 46 53 68" />
      <circle cx="68" cy="40" r="7" />
      <path d="M55 75 C55 59 82 59 82 75" />
    </g>
  );
}
function Rings() {
  return (
    <g>
      <circle cx="50" cy="50" r="12" />
      <circle cx="50" cy="50" r="24" opacity="0.7" />
      <circle cx="50" cy="50" r="36" opacity="0.45" />
    </g>
  );
}
function Pulse() {
  return <path d="M12 52 H33 L41 28 L52 74 L61 42 L68 52 H88" />;
}
function Crescent() {
  return <path d="M60 18 A32 32 0 1 0 60 82 A23 23 0 1 1 60 18 Z" />;
}
function Heart() {
  return (
    <path d="M50 84 C18 60 12 34 31 20 C42 12 50 20 50 31 C50 20 58 12 69 20 C88 34 82 60 50 84 Z" />
  );
}
function Droplet() {
  return (
    <g>
      <path d="M50 14 C66 38 76 53 76 66 C76 82 64 92 50 92 C36 92 24 82 24 66 C24 53 34 38 50 14 Z" />
      <line x1="43" y1="26" x2="77" y2="26" strokeWidth="1.1" opacity="0.6" />
    </g>
  );
}
function Strands() {
  return (
    <g>
      <path d="M22 16 C33 32 11 44 22 60 C33 76 11 88 22 96" />
      <path
        d="M45 12 C56 28 34 40 45 56 C56 72 34 84 45 96"
        strokeWidth="1.15"
        opacity="0.75"
      />
      <path
        d="M68 16 C79 32 57 44 68 60 C79 76 57 88 68 96"
        strokeWidth="1.05"
        opacity="0.55"
      />
    </g>
  );
}
function Calendar() {
  return (
    <g>
      <rect x="16" y="24" width="68" height="60" rx="5" />
      <line x1="16" y1="42" x2="84" y2="42" />
      <line x1="33" y1="14" x2="33" y2="30" />
      <line x1="67" y1="14" x2="67" y2="30" />
      <rect
        x="28"
        y="54"
        width="14"
        height="14"
        fill="currentColor"
        stroke="none"
        opacity="0.35"
      />
    </g>
  );
}
function Comb() {
  return (
    <g>
      <rect x="18" y="18" width="64" height="13" rx="2" />
      <line x1="25" y1="31" x2="25" y2="82" />
      <line x1="38" y1="31" x2="38" y2="76" />
      <line x1="51" y1="31" x2="51" y2="84" />
      <line x1="64" y1="31" x2="64" y2="76" />
      <line x1="77" y1="31" x2="77" y2="82" />
    </g>
  );
}
function Bottle() {
  return (
    <g>
      <path d="M41 14 H59 V27 C59 27 70 32 70 46 V82 C70 87 65 91 60 91 H40 C35 91 30 87 30 82 V46 C30 32 41 27 41 27 Z" />
      <line x1="41" y1="14" x2="41" y2="7" />
      <line x1="59" y1="14" x2="59" y2="7" />
      <line x1="41" y1="7" x2="59" y2="7" />
    </g>
  );
}
function Syringe() {
  return (
    <g>
      <rect x="22" y="44" width="42" height="13" rx="2" />
      <line x1="64" y1="50.5" x2="86" y2="50.5" />
      <line x1="18" y1="44" x2="18" y2="57" />
      <line x1="18" y1="50.5" x2="22" y2="50.5" />
      <line x1="36" y1="44" x2="36" y2="57" strokeWidth="1" opacity="0.55" />
      <line x1="48" y1="44" x2="48" y2="57" strokeWidth="1" opacity="0.55" />
    </g>
  );
}
function Bandage() {
  return (
    <g transform="rotate(-16 50 50)">
      <rect x="20" y="37" width="60" height="26" rx="13" />
      <circle cx="40" cy="45" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="50" cy="50" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="60" cy="55" r="1.3" fill="currentColor" stroke="none" />
    </g>
  );
}
function Vial() {
  return (
    <g>
      <path d="M39 14 H61 V58 C61 74 51 83 50 83 C49 83 39 74 39 58 Z" />
      <line x1="39" y1="14" x2="39" y2="8" />
      <line x1="61" y1="14" x2="61" y2="8" />
      <line x1="39" y1="8" x2="61" y2="8" />
      <line x1="40" y1="53" x2="60" y2="53" strokeWidth="1" opacity="0.5" />
    </g>
  );
}
function Shield() {
  return (
    <g>
      <path d="M50 10 L83 24 V49 C83 70 68 85 50 91 C32 85 17 70 17 49 V24 Z" />
      <path d="M35 49 L45 59 L66 37" strokeWidth="1.6" />
    </g>
  );
}

const QUESTION_ART: Record<
  string,
  { Art: () => React.JSX.Element; color: "copper" | "moss" }
> = {
  age_hair_loss_began: { Art: Hourglass, color: "copper" },
  duration: { Art: Clock, color: "moss" },
  family_history: { Art: Family, color: "copper" },
  pattern: { Art: Rings, color: "moss" },
  diagnosed_conditions: { Art: Pulse, color: "copper" },
  menstrual_cycle: { Art: Crescent, color: "moss" },
  pregnancy_related: { Art: Heart, color: "copper" },
  adult_acne_oily_skin: { Art: Droplet, color: "moss" },
  excess_body_facial_hair: { Art: Strands, color: "copper" },
  past_6_months: { Art: Calendar, color: "moss" },
  habits: { Art: Comb, color: "copper" },
  products: { Art: Bottle, color: "moss" },
  procedures: { Art: Syringe, color: "copper" },
  past_treatment_side_effects: { Art: Bandage, color: "moss" },
  sample_type: { Art: Vial, color: "copper" },
  consent: { Art: Shield, color: "moss" },
};

/**
 * One themed line-art icon per top-level question on the desktop left panel
 * (GR-020, extending GR-019.1's habits-table icons to every question) — same
 * thin-stroke, low-opacity register as HabitRowArt so it reads as
 * background texture rather than a functional icon. A slow, small vertical
 * float keeps it feeling alive without drawing attention away from the
 * actual controls; skipped entirely under prefers-reduced-motion.
 */
export function QuestionArt({ questionKey }: { questionKey: string }) {
  const entry = QUESTION_ART[questionKey];
  if (!entry) return null;
  const { Art, color } = entry;
  const reduceMotion = prefersReducedMotion();

  return (
    <motion.div
      key={questionKey}
      // Normal flow, not absolutely positioned over the headline — a fixed
      // overlap position looked fine for some headline lengths and badly
      // collided with the text for others (a short 2-line headline centers
      // higher in the panel, right where a bottom-anchored icon reached up
      // to). Sitting below the text in flow guarantees no overlap regardless
      // of how many lines the headline wraps to.
      className="pointer-events-none ml-auto hidden h-32 w-32 opacity-60 lg:block lg:h-40 lg:w-40"
      style={{ color: `var(--color-${color})` }}
      initial={{ opacity: 0 }}
      animate={
        reduceMotion
          ? { opacity: 0.6 }
          : { opacity: 0.6, ...LINE_ART_FLOAT.animate }
      }
      transition={
        reduceMotion
          ? { duration: 0 }
          : { opacity: { duration: 0.4 }, y: LINE_ART_FLOAT.transition }
      }
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <g {...LINE_ART_STROKE} stroke="currentColor">
          <Art />
        </g>
      </svg>
    </motion.div>
  );
}
