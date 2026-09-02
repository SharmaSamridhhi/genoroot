"use client";

const COPPER: [number, number, number] = [193, 114, 62];
const MOSS: [number, number, number] = [47, 107, 79];

function barColor(t: number): string {
  const r = Math.round(COPPER[0] + (MOSS[0] - COPPER[0]) * t);
  const g = Math.round(COPPER[1] + (MOSS[1] - COPPER[1]) * t);
  const b = Math.round(COPPER[2] + (MOSS[2] - COPPER[2]) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

interface VoiceVisualizerProps {
  levels: number[];
  transcript: string;
}

/**
 * A proper equalizer, not a token "something is happening" indicator — 24
 * independently-driven bars (see useVoiceInput's per-band `levels`), sized
 * and colored to actually read as reacting to speech in real time. Sits in
 * its own card once listening starts, replacing the old inline "Listening…"
 * line, which had no room to show this kind of detail.
 */
export function VoiceVisualizer({ levels, transcript }: VoiceVisualizerProps) {
  const barCount = levels.length;

  return (
    <div className="border-copper-soft bg-sage relative flex flex-col gap-3 overflow-hidden rounded-2xl border p-4">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
        </span>
        <span className="text-ink-soft text-xs font-medium tracking-wide uppercase">
          Listening
        </span>
      </div>

      <div className="flex h-16 items-center justify-center gap-[3px] sm:h-20 sm:gap-1">
        {levels.map((level, i) => {
          const t = barCount > 1 ? i / (barCount - 1) : 0;
          const height = Math.max(0.06, level);
          return (
            <span
              key={i}
              className="w-1.5 rounded-full sm:w-2"
              style={{
                height: `${height * 100}%`,
                backgroundColor: barColor(t),
                boxShadow: level > 0.5 ? `0 0 10px 0 ${barColor(t)}66` : "none",
                transition: "height 80ms ease-out, box-shadow 120ms ease-out",
              }}
            />
          );
        })}
      </div>

      <p
        className="text-ink min-h-[1.5em] text-center text-sm"
        aria-live="polite"
      >
        {transcript || "Go ahead, I'm listening…"}
      </p>
    </div>
  );
}
