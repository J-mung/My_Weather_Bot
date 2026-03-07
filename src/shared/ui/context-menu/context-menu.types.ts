import type { VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import type {
  contextMenuContentVariants,
  contextMenuItemVariants,
  contextMenuTriggerVariants,
} from "./context-menu.variants";

export type ContextMenuProps = {
  open?: boolean; // 열림 상태를 외부에서 관리
  defaultOpen?: boolean; // 열림 상태를 내부에서 관리
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
};

export type ContextMenuTriggerProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof contextMenuTriggerVariants> & {
    children: ReactNode;
  };

export type ContextMenuContentProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof contextMenuContentVariants>;

export type ContextMenuItemProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onSelect"> &
  VariantProps<typeof contextMenuItemVariants> & {
    onSelect?: () => void;
    children: ReactNode;
  };
