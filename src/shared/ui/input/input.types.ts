import type { VariantProps } from "class-variance-authority";
import type { ComponentPropsWithRef } from "react";
import type { IconName } from "../icon";
import type { iconVariants } from "../icon/icon.variants";
import type { iconInputVariants } from "./icon-input.variants";
import type { inputVariants } from "./input.variants";

export type InputProps = ComponentPropsWithRef<"input"> & VariantProps<typeof inputVariants>;

type IconVariantsProps = VariantProps<typeof iconVariants>;

export type IconInputProps = Omit<ComponentPropsWithRef<"input">, "size"> &
  VariantProps<typeof iconInputVariants> & {
    disabled?: boolean;
    onCallback?: () => void;
    showIconButton?: boolean;
    iconName?: IconName;
    iconTone?: IconVariantsProps["tone"];
    iconSize?: IconVariantsProps["size"];
  };
