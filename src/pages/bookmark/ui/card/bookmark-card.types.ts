import type { VariantProps } from "class-variance-authority";
import type { HTMLAttributes, ReactNode } from "react";
import type {
  bookmarkCardLocationVariants,
  bookmarkCardTitleVariants,
} from "./bookmark-card.variants";

export type BookmarkCardProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  locationLabel: string;
  nx: number;
  ny: number;
  isEditing: boolean;
  summary: ReactNode;
  actions?: ReactNode;
  editForm?: ReactNode;
};

export type BookmarkCardTitleProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof bookmarkCardTitleVariants> & {
    children: ReactNode;
  };

export type BookmarkCardLocationProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof bookmarkCardLocationVariants> & {
    children: ReactNode;
  };
