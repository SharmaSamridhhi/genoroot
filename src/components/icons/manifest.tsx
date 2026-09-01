import { AnimatedIcon } from "./AnimatedIcon";

interface IconProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

export function IconArrowLeft({ size, className, animate }: IconProps) {
  return (
    <AnimatedIcon size={size} className={className} animate={animate}>
      <path d="M19 12H5" />
      <path d="M11 18l-6-6 6-6" />
    </AnimatedIcon>
  );
}

export function IconCheck({ size, className, animate }: IconProps) {
  return (
    <AnimatedIcon size={size} className={className} animate={animate}>
      <path d="M20 6L9 17l-5-5" />
    </AnimatedIcon>
  );
}

export function IconUser({ size, className, animate }: IconProps) {
  return (
    <AnimatedIcon size={size} className={className} animate={animate}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4.5 5-6.5 8-6.5s6.5 2 8 6.5" />
    </AnimatedIcon>
  );
}

/** Section A — Personal & Family Hair Loss History */
export function IconHistory({ size, className, animate }: IconProps) {
  return (
    <AnimatedIcon size={size} className={className} animate={animate}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </AnimatedIcon>
  );
}

/** Section B — Hormonal & Health Influences */
export function IconPulse({ size, className, animate }: IconProps) {
  return (
    <AnimatedIcon size={size} className={className} animate={animate}>
      <path d="M3 12h4l2 6 4-14 2 8h6" />
    </AnimatedIcon>
  );
}

/** Section C — Lifestyle & Environmental Triggers */
export function IconLeaf({ size, className, animate }: IconProps) {
  return (
    <AnimatedIcon size={size} className={className} animate={animate}>
      <path d="M5 20c8 0 14-6 14-14V5h-1C10 5 4 11 4 19v1z" />
      <path d="M5 20L14 11" />
    </AnimatedIcon>
  );
}

/** Section D — Current Hair Care & Treatments */
export function IconDroplet({ size, className, animate }: IconProps) {
  return (
    <AnimatedIcon size={size} className={className} animate={animate}>
      <path d="M12 3s6 7 6 11.5A6 6 0 0 1 6 14.5C6 10 12 3 12 3z" />
    </AnimatedIcon>
  );
}

/** Section E — Sample Collection & Consent */
export function IconShield({ size, className, animate }: IconProps) {
  return (
    <AnimatedIcon size={size} className={className} animate={animate}>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
    </AnimatedIcon>
  );
}

export function IconMic({ size, className, animate }: IconProps) {
  return (
    <AnimatedIcon size={size} className={className} animate={animate}>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
    </AnimatedIcon>
  );
}

export const SECTION_ICONS: Record<
  "A" | "B" | "C" | "D" | "E",
  typeof IconHistory
> = {
  A: IconHistory,
  B: IconPulse,
  C: IconLeaf,
  D: IconDroplet,
  E: IconShield,
};
