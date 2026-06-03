import { cn } from "@/shared/lib/cn";
import { Icon, type IconName, type IconProps } from "@/shared/ui/icon";
import type { ReactNode } from "react";
import { Button } from "./Button";
import type { ButtonProps } from "./button.types";

type IconButtonProps = Omit<ButtonProps, "children"> & {
  children?: ReactNode;
  iconClassName?: string;
  iconName: IconName;
  iconPosition?: "start" | "end";
  iconSize?: IconProps["size"];
  iconTone?: IconProps["tone"];
};

export const IconButton = ({
  children,
  className,
  iconClassName,
  iconName,
  iconPosition = "start",
  iconSize = "sm",
  iconTone,
  ...props
}: IconButtonProps) => {
  const icon = (
    <Icon
      name={iconName}
      size={iconSize}
      tone={iconTone}
      className={cn(iconClassName)}
    />
  );

  return (
    <Button className={cn("gap-1", className)} {...props}>
      {iconPosition === "start" && icon}
      {children}
      {iconPosition === "end" && icon}
    </Button>
  );
};

export type { IconButtonProps };
