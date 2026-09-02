"use client";

import { motion } from "framer-motion";
import { applyExclusiveSelection } from "@/lib/rules";
import { motionTransition } from "@/lib/motion/tokens";
import { IconCheck } from "@/components/icons/manifest";

interface ChipSelectProps {
  /** Schema question key — used to look up GR-004's exclusive-option config in multi mode. */
  questionKey: string;
  options: string[];
  mode: "single" | "multi";
  value: string | string[] | null;
  onChange: (value: string | string[]) => void;
}

export function ChipSelect({
  questionKey,
  options,
  mode,
  value,
  onChange,
}: ChipSelectProps) {
  const selected =
    mode === "multi" ? ((value as string[] | null) ?? []) : value;

  function handleTap(option: string) {
    if (mode === "single") {
      onChange(option);
      return;
    }
    const current = (value as string[] | null) ?? [];
    onChange(applyExclusiveSelection(questionKey, current, option));
  }

  function isSelected(option: string) {
    return mode === "multi"
      ? (selected as string[]).includes(option)
      : selected === option;
  }

  return (
    <div className="flex flex-wrap gap-3" role="group">
      {options.map((option) => {
        const active = isSelected(option);
        return (
          <motion.button
            key={option}
            type="button"
            role={mode === "multi" ? "checkbox" : "radio"}
            aria-checked={active}
            onClick={() => handleTap(option)}
            whileTap={{ scale: 0.94 }}
            transition={motionTransition(0.15)}
            className={[
              "flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-left text-base transition-colors",
              active
                ? "bg-gradient-root-solid border-transparent text-white"
                : "border-line bg-card text-ink hover:border-copper",
            ].join(" ")}
          >
            {active && <IconCheck size={16} animate={false} />}
            {option}
          </motion.button>
        );
      })}
    </div>
  );
}
