import { cva } from "class-variance-authority";

export const bookmarkCardClass = [
  "rounded-2xl",
  "border",
  "border-[var(--line)]",
  "bg-[var(--surface)]",
  "p-5 shadow-sm",
  "transition",
  "cursor-pointer",
  "hover:shadow-md",
  "active:ring-[var(--accent)]",
  "active:ring-2",
];

export const bookmarkCardHeaderClass = ["flex", "items-start", "justify-between", "gap-3"];

export const bookmarkCardTitleVariants = cva(
  ["block", "leading-tight", "text-[var(--text-main)]"],
  {
    variants: {
      size: {
        sm: ["text-lg", "font-semibold"],
        md: ["text-xl", "font-bold"],
        lg: ["text-2xl", "font-extrabold"],
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export const bookmarkCardLocationVariants = cva(["mt-1", "block", "text-[var(--text-sub)]"], {
  variants: {
    size: {
      sm: ["text-sm"],
      md: ["text-base"],
      lg: ["text-lg"],
    },
  },
  defaultVariants: {
    size: "sm",
  },
});

export const bookmarkCardCaptionClass = ["block", "min-w-7xl"];

export const bookmarkCardTempClass = ["block", "text-xs", "text-[var(--text-sub)]"];

export const bookmarkCardBtnListClass = ["mt-3", "flex", "items-center", "justify-end", "gap-2"];
