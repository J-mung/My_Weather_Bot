// src/shared/ui/input/Input.tsx
import { cn } from "@/shared/lib/cn";
import type { InputProps } from "./input.types";
import { inputVariants } from "./input.variants";

export const Input = ({ variant = "default", className, disabled, ref, ...props }: InputProps) => {
  return (
    <input
      ref={ref}
      disabled={disabled}
      className={cn(inputVariants({ variant }), className)}
      {...props}
    />
  );
};
