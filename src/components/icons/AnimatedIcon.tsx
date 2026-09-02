"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { motionTransition } from "@/lib/motion/tokens";

interface AnimatedIconProps {
  children: ReactNode;
  size?: number;
  className?: string;
  /** Set false for icons that appear inside a list (e.g. repeated per option) — avoids
   * re-triggering the entrance pop on every re-render. */
  animate?: boolean;
}

// Every icon in the manifest is built on this shell: 24x24 viewBox, 2px stroke,
// rounded caps/joins, currentColor — the one consistent visual language for the app.
export function AnimatedIcon({
  children,
  size = 24,
  className,
  animate = true,
}: AnimatedIconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      // Every current usage is either paired with adjacent visible text (section
      // headers, chips) or sits inside a button that already carries its own
      // aria-label (Back, mic) — the icon itself would be redundant/confusing to
      // a screen reader either way, so it's hidden from the accessibility tree.
      aria-hidden="true"
      initial={animate ? { scale: 0.6, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      transition={motionTransition()}
    >
      {children}
    </motion.svg>
  );
}
