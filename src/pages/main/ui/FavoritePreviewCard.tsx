import { cn } from "@/shared/lib/cn";
import { Icon } from "@/shared/ui/icon";
import { FavoritePreviewWeather } from "./FavoritePreviewWeather";
import { favoritePreviewPanelStyles } from "./styles";
import type { FavoritePreviewCardProps } from "./types";

export const FavoritePreviewCard = ({ bookmark, onClick }: FavoritePreviewCardProps) => {
  const title = bookmark.alias.trim() || bookmark.displayName;

  return (
    <article className={cn(favoritePreviewPanelStyles.card)}>
      <button
        type={"button"}
        className={cn(favoritePreviewPanelStyles.cardButton)}
        onClick={onClick}
      >
        <div className={"min-w-0"}>
          <p className={cn(favoritePreviewPanelStyles.cardTitle)}>{title}</p>
          <p className={cn(favoritePreviewPanelStyles.cardLocation)}>{bookmark.displayName}</p>
        </div>
        <Icon name={"arrowUp"} tone={"subtle"} className={cn(favoritePreviewPanelStyles.moreIcon)} />
      </button>
      <FavoritePreviewWeather bookmark={bookmark} />
    </article>
  );
};
