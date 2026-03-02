import { useBookmarks } from "@/features/bookmark/model/useBookmarks";
import { BookmarkCardList } from "./BookmarkCardList";
import { bookmarkPageStyles } from "./styles";

export default function BookmarkPage() {
  const { bookmarkList, isFull, deleteBookmark, updateAlias, remainingList, totalBookmarkList } =
    useBookmarks();

  return (
    <div className={bookmarkPageStyles.page}>
      <div className={bookmarkPageStyles.remainSlotWrap}>
        <span className={bookmarkPageStyles.remainSlotContent}>
          북마크 현황 : {remainingList} / {totalBookmarkList}
        </span>
        {isFull && (
          <span className={bookmarkPageStyles.remainSlotContent}>
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
