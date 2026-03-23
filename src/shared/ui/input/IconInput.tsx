import { cn } from "@/shared/lib/cn";
import { useId } from "react";
import { Icon } from "../icon";
import {
  buttonElementVariants,
  iconInputVariants,
  inputElementVariants,
} from "./icon-input.variants";
import type { IconInputProps } from "./input.types";

export const IconInput = ({
  variant,
  disabled = false,
  onCallback = () => {},
  showIconButton = false,
  iconName = "close",
  iconTone = "default",
  iconSize = "md",
  ...props
}: IconInputProps) => {
  const id = useId();

  return (
    <label htmlFor={`input_${id}`} className={cn(iconInputVariants({ variant }))}>
      <input
        id={`input_${id}`}
        className={cn(inputElementVariants)}
        disabled={disabled}
        {...props}
      />
      {showIconButton ? (
        <button type={"button"} className={cn(buttonElementVariants)} onClick={onCallback}>
          <Icon name={iconName} size={iconSize} tone={iconTone} />
        </button>
      ) : null}
    </label>
  );
};
