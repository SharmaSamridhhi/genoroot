"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useIntakeStore } from "@/lib/engine/store";
import type { Sex } from "@/lib/schema/types";
import { motionTransition, prefersReducedMotion } from "@/lib/motion/tokens";
import { renderEmphasis } from "./renderEmphasis";
import { LINE_ART_STROKE, LINE_ART_FLOAT } from "@/lib/lineArtStyle";

const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Prefer not to say", label: "Prefer not to say" },
];

// Same international convention used on medical intake forms everywhere —
// abstract symbols rather than figures, so nothing is implied about how
// anyone looks or presents. "Prefer not to say" gets a plain dash: it
// doesn't try to represent an identity, just that one wasn't given.
function SexIcon({ value }: { value: Sex }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {value === "Male" && (
          <>
            <circle cx="10" cy="14" r="6" />
            <path d="M14.5 9.5 L20 4 M20 4 H15 M20 4 V9" />
          </>
        )}
        {value === "Female" && (
          <>
            <circle cx="12" cy="9" r="6" />
            <path d="M12 15 V21 M9 18 H15" />
          </>
        )}
        {value === "Prefer not to say" && <path d="M6 12 H18" />}
      </g>
    </svg>
  );
}

function Sprout() {
  const reduceMotion = prefersReducedMotion();
  return (
    <motion.div
      className="text-copper-deep pointer-events-none ml-auto hidden h-32 w-32 opacity-60 lg:block lg:h-40 lg:w-40"
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
          <path d="M50 90 V55" />
          <path d="M50 55 C 30 55 25 35 25 25 C 40 25 50 35 50 55" />
          <path
            d="M50 60 C 70 60 75 42 75 32 C 58 32 50 44 50 60"
            stroke="var(--color-moss)"
          />
        </g>
      </svg>
    </motion.div>
  );
}

export function OnboardingStep() {
  const setProfile = useIntakeStore((s) => s.setProfile);
  const next = useIntakeStore((s) => s.next);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<Sex | null>(null);

  const ageNumber = Number(age);
  const canContinue =
    age.trim() !== "" &&
    !Number.isNaN(ageNumber) &&
    ageNumber > 0 &&
    sex !== null;

  function handleContinue() {
    if (!canContinue || sex === null) return;
    setProfile({ name: name.trim() || undefined, age: ageNumber, sex });
    next();
  }

  const trimmedName = name.trim();
  const headline = trimmedName
    ? `Nice to meet you, *${trimmedName}*`
    : "Let's get your *hair story* started";

  return (
    <div className="relative mx-auto flex min-h-screen max-w-md flex-col gap-10 px-4 py-10 lg:max-w-6xl lg:justify-center lg:gap-0 lg:px-16 lg:py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={motionTransition()}
        className="flex flex-col gap-10 lg:grid lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-16"
      >
        <div className="lg:border-line/70 relative flex flex-col gap-6 lg:min-h-[22rem] lg:justify-center lg:border-r lg:pr-16">
          <h1 className="text-ink font-sans text-2xl leading-tight font-light lg:text-[2.75rem]">
            {renderEmphasis(headline)}
          </h1>
          <p className="text-ink-soft lg:max-w-sm">
            Just a couple of things so we ask you the right next few questions.
          </p>
          <Sprout />
        </div>

        <div className="flex flex-col gap-6">
          <label className="flex flex-col gap-1">
            <span className="text-ink-soft text-sm font-medium">
              Name <span className="font-normal">(optional)</span>
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Priya Sharma"
              className="border-line bg-card text-ink focus:border-copper h-11 rounded-lg border p-3 text-base focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-ink-soft text-sm font-medium">Age</span>
            <input
              type="number"
              inputMode="numeric"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 32"
              className="border-line bg-card text-ink focus:border-copper h-11 rounded-lg border p-3 text-base focus:outline-none"
            />
          </label>

          <div className="flex flex-col gap-2">
            <span className="text-ink-soft text-sm font-medium">Sex</span>
            <div className="flex flex-wrap gap-3" role="group">
              {SEX_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={sex === option.value}
                  onClick={() => setSex(option.value)}
                  className={[
                    "flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-base transition-colors",
                    sex === option.value
                      ? "bg-gradient-root-solid border-transparent text-white"
                      : "border-line bg-card text-ink hover:border-copper",
                  ].join(" ")}
                >
                  <SexIcon value={option.value} />
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={!canContinue}
            onClick={handleContinue}
            className="bg-gradient-root-solid min-h-11 rounded-full px-6 py-3 text-base font-semibold text-white shadow-[0_14px_26px_-12px_rgba(157,90,47,0.45)] transition-opacity disabled:opacity-40"
          >
            Continue
          </button>
        </div>
      </motion.div>
    </div>
  );
}
