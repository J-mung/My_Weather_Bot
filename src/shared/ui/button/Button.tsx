import { cn } from "@/shared/lib/cn";
import type { ButtonProps } from "./button.types";
import { buttonVariants } from "./button.variants";

export const Button = ({ variant, size, className, children, ...props }: ButtonProps) => {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {children}
    </button>
  );
};
