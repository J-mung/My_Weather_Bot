import { cva } from "class-variance-authority";

export const inputVariants = cva(
  [
    "rounded-xl",
    "shadow-lg",
    "shadow-gray-500/25",
    "w-full",
    "bg-[var(--surface)]",
    "px-4",
    "py-3",
    "text-sm",
    "outline-none",
    "transition",
    // Focus
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    // Disable
    "disabled:cursor-not-allowed",
    "disabled:opacity-50",
    "disabled:pointer-events-none",
  ],
  {
    variants: {
      variant: {
        default: ["border", "border-[var(--line)]", "focus-visible:ring-[var(--accent)]"],
        error: ["border", "border-[var(--danger)]", "focus-visible:ring-[var(--danger)]"],
        success: ["border", "border-[var(--accent)]", "focus-visible:ring-[var(--accent)]"],
      },
    },
    // 기본 variant 적용
    defaultVariants: {
      variant: "default",
    },
  },
);
