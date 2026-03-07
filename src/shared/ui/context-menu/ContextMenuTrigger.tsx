import { cn } from "@/shared/lib/cn";
import type { ContextMenuTriggerProps } from "./context-menu.types";
import { contextMenuTriggerVariants } from "./context-menu.variants";
import { useContextMenu } from "./ContextMenu";

export const ContextMenuTrigger = ({
  className,
  fullWidth,
  children,
  onClick,
  ...props
}: ContextMenuTriggerProps) => {
  const { open, setOpen } = useContextMenu();

  return (
    <div
      className={cn(contextMenuTriggerVariants({ fullWidth }), className)}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
        setOpen(!open);
      }}
      {...props}
    >
      {children}
    </div>
  );
};
