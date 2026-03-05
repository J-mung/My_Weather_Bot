import { cn } from "@/shared/lib/cn";
import type { ButtonProps } from "./button.types";
import { buttonVariants } from "./button.variants";

export const Button = ({ variant, selected, size, className, children, disabled, ...props }: ButtonProps) => {
  return (
    <button
      className={cn(buttonVariants({ variant, selected, size }), className)}
      disabled={disabled}
      aria-pressed={selected ?? undefined}
      {...props}
    >
      {children}
    </button>
  );
};
