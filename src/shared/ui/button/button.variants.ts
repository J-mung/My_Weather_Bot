import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  // 모든 경우에 공통으로 들어갈 CSS
  `inline-flex items-center justify-center rounded-xl border
   font-bold transition-all duration-200 active:scale-95 cursor-pointer
   disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed
   focus-visible:outline-none focus-visible:ring-2`,
  {
    // variant, selected, size별 디자인
    variants: {
      variant: {
        primary:
          "border-[var(--btn-primary-border)] bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:border-[var(--btn-primary-border-hover)] hover:bg-[var(--btn-primary-bg-hover)] active:border-[var(--btn-primary-border-active)] active:bg-[var(--btn-primary-bg-active)] focus-visible:ring-[var(--btn-primary-ring)]",
        secondary:
          "border-[var(--btn-secondary-border)] bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-text)] hover:border-[var(--btn-secondary-border-hover)] hover:bg-[var(--btn-secondary-bg-hover)] hover:text-[var(--btn-secondary-text-hover)] active:border-[var(--btn-secondary-border-active)] active:bg-[var(--btn-secondary-bg-active)] active:text-[var(--btn-secondary-text-active)] focus-visible:ring-[var(--btn-secondary-ring)]",
        ghost:
          "border-[var(--btn-ghost-border)] bg-[var(--btn-ghost-bg)] text-[var(--btn-ghost-text)] hover:bg-[var(--btn-ghost-bg-hover)] hover:text-[var(--btn-ghost-text-hover)] active:bg-[var(--btn-ghost-bg-active)] active:text-[var(--btn-ghost-text-hover)] focus-visible:ring-[var(--btn-ghost-ring)]",
        danger:
          "border-[var(--btn-danger-border)] bg-[var(--btn-danger-bg)] text-[var(--btn-danger-text)] hover:border-[var(--btn-danger-border-hover)] hover:bg-[var(--btn-danger-bg-hover)] active:border-[var(--btn-danger-border-active)] active:bg-[var(--btn-danger-bg-active)] focus-visible:ring-[var(--btn-danger-ring)]",
      },
      selected: {
        true: "",
        false: "",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-base",
        lg: "h-12 px-6 text-lg",
        icon: "h-10 w-10 rounded-full",
      },
    },
    // 2개 이상 variant 조합일 때 적용
    compoundVariants: [
      {
        variant: "primary",
        selected: true,
        className:
          "border-[var(--btn-primary-border-active)] bg-[var(--btn-primary-bg-active)] ring-2 ring-[var(--btn-primary-ring-selected)]",
      },
      {
        variant: "secondary",
        selected: true,
        className:
          "border-[var(--btn-secondary-border-active)] bg-[var(--btn-secondary-bg-active)] text-[var(--btn-secondary-text-active)] ring-2 ring-[var(--btn-secondary-ring)]",
      },
      {
        variant: "ghost",
        selected: true,
        className:
          "bg-[var(--btn-ghost-bg-active)] text-[var(--btn-ghost-text-hover)] ring-2 ring-[var(--btn-ghost-ring)]",
      },
      {
        variant: "danger",
        selected: true,
        className:
          "border-[var(--btn-danger-border-active)] bg-[var(--btn-danger-bg-active)] ring-2 ring-[var(--btn-danger-ring)]",
      },
    ],
    defaultVariants: {
      variant: "primary",
      selected: false,
      size: "md",
    },
  },
);
