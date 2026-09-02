"use client";

import { motion } from "framer-motion";
import { prefersReducedMotion } from "@/lib/motion/tokens";

/**
 * Purely decorative root/branch line-art for the desktop left panel (GR-019)
 * — echoes the "root to growth" gradient narrative. Hidden below `lg:` since
 * there's no room for it once the split layout collapses to one column.
 */
export function RootLineArt({ seed = 0 }: { seed?: number }) {
  const reduceMotion = prefersReducedMotion();

  return (
    <svg
      viewBox="0 0 200 200"
      className="pointer-events-none absolute -right-10 -bottom-8 hidden h-64 w-64 opacity-55 lg:block"
      aria-hidden="true"
    >
      {[
        "M100 10 C 90 60, 70 70, 55 110 C 45 135, 30 150, 15 190",
        "M100 10 C 108 55, 130 65, 145 100 C 158 128, 170 145, 190 175",
        "M100 10 C 98 50, 95 80, 100 120 C 103 150, 100 170, 105 195",
      ].map((d, i) => (
        <motion.path
          key={`${seed}-${i}`}
          d={d}
          fill="none"
          stroke={i === 1 ? "var(--color-copper)" : "var(--color-moss)"}
          strokeWidth={1.4}
          strokeLinecap="round"
          initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 1.4, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }
          }
        />
      ))}
    </svg>
  );
}
