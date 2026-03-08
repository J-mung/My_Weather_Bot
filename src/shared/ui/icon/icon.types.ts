import type { VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import type { IconName } from "./icon.registry";
import type { iconVariants } from "./icon.variants";

export type IconProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof iconVariants> & { name: IconName; alt?: string };
