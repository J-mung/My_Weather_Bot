import { cva } from "class-variance-authority";

export const iconVariants = cva(["inline-block", "shrink-0", "bg-current"], {
  variants: {
    size: {
      sm: ["h-4", "w-4"],
      md: ["h-5", "w-5"],
      lg: ["h-6", "w-6"],
    },
    tone: {
      current: ["text-current"],
      default: ["text-[var(--icon-default)]"],
      subtle: ["text-[var(--icon-subtle)]"],
      brand: ["text-[var(--icon-brand)]"],
      danger: ["text-[var(--icon-danger)]"],
    },
  },
  defaultVariants: {
    size: "md",
    tone: "current",
  },
});
