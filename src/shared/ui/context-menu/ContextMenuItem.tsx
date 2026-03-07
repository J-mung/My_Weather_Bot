import { cn } from "@/shared/lib/cn";
import type { ContextMenuItemProps } from "./context-menu.types";
import { contextMenuItemVariants } from "./context-menu.variants";
import { useContextMenu } from "./ContextMenu";

export const ContextMenuItem = ({
  tone,
  inset,
  className,
  onClick,
  onSelect,
  children,
  ...props
}: ContextMenuItemProps) => {
  const { setOpen } = useContextMenu();

  return (
    <button
      type={"button"}
      role={"menuitem"}
      className={cn(contextMenuItemVariants({ tone, inset }), className)}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
        onSelect?.();
        setOpen(false);
      }}
      {...props}
    >
      {children}
    </button>
  );
};
