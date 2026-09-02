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
  base: "fill-card stroke-copper-soft",
  active: "fill-moss/25 stroke-moss",
};

// Applied to every interactive SVG region: SVG shapes don't reliably get a
// visible default focus ring across browsers the way <button> does, so this
// is drawn explicitly for keyboard navigation (GR-016).
const FOCUS_RING =
  "cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper";

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
    `transition-colors ${isActive(option) ? REGION_STYLE.active : REGION_STYLE.base}`;

  function regionProps(option: string, label: string) {
    return {
      onClick: () => toggle(option),
      role: "button" as const,
      tabIndex: 0,
      "aria-pressed": isActive(option),
      "aria-label": label,
      onKeyDown: (e: React.KeyboardEvent) =>
        (e.key === "Enter" || e.key === " ") && toggle(option),
    };
  }

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
            it, while a tap on hairline/crown/part-line hits that region instead.
            Already well over the 44px tap-target minimum on its own. */}
        <motion.ellipse
          cx={100}
          cy={112}
          rx={72}
          ry={96}
          strokeWidth={2}
          className={`${regionClass("Diffuse thinning")} ${FOCUS_RING}`}
          whileTap={{ scale: 0.98 }}
          transition={motionTransition(0.15)}
          {...regionProps(
            "Diffuse thinning",
            "Diffuse thinning — overall scalp"
          )}
        />

        {/* Hairline — front band. Bounding box is ~110x60 units, already over
            the 44px minimum in both dimensions. */}
        <motion.path
          d="M40 55 Q100 15 160 55 L150 75 Q100 45 50 75 Z"
          strokeWidth={2}
          strokeLinejoin="round"
          className={`${regionClass("Receding hairline")} ${FOCUS_RING}`}
          whileTap={{ scale: 0.97 }}
          transition={motionTransition(0.15)}
          {...regionProps("Receding hairline", "Receding hairline — front")}
        />

        {/* Part line — the visible band stays narrow (16 units wide, a
            realistic depiction), but a narrow band alone would fail the 44px
            tap-target minimum. An invisible wider rect (40 units) shares the
            same tap/focus handling via a group, so the hit area is generous
            while the visible mark stays thin. */}
        <motion.g
          whileTap={{ scale: 0.97 }}
          transition={motionTransition(0.15)}
          className={FOCUS_RING}
          {...regionProps("Widening part line", "Widening part line — center")}
        >
          <rect
            x={80}
            y={78}
            width={40}
            height={90}
            fill="transparent"
            stroke="none"
          />
          <rect
            x={92}
            y={78}
            width={16}
            height={90}
            strokeWidth={2}
            pointerEvents="none"
            className={regionClass("Widening part line")}
          />
        </motion.g>

        {/* Crown — back/vertex. 52-unit diameter, already over the minimum. */}
        <motion.circle
          cx={100}
          cy={172}
          r={26}
          strokeWidth={2}
          className={`${regionClass("Thinning at crown")} ${FOCUS_RING}`}
          whileTap={{ scale: 0.95 }}
          transition={motionTransition(0.15)}
          {...regionProps(
            "Thinning at crown",
            "Thinning at crown — back of scalp"
          )}
        />

        {/* Patchy loss — a small dashed dot is the intentional visual (subtle
            marker, not a big blob), so the same invisible-wider-hit-area
            group pattern as the part line applies here too. */}
        <motion.g
          whileTap={{ scale: 0.9 }}
          transition={motionTransition(0.15)}
          className={FOCUS_RING}
          {...regionProps("Patchy loss", "Patchy loss")}
        >
          <circle cx={65} cy={130} r={22} fill="transparent" stroke="none" />
          <circle
            cx={65}
            cy={130}
            r={10}
            strokeWidth={2}
            strokeDasharray="3 2"
            pointerEvents="none"
            className={regionClass("Patchy loss")}
          />
        </motion.g>
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
            ? "bg-gradient-root-solid border-transparent text-white"
            : "border-line bg-card text-ink hover:border-copper",
        ].join(" ")}
      >
        {isActive(SHEDDING_OPTION) && <IconCheck size={16} animate={false} />}
        {SHEDDING_OPTION}
      </button>

      <p className="text-ink-soft text-center text-sm">
        {value.length > 0
          ? `Selected: ${value.join(", ")}`
          : "Tap the diagram (or the option above) to select"}
      </p>
    </div>
  );
}
