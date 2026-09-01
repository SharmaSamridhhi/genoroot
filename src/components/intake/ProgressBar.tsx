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
      <div className="flex justify-between text-xs font-medium text-neutral-400">
        {SECTIONS.map((section) => (
          <span
            key={section}
            className={
              section === currentSection
                ? "text-indigo-600 dark:text-indigo-400"
                : ""
            }
          >
            {section}
          </span>
        ))}
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
        <motion.div
          className="h-full rounded-full bg-indigo-600"
          initial={false}
          animate={{ width: `${percent}%` }}
          transition={motionTransition()}
        />
      </div>
    </div>
  );
}
