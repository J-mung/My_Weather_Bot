import { cva } from "class-variance-authority";

export const contextMenuTriggerVariants = cva([], {
  variants: {
    fullWidth: {
      true: ["w-full"],
      false: [],
    },
  },
  defaultVariants: {
    fullWidth: false,
  },
});

export const contextMenuContentVariants = cva(
  [
    "absolute",
    "top-10",
    "z-20",
    "min-w-32",
    "rounded-xl",
    "border",
    "p-1",
    "shadow-lg",
    "border-[var(--line)]",
    "bg-white",
  ],
  {
    variants: {
      align: {
        start: ["left-0"],
        end: ["right-0"],
      },
    },
    defaultVariants: {
      align: "end",
    },
  },
);

export const contextMenuItemVariants = cva(
  [
    "flex",
    "w-full",
    "items-center",
    "justify-start",
    "gap-2",
    "rounded-lg",
    "px-3",
    "py-2",
    "text-left",
    "text-sm",
    "font-semibold",
    "transition",
    "cursor-pointer",
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "disabled:pointer-events-none",
    "disabled:opacity-50",
  ],
  {
    variants: {
      tone: {
        default: ["text-[var(--text-main)]", "hover:bg-slate-100", "focus-visible:ring-slate-200"],
        danger: ["text-red-600", "hover:bg-red-50", "focus-visible:ring-red-200"],
      },
      inset: {
        true: ["pl-8"],
        false: [],
      },
    },
    defaultVariants: {
      tone: "default",
      inset: false,
    },
  },
);
