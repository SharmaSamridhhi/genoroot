"use client";

interface NumberInputProps {
  value: number | null;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

// Direct typing is the primary path — the number field is large, autofocused,
// and opens the numeric keyboard on mobile — with the +/- buttons kept small
// and secondary for a quick one-off nudge. The original design gave the
// stepper equal visual weight, which invited tapping "+" dozens of times to
// reach a realistic age instead of just typing it.
export function NumberInput({
  value,
  onChange,
  min = 1,
  max = 100,
}: NumberInputProps) {
  function clamp(n: number) {
    return Math.min(max, Math.max(min, n));
  }

  function step(delta: number) {
    const base = value ?? min;
    onChange(clamp(base + delta));
  }

  function handleInput(raw: string) {
    const parsed = Number(raw);
    if (Number.isNaN(parsed)) return;
    onChange(clamp(parsed));
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        aria-label="Decrease"
        onClick={() => step(-1)}
        className="border-line text-ink-soft hover:border-copper flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-base leading-none"
      >
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        autoFocus
        value={value ?? ""}
        min={min}
        max={max}
        placeholder="—"
        onChange={(e) => handleInput(e.target.value)}
        className="border-line bg-card text-ink focus:border-copper h-16 w-32 rounded-xl border-2 text-center font-mono text-4xl focus:outline-none"
      />
      <button
        type="button"
        aria-label="Increase"
        onClick={() => step(1)}
        className="border-line text-ink-soft hover:border-copper flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-base leading-none"
      >
        +
      </button>
    </div>
  );
}
