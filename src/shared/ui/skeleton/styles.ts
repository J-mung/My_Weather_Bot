export const skeletonStyles = {
  base: ["relative", "overflow-hidden", "bg-[var(--surface-soft)]"],
  shimmer: [
    "absolute",
    "inset-0",
    "-translate-x-full",
    "animate-[skeleton-shimmer_1.6s_infinite]",
    "bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.55),transparent)]",
  ],
} as const;

export const skeletonRoundedStyles = {
  sm: "rounded-md",
  md: "rounded-xl",
  lg: "rounded-2xl",
  full: "rounded-full",
} as const;
