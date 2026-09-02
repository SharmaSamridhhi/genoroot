"use client";

import { motion } from "framer-motion";
import { motionTransition } from "@/lib/motion/tokens";

const SECTIONS: ("A" | "B" | "C" | "D" | "E")[] = ["A", "B", "C", "D", "E"];

interface ProgressBarProps {
  percent: number;
  currentSection: "A" | "B" | "C" | "D" | "E";
}

export function ProgressBar({ percent, currentSection }: ProgressBarProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-ink-soft/70 flex justify-between font-mono text-xs tracking-wide">
        {SECTIONS.map((section) => (
          <span
            key={section}
            className={
              section === currentSection ? "text-copper-deep font-medium" : ""
            }
          >
            {section}
          </span>
        ))}
      </div>
      <div className="bg-copper-soft/50 h-[3px] w-full overflow-hidden rounded-full">
        <motion.div
          className="bg-gradient-root h-full rounded-full"
          initial={false}
          animate={{ width: `${percent}%` }}
          transition={motionTransition()}
        />
      </div>
    </div>
  );
}
