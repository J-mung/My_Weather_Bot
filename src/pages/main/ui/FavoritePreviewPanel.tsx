import { useBookmarkSummary } from "@/features/bookmark/model/useBookmarkSummary";
import { cn } from "@/shared/lib/cn";
import Button from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";
import { Skeleton } from "@/shared/ui/skeleton";
import { favoritePreviewPanelStyles } from "./styles";
import type { FavoritePreviewCardProps, FavoritePreviewPanelProps } from "./types";

const MAX_PREVIEW_COUNT = 3;

const formatTemperature = (value: number | null): string => {
  if (value === null) {
    return "--°";
  }

  return `${value}°`;
};

const formatRange = (min: number, max: number): string => `H: ${max}° · L: ${min}°`;

const FavoritePreviewCard = ({ bookmark, onClick }: FavoritePreviewCardProps) => {
  const { data, isLoading, isFetching, error } = useBookmarkSummary({
    nx: bookmark.nx,
    ny: bookmark.ny,
  });
  const title = bookmark.alias.trim() || bookmark.displayName;

  return (
    <button
      type={"button"}
      className={cn(
        favoritePreviewPanelStyles.card,
        isFetching && favoritePreviewPanelStyles.fetching,
      )}
      onClick={onClick}
    >
      <div className={cn(favoritePreviewPanelStyles.cardHeader)}>
        <div className={"min-w-0"}>
          <p className={cn(favoritePreviewPanelStyles.cardTitle)}>{title}</p>
          <p className={cn(favoritePreviewPanelStyles.cardLocation)}>{bookmark.displayName}</p>
        </div>
        <Icon
          name={"moreHoriz"}
          tone={"subtle"}
          className={cn(favoritePreviewPanelStyles.moreIcon)}
        />
      </div>

      {isLoading && (
        <div className={cn(favoritePreviewPanelStyles.cardWeather)}>
          <Skeleton className={"h-8 w-16"} />
          <Skeleton className={"h-5 w-24"} />
        </div>
      )}

      {!isLoading && error && (
        <div className={cn(favoritePreviewPanelStyles.cardWeather)}>
          <Icon name={"cloudAlert"} tone={"danger"} />
          <span className={cn(favoritePreviewPanelStyles.errorText)}>{error.meta.title}</span>
        </div>
      )}

      {!isLoading && !error && data && (
        <div className={cn(favoritePreviewPanelStyles.cardWeather)}>
          <div className={cn(favoritePreviewPanelStyles.temperatureGroup)}>
            <Icon
              name={"cloud"}
              tone={"subtle"}
              className={cn(favoritePreviewPanelStyles.weatherIcon)}
            />
            <span className={cn(favoritePreviewPanelStyles.temperature)}>
              {formatTemperature(data.temperature)}
            </span>
          </div>
          <span className={cn(favoritePreviewPanelStyles.range)}>
            {formatRange(data.todayMin, data.todayMax)}
          </span>
        </div>
      )}
    </button>
  );
};

export const FavoritePreviewPanel = ({
  bookmarks,
  onBookmarkClick,
  onAddClick,
  onManageClick,
}: FavoritePreviewPanelProps) => {
  const previewBookmarks = bookmarks.slice(0, MAX_PREVIEW_COUNT);

  return (
    <aside className={cn(favoritePreviewPanelStyles.root)} aria-label={"즐겨찾기 미리보기"}>
      <div className={cn(favoritePreviewPanelStyles.header)}>
        <h2 className={cn(favoritePreviewPanelStyles.title)}>Favorites</h2>
        <Button
          variant={"ghost"}
          size={"sm"}
          className={cn(favoritePreviewPanelStyles.manageButton)}
          onClick={onManageClick}
        >
          관리
        </Button>
      </div>

      <div className={cn(favoritePreviewPanelStyles.list)}>
        {previewBookmarks.map((bookmark) => (
          <FavoritePreviewCard
            key={bookmark.id}
            bookmark={bookmark}
            onClick={() => onBookmarkClick(bookmark)}
          />
        ))}

        {previewBookmarks.length === 0 && (
          <div className={cn(favoritePreviewPanelStyles.emptyCard)}>
            <Icon name={"bookmarkAdd"} tone={"subtle"} />
            <p className={cn(favoritePreviewPanelStyles.emptyTitle)}>아직 즐겨찾기가 없어요</p>
            <p className={cn(favoritePreviewPanelStyles.emptyDescription)}>
              자주 보는 지역을 추가하면 메인에서 빠르게 확인할 수 있어요.
            </p>
          </div>
        )}

        <button
          type={"button"}
          className={cn(favoritePreviewPanelStyles.addButton)}
          onClick={onAddClick}
        >
          <Icon name={"addCircle"} tone={"subtle"} />
          <span>Add Location</span>
        </button>
      </div>
    </aside>
  );
};
