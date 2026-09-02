"use client";

import { motion } from "framer-motion";
import { applyExclusiveSelection } from "@/lib/rules";
import { motionTransition } from "@/lib/motion/tokens";
import { IconCheck } from "@/components/icons/manifest";

interface ScalpPatternPickerProps {
  value: string[];
  onChange: (value: string[]) => void;
}

const SHEDDING_OPTION = "Sudden excessive shedding";

const REGION_STYLE = {
  base: "fill-neutral-100 stroke-neutral-400 dark:fill-neutral-800 dark:stroke-neutral-600",
  active:
    "fill-indigo-400/70 stroke-indigo-600 dark:fill-indigo-500/50 dark:stroke-indigo-400",
};

export function ScalpPatternPicker({
  value,
  onChange,
}: ScalpPatternPickerProps) {
  function toggle(option: string) {
    onChange(applyExclusiveSelection("pattern", value, option));
  }

  function isActive(option: string) {
    return value.includes(option);
  }

  const regionClass = (option: string) =>
    `cursor-pointer transition-colors ${isActive(option) ? REGION_STYLE.active : REGION_STYLE.base} hover:stroke-indigo-500`;

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        viewBox="0 0 200 220"
        width={220}
        height={242}
        className="select-none"
        role="group"
        aria-label="Scalp diagram — tap the areas that match your pattern"
      >
        {/* Diffuse thinning — the whole-scalp background; sits behind the more
            specific regions below, so a tap anywhere else on the head toggles
            it, while a tap on hairline/crown/part-line hits that region instead. */}
        <motion.ellipse
          cx={100}
          cy={112}
          rx={72}
          ry={96}
          strokeWidth={2}
          className={regionClass("Diffuse thinning")}
          whileTap={{ scale: 0.98 }}
          transition={motionTransition(0.15)}
          onClick={() => toggle("Diffuse thinning")}
          role="button"
          tabIndex={0}
          aria-pressed={isActive("Diffuse thinning")}
          aria-label="Diffuse thinning — overall scalp"
          onKeyDown={(e) =>
            (e.key === "Enter" || e.key === " ") && toggle("Diffuse thinning")
          }
        />

        {/* Hairline — front band */}
        <motion.path
          d="M40 55 Q100 15 160 55 L150 75 Q100 45 50 75 Z"
          strokeWidth={2}
          strokeLinejoin="round"
          className={regionClass("Receding hairline")}
          whileTap={{ scale: 0.97 }}
          transition={motionTransition(0.15)}
          onClick={() => toggle("Receding hairline")}
          role="button"
          tabIndex={0}
          aria-pressed={isActive("Receding hairline")}
          aria-label="Receding hairline — front"
          onKeyDown={(e) =>
            (e.key === "Enter" || e.key === " ") && toggle("Receding hairline")
          }
        />

        {/* Part line — vertical band down the middle */}
        <motion.rect
          x={92}
          y={78}
          width={16}
          height={90}
          strokeWidth={2}
          className={regionClass("Widening part line")}
          whileTap={{ scale: 0.97 }}
          transition={motionTransition(0.15)}
          onClick={() => toggle("Widening part line")}
          role="button"
          tabIndex={0}
          aria-pressed={isActive("Widening part line")}
          aria-label="Widening part line — center"
          onKeyDown={(e) =>
            (e.key === "Enter" || e.key === " ") && toggle("Widening part line")
          }
        />

        {/* Crown — back/vertex */}
        <motion.circle
          cx={100}
          cy={172}
          r={26}
          strokeWidth={2}
          className={regionClass("Thinning at crown")}
          whileTap={{ scale: 0.95 }}
          transition={motionTransition(0.15)}
          onClick={() => toggle("Thinning at crown")}
          role="button"
          tabIndex={0}
          aria-pressed={isActive("Thinning at crown")}
          aria-label="Thinning at crown — back of scalp"
          onKeyDown={(e) =>
            (e.key === "Enter" || e.key === " ") && toggle("Thinning at crown")
          }
        />

        {/* Patchy loss — a couple of small freeform spots, simple toggle markers
            rather than freeform placement (kept deliberately simple per spec). */}
        <motion.circle
          cx={65}
          cy={130}
          r={10}
          strokeWidth={2}
          strokeDasharray="3 2"
          className={regionClass("Patchy loss")}
          whileTap={{ scale: 0.9 }}
          transition={motionTransition(0.15)}
          onClick={() => toggle("Patchy loss")}
          role="button"
          tabIndex={0}
          aria-pressed={isActive("Patchy loss")}
          aria-label="Patchy loss"
          onKeyDown={(e) =>
            (e.key === "Enter" || e.key === " ") && toggle("Patchy loss")
          }
        />
      </svg>

      {/* Not spatial — rendered as a standalone chip alongside the diagram. */}
      <button
        type="button"
        role="checkbox"
        aria-checked={isActive(SHEDDING_OPTION)}
        onClick={() => toggle(SHEDDING_OPTION)}
        className={[
          "flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-base transition-colors",
          isActive(SHEDDING_OPTION)
            ? "border-indigo-600 bg-indigo-600 text-white"
            : "border-neutral-300 bg-white text-neutral-800 hover:border-indigo-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100",
        ].join(" ")}
      >
        {isActive(SHEDDING_OPTION) && <IconCheck size={16} animate={false} />}
        {SHEDDING_OPTION}
      </button>

      <p className="text-center text-sm text-neutral-500">
        {value.length > 0
          ? `Selected: ${value.join(", ")}`
          : "Tap the diagram (or the option above) to select"}
      </p>
    </div>
  );
}
