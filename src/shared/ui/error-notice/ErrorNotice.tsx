import { forwardRef, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { ErrorCode } from "@/shared/ui/error-code";
import { Icon, type IconName, type IconProps } from "@/shared/ui/icon";
import { errorNoticeStyles } from "./styles";

type ErrorNoticeVariant = keyof typeof errorNoticeStyles.variant;

export type ErrorNoticeProps = {
  title: string;
  description: string;
  code?: string | null;
  action?: ReactNode;
  className?: string;
  iconName?: IconName;
  iconSize?: IconProps["size"];
  iconTone?: IconProps["tone"];
  variant?: ErrorNoticeVariant;
};

export const ErrorNotice = forwardRef<HTMLDivElement, ErrorNoticeProps>(
  (
    {
      title,
      description,
      code,
      action,
      className,
      iconName = "error",
      iconSize = "sm",
      iconTone = "danger",
      variant = "inline",
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(errorNoticeStyles.root, errorNoticeStyles.variant[variant], className)}
      >
        <span className={cn(errorNoticeStyles.title)}>
          <Icon
            name={iconName}
            size={iconSize}
            tone={iconTone}
            className={cn(errorNoticeStyles.titleIcon)}
          />
          <span>{title}</span>
        </span>
        <span className={cn(errorNoticeStyles.description)}>
          {description}
          {code && <ErrorCode code={code} />}
        </span>
        {action && <span className={cn(errorNoticeStyles.actions)}>{action}</span>}
      </div>
    );
  },
);

ErrorNotice.displayName = "ErrorNotice";
