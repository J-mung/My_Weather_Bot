import type { VariantProps } from "class-variance-authority";
import type { ComponentPropsWithRef } from "react";
import type { inputVariants } from "./input.variants";

export type InputProps = ComponentPropsWithRef<"input"> & VariantProps<typeof inputVariants>;
