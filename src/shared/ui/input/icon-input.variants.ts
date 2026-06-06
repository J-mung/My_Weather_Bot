import { cva } from "class-variance-authority";

export const iconInputVariants = cva(
  [
    "flex",
    "w-full",
    "min-h-16",
    "items-center",
    "gap-2",
    "rounded-xl",
    "border",
    "shadow-lg",
    "bg-[var(--surface)]",
    "px-4",
    "py-3",
    "transition",
    "cursor-text",
    "shadow-gray-500/10",
    "outline-none",
    "has-[input:read-only]:cursor-pointer",
    // Disable
    "has-[input:disabled]:cursor-not-allowed",
    "has-[input:disabled]:opacity-50",
    "has-[input:disabled]:pointer-events-none",
  ],
  {
    variants: {
      variant: {
        default: [
          "border-none",
          "hover:border-[var(--accent)]",
          "hover:ring-2",
          "hover:ring-[var(--accent)]/80",
          "focus-within:border-[var(--accent)]",
          "focus-within:ring-2",
          "focus-within:ring-[var(--accent)]/50",
        ],
        error: [
          "border-[var(--danger)]",
          "ring-2",
          "ring-[var(--danger)]/30",
          "hover:border-[var(--danger)]",
          "hover:ring-2",
          "hover:ring-[var(--danger)]/80",
          "focus-within:border-[var(--danger)]",
          "focus-within:ring-2",
          "focus-within:ring-[var(--danger)]/50",
        ],
        success: [
          "border-[var(--accent)]",
          "ring-2",
          "ring-[var(--accent)]/30",
          "hover:border-[var(--accent)]",
          "hover:ring-2",
          "hover:ring-[var(--accent)]/80",
          "focus-within:border-[var(--accent)]",
          "focus-within:ring-2",
          "focus-within:ring-[var(--accent)]/50",
        ],
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export const inputElementVariants = [
  "flex-1",
  "bg-transparent",
  "border-0",
  "outline-none",
  "p-0",
  "text-base",
  "text-[var(--text-primary)]",
  "placeholder:text-[var(--text-muted)]",
  "read-only:cursor-pointer",
  "disabled:cursor-not-allowed",
];

export const buttonElementVariants = [
  "flex",
  "h-10",
  "w-10",
  "rounded-full",
  "shrink-0",
  "justify-center",
  "items-center",
  "cursor-pointer",
  // Hover
  "hover:border-[var(--btn-secondary-border-hover)]",
  "hover:bg-[var(--btn-secondary-bg-hover)]",
  "hover:text-[var(--btn-secondary-text-hover)]",
  // Active
  "active:border-[var(--btn-secondary-border-active)]",
  "active:bg-[var(--btn-secondary-bg-active)]",
  "active:text-[var(--btn-secondary-text-active)]",
  // Focus
  "focus-visible:ring-[var(--btn-secondary-ring)]",
];
