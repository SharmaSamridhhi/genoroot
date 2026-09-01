"use client";

import { motion } from "framer-motion";
import { prefersReducedMotion } from "@/lib/motion/tokens";

// A small SVG-based "confetti-lite" burst for section-complete moments — a handful
// of dots that fan out and fade, not a heavy external Lottie/confetti dependency.
const PARTICLES = [
  { angle: -60, color: "var(--accent, #6366f1)" },
  { angle: -20, color: "var(--accent-2, #22c55e)" },
  { angle: 20, color: "var(--accent-3, #f59e0b)" },
  { angle: 60, color: "var(--accent, #6366f1)" },
  { angle: -90, color: "var(--accent-2, #22c55e)" },
  { angle: 90, color: "var(--accent-3, #f59e0b)" },
];

export function SuccessBurst({ size = 80 }: { size?: number }) {
  if (prefersReducedMotion()) return null;

  const radius = size / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="pointer-events-none"
    >
      {PARTICLES.map((p, i) => {
        const rad = (p.angle * Math.PI) / 180;
        const dx = Math.cos(rad) * radius * 0.8;
        const dy = Math.sin(rad) * radius * 0.8;
        return (
          <motion.circle
            key={i}
            cx={radius}
            cy={radius}
            r={3}
            fill={p.color}
            initial={{ opacity: 1, x: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: 0, x: dx, y: dy, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.02 }}
          />
        );
      })}
    </svg>
  );
}
