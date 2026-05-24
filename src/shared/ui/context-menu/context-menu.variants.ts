import { cva } from "class-variance-authority";

export const contextMenuTriggerVariants = cva(["cursor-pointer"], {
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
    "mb-1",
    "gap-2",
    "rounded-lg",
    "px-3",
    "py-2",
    "text-left",
    "text-sm",
    "font-semibold",
    "transition",
    // Active
    "active:scale-95",
    "cursor-pointer",
    // Focus
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    // Disabled
    "disabled:pointer-events-none",
    "disabled:opacity-50",
    "disabled:cursor-not-allowed",
  ],
  {
    variants: {
      tone: {
        default: [
          "text-[var(--context-menu-item-default-text)]",
          "bg-[var(--context-menu-item-default-bg)]",
          "hover:bg-[var(--context-menu-item-default-bg-hover)]",
          "active:bg-[var(--context-menu-item-default-bg-active)]",
          "focus-visible:ring-[var(--context-menu-item-default-ring-focus)]",
        ],
        danger: [
          "text-[var(--context-menu-item-danger-text)]",
          "bg-[var(--context-menu-item-danger-bg)]",
          "hover:bg-[var(--context-menu-item-danger-bg-hover)]",
          "active:bg-[var(--context-menu-item-danger-bg-active)]",
          "focus-visible:ring-[var(--context-menu-item-danger-ring-focus)]",
        ],
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
