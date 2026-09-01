"use client";

interface NumberInputProps {
  value: number | null;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

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
    <div className="flex items-center gap-4">
      <button
        type="button"
        aria-label="Decrease"
        onClick={() => step(-1)}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-300 text-xl leading-none hover:border-indigo-400 dark:border-neutral-700"
      >
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        value={value ?? ""}
        min={min}
        max={max}
        onChange={(e) => handleInput(e.target.value)}
        className="h-11 w-24 rounded-lg border border-neutral-300 text-center text-lg dark:border-neutral-700 dark:bg-neutral-900"
      />
      <button
        type="button"
        aria-label="Increase"
        onClick={() => step(1)}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-300 text-xl leading-none hover:border-indigo-400 dark:border-neutral-700"
      >
        +
      </button>
    </div>
  );
}
