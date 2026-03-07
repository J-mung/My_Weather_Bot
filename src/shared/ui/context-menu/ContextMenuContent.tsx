import { cn } from "@/shared/lib/cn";
import type { ContextMenuContentProps } from "./context-menu.types";
import { contextMenuContentVariants } from "./context-menu.variants";
import { useContextMenu } from "./ContextMenu";

export const ContextMenuContent = ({
  className,
  align,
  children,
  ...props
}: ContextMenuContentProps) => {
  const { open } = useContextMenu();

  if (!open) {
    return null;
  }

  return (
    <div role={"menu"} className={cn(contextMenuContentVariants({ align }), className)} {...props}>
      {children}
    </div>
  );
};
