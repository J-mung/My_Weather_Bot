import { cn } from "@/shared/lib/cn";
import type {
  BookmarkCardLocationProps,
  BookmarkCardProps,
  BookmarkCardTitleProps,
} from "./bookmark-card.types";
import {
  bookmarkCardBtnListClass,
  bookmarkCardCaptionClass,
  bookmarkCardClass,
  bookmarkCardHeaderClass,
  bookmarkCardLocationVariants,
  bookmarkCardTempClass,
  bookmarkCardTitleVariants,
} from "./bookmark-card.variants";

export const BookmarkCardTitle = ({
  size,
  className,
  children,
  ...props
}: BookmarkCardTitleProps) => {
  return (
    <span className={cn(bookmarkCardTitleVariants({ size }), className)} {...props}>
      {children}
    </span>
  );
};

export const BookmarkCardLocation = ({
  size,
  className,
  children,
  ...props
}: BookmarkCardLocationProps) => {
  return (
    <span className={cn(bookmarkCardLocationVariants({ size }), className)} {...props}>
      {children}
    </span>
  );
};

export const BookmarkCard = ({
  title,
  locationLabel,
  nx,
  ny,
  isEditing,
  summary,
  actions,
  editForm,
  className,
  ...props
}: BookmarkCardProps) => {
  return (
    <div className={cn(bookmarkCardClass, className)} {...props}>
      {!isEditing ? (
        <>
          <div className={cn(bookmarkCardHeaderClass)}>
            <div className={"flex-1"}>
              <BookmarkCardTitle className={"truncate"}>{title}</BookmarkCardTitle>
              <BookmarkCardLocation className={"truncate"}>{locationLabel}</BookmarkCardLocation>
            </div>
            <div className={cn(bookmarkCardCaptionClass)}>
              <span className={cn(bookmarkCardTempClass)}>
                nx: {nx}, ny: {ny}
              </span>
            </div>
          </div>
          {summary}
          {actions && <div className={cn(bookmarkCardBtnListClass)}>{actions}</div>}
        </>
      ) : (
        editForm
      )}
    </div>
  );
};
