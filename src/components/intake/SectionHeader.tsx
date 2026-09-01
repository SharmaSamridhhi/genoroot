"use client";

import { motion, AnimatePresence } from "framer-motion";
import { INTAKE_SCHEMA } from "@/lib/schema/intake-schema";
import { SECTION_ICONS } from "@/components/icons/manifest";
import { motionTransition } from "@/lib/motion/tokens";

const SECTION_ORDER: ("A" | "B" | "C" | "D" | "E")[] = [
  "A",
  "B",
  "C",
  "D",
  "E",
];

export function SectionHeader({
  section,
}: {
  section: "A" | "B" | "C" | "D" | "E";
}) {
  const title =
    INTAKE_SCHEMA.sections.find((s) => s.id === section)?.title ?? "";
  const Icon = SECTION_ICONS[section];
  const index = SECTION_ORDER.indexOf(section) + 1;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={section}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={motionTransition()}
        className="flex items-center gap-2 text-neutral-500"
      >
        <Icon size={18} animate={false} />
        <span className="text-sm font-medium">
          Section {index} of {SECTION_ORDER.length} · {title}
        </span>
      </motion.div>
    </AnimatePresence>
  );
}
