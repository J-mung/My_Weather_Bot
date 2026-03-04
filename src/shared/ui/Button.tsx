import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, FC } from "react";
import { cn } from "../lib/cn";

export const ButtonVariants = cva(
  // 모든 경우에 공통으로 들어갈 CSS
  `
  flex justify-center items-center active:scale-95 rounded-xl
  text-sm font-bold text-slate-100 transition-all shadow-md
  hover:scale-105 duration-200
  `,
  {
    // variant, size별 디자인
    variants: {
      variant: {
        default: "active:scale-100",
        grey: "bg-slate-300",
        blue: "bg-blue-400",
        red: "bg-red-400",
      },
      size: {
        default: "",
        md: " w-[6rem] h-[2rem] text-[1rem] rounded-md",
        lg: "w-[221rem] h-[7rem] text-[2rem] rounded-3xl",
        wlg: "w-[24rem] h-[5rem] text-[2rem]",
        rounded: "w-[6rem] h-[6rem] rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    // Button의 속성을 타입지정을 통해 손쉽게 사용
    VariantProps<typeof ButtonVariants> {
  label?: string;
  children?: React.ReactElement;
  additionalClass?: string;
}

const Button: FC<ButtonProps> = ({ variant, size, children, label, additionalClass, ...props }) => {
  return (
    <button className={cn(ButtonVariants({ variant, size }), additionalClass)} {...props}>
      {children && children}
      {label && label}
    </button>
  );
};

export default Button;
