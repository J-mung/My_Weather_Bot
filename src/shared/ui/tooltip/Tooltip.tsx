import { useState, type ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

type TooltipAlign = "start" | "center";

type TooltipProps = {
  children: ReactNode;
  content: string;
  align?: TooltipAlign;
  className?: string;
  tooltipClassName?: string;
};

const tooltipAlignClass: Record<TooltipAlign, string[]> = {
  start: ["left-0"],
  center: ["left-1/2", "-translate-x-1/2"],
};

export const Tooltip = ({
  children,
  content,
  align = "start",
  className,
  tooltipClassName,
}: TooltipProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!content) {
    return children;
  }

  return (
    <span
      className={cn("relative", "inline-flex", "min-w-0", "max-w-full", className)}
      tabIndex={0}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onBlur={() => setIsOpen(false)}
    >
      <span className={cn("block", "min-w-0", "w-full", "max-w-full")}>{children}</span>
      <span
        role={"tooltip"}
        className={cn(
          "pointer-events-none",
          "absolute",
          "top-full",
          "z-30",
          "mt-2",
          "max-w-[min(24rem,calc(100vw-2rem))]",
          "rounded-lg",
          "border",
          "border-[var(--line)]",
          "bg-[var(--text-main)]",
          "px-3",
          "py-2",
          "text-xs",
          "font-semibold",
          "leading-5",
          "text-white",
          "shadow-lg",
          isOpen ? ["visible", "opacity-100"] : ["invisible", "opacity-0"],
          tooltipAlignClass[align],
          tooltipClassName,
        )}
      >
        {content}
      </span>
    </span>
  );
};
