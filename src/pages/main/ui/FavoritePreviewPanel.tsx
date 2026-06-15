import { cn } from "@/shared/lib/cn";
import Button from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";
import { FavoritePreviewCard } from "./FavoritePreviewCard";
import { favoritePreviewPanelStyles } from "./styles";
import type { FavoritePreviewPanelProps } from "./types";

const MAX_PREVIEW_COUNT = 3;

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
        <h2 className={cn(favoritePreviewPanelStyles.title)}>즐겨찾기</h2>
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
          <span>지역 추가</span>
        </button>
      </div>
    </aside>
  );
};
