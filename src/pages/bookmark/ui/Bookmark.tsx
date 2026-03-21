import { useBookmarks } from "@/features/bookmark/model/useBookmarks";
import { cn } from "@/shared/lib/cn";
import { BookmarkCardList } from "./card/BookmarkCardList";
import { bookmarkPageStyles } from "./styles";

export default function BookmarkPage() {
  const { bookmarkList, isFull, deleteBookmark, updateAlias, remainingList, totalBookmarkList } =
    useBookmarks();

  return (
    <div className={cn(bookmarkPageStyles.page)}>
      <div className={cn(bookmarkPageStyles.remainSlotWrap)}>
        <span className={cn(bookmarkPageStyles.remainSlotContent)}>
          북마크 현황 : {remainingList} / {totalBookmarkList}
        </span>
        {isFull && (
          <span className={cn(bookmarkPageStyles.remainSlotContent)}>
            북마크는 최대 6개까지 가능합니다.
          </span>
        )}
      </div>
      <BookmarkCardList
        bookmarkList={bookmarkList}
        deleteBookmark={deleteBookmark}
        updateAlias={updateAlias}
      />
    </div>
  );
}
