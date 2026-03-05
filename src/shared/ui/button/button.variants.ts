import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  // 모든 경우에 공통으로 들어갈 CSS
  `inline-flex items-center justify-center rounded-xl
  font-bold transition-all duration-200 active:scale-95
  disabled:pointer-events-none disabled:opacity-50
  focus-visible:outline-none focus-visible:ring-2`,
  {
    // variant, size별 디자인
    variants: {
      variant: {
        default: "bg-slate-700 text-white hover:bg-slate-600",
        grey: "bg-slate-300 text-slate-900 hover:bg-slate-200",
        blue: "bg-blue-500 text-white hover:bg-blue-400",
        red: "bg-red-500 text-white hover:bg-red-400",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-base",
        lg: "h-12 px-6 text-lg",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);
