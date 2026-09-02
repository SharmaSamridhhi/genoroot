"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useIntakeStore } from "@/lib/engine/store";
import { assembleOutput } from "@/lib/engine/assemble";
import { isComplete } from "@/lib/engine/completeness";
import { SummaryView } from "./SummaryView";
import { JsonView } from "./JsonView";

type ViewMode = "summary" | "json";

function PartyPopper() {
  return (
    <svg
      viewBox="0 0 40 40"
      width="30"
      height="30"
      aria-hidden="true"
      className="shrink-0"
    >
      <g
        fill="none"
        stroke="var(--color-copper-deep)"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 34 L15 18 L27 23 Z" />
        <circle
          cx="30"
          cy="10"
          r="1.4"
          fill="var(--color-copper)"
          stroke="none"
        />
        <circle
          cx="35"
          cy="20"
          r="1.2"
          fill="var(--color-moss)"
          stroke="none"
        />
        <circle cx="24" cy="8" r="1.1" fill="var(--color-moss)" stroke="none" />
        <path d="M29 16 L33 13" />
        <path d="M33 24 L38 24" />
        <path d="M20 6 L20 2" />
      </g>
    </svg>
  );
}

export function ReviewFlow() {
  const profile = useIntakeStore((s) => s.profile);
  const answers = useIntakeStore((s) => s.answers);
  const reset = useIntakeStore((s) => s.reset);
  const router = useRouter();

  const [view, setView] = useState<ViewMode>("summary");
  const [copied, setCopied] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  const complete = profile !== null && isComplete(profile, answers);

  // This screen only makes sense for a genuinely complete intake — if reached
  // directly (e.g. a stale bookmark, or mid-intake before GR-015 resumes the
  // patient), send them back rather than crashing on assembleOutput's
  // non-null profile requirement.
  useEffect(() => {
    if (!complete) {
      router.push("/intake");
    }
  }, [complete, router]);

  // The real action row is at the bottom of a potentially long summary —
  // this floating bar only exists to keep Copy/Download/Start over reachable
  // while scrolling through that summary, so it shows exactly when the real
  // row is out of view and hides once it's reachable again (including at the
  // very bottom, where showing both would be redundant).
  useEffect(() => {
    const el = actionsRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!profile || !complete) {
    return null;
  }

  const output = assembleOutput(profile, answers);
  const json = JSON.stringify(output, null, 2);

  async function handleCopy() {
    await navigator.clipboard.writeText(json);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  function handleDownload() {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "genoroot-intake.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleStartOver() {
    reset();
    router.push("/intake");
  }

  return (
    <>
      {/* Conditionally rendered rather than always-mounted-and-transformed:
          an always-mounted copy would put a second set of identically-
          labeled buttons in the accessibility tree even while visually
          hidden — a real screen-reader problem, not just a test-query one. */}
      {showStickyBar && (
        <div className="border-line bg-linen/95 fixed inset-x-0 top-0 z-10 flex justify-center gap-2 border-b px-4 py-3 backdrop-blur">
          <button
            type="button"
            onClick={handleCopy}
            className="border-line text-ink min-h-9 rounded-full border px-3 py-1 text-sm font-medium"
          >
            {copied ? "Copied!" : "Copy JSON"}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="border-line text-ink min-h-9 rounded-full border px-3 py-1 text-sm font-medium"
          >
            Download JSON
          </button>
          <button
            type="button"
            onClick={handleStartOver}
            className="border-line text-ink-soft min-h-9 rounded-full border px-3 py-1 text-sm font-medium"
          >
            Start over
          </button>
        </div>
      )}

      <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-4 py-8 lg:max-w-3xl lg:py-16">
        <header className="flex items-center gap-3">
          <PartyPopper />
          <div className="flex flex-col gap-1">
            <h1 className="text-ink font-sans text-2xl font-light lg:text-4xl">
              Intake{" "}
              <em className="font-display text-gradient-root font-medium italic not-italic">
                complete
              </em>
            </h1>
            <p className="text-ink-soft">
              Here&apos;s what {output.patient.name || "the patient"} shared,
              ready for the doctor.
            </p>
          </div>
        </header>

        {!output.sections.E.consent && (
          <div className="border-copper-soft bg-linen-2 text-copper-deep rounded-lg border p-3 text-sm">
            Sample collection requires consent — patient declined.
          </div>
        )}

        <div className="flex gap-2" role="tablist" aria-label="Output view">
          <button
            type="button"
            role="tab"
            aria-selected={view === "summary"}
            onClick={() => setView("summary")}
            className={`min-h-11 rounded-full border px-4 py-2 text-sm font-medium ${
              view === "summary"
                ? "bg-gradient-root-solid border-transparent text-white"
                : "border-line text-ink"
            }`}
          >
            Summary
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "json"}
            onClick={() => setView("json")}
            className={`min-h-11 rounded-full border px-4 py-2 text-sm font-medium ${
              view === "json"
                ? "bg-gradient-root-solid border-transparent text-white"
                : "border-line text-ink"
            }`}
          >
            Raw JSON
          </button>
        </div>

        {view === "summary" ? (
          <SummaryView output={output} />
        ) : (
          <JsonView json={json} />
        )}

        <div
          ref={actionsRef}
          className="border-line mt-4 flex flex-wrap gap-2 border-t pt-4"
        >
          <button
            type="button"
            onClick={handleCopy}
            className="border-line text-ink min-h-11 rounded-full border px-4 py-2 text-sm font-medium"
          >
            {copied ? "Copied!" : "Copy JSON"}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="border-line text-ink min-h-11 rounded-full border px-4 py-2 text-sm font-medium"
          >
            Download JSON
          </button>
          <button
            type="button"
            onClick={handleStartOver}
            className="border-line text-ink-soft min-h-11 rounded-full border px-4 py-2 text-sm font-medium"
          >
            Start over
          </button>
        </div>
      </div>
    </>
  );
}
