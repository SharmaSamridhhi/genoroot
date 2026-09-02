"use client";

interface VoiceVisualizerProps {
  levels: number[];
  transcript: string;
}

/**
 * Just the waveform — no card, no border, no label, no gradient, no glow.
 * Matches the same thin-line, low-opacity "background texture" register as
 * QuestionArt/HabitRowArt elsewhere in the app rather than standing out as
 * its own UI element. Taller than the old inline row for real visibility,
 * but restrained in every other dimension: one muted color, thin bars.
 */
export function VoiceVisualizer({ levels, transcript }: VoiceVisualizerProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex h-12 items-center gap-[2px]" aria-hidden="true">
        {levels.map((level, i) => {
          const height = Math.max(0.05, level);
          return (
            <span
              key={i}
              className="bg-ink-soft w-[2px] rounded-full opacity-40"
              style={{
                height: `${height * 100}%`,
                transition: "height 80ms ease-out",
              }}
            />
          );
        })}
      </div>

      <p className="text-ink-soft min-h-[1.5em] text-sm" aria-live="polite">
        {transcript || "Listening…"}
      </p>
    </div>
  );
}
