import type { BookmarkItem } from "@/features/bookmark/model/types";
import { MAX_BOOKMARKS, useBookmarks } from "@/features/bookmark/model/useBookmarks";
import { BookmarkCardList } from "./BookmarkCardList";
import { bookmarkPageStyles } from "./styles";

const previewBookmarkList: BookmarkItem[] = [
  {
    id: "preview-1",
    displayName: "서울특별시-종로구-청운동",
    alias: "내 위치",
    nx: 60,
    ny: 127,
    createdAt: "2026-03-02T00:00:00.000Z",
  },
  {
    id: "preview-2",
    displayName: "부산광역시-해운대구-우동",
    alias: "",
    nx: 98,
    ny: 76,
    createdAt: "2026-03-02T00:00:00.000Z",
  },
  {
    id: "preview-3",
    displayName: "제주특별자치도-제주시-이도이동",
    alias: "제주 출장",
    nx: 53,
    ny: 38,
    createdAt: "2026-03-02T00:00:00.000Z",
  },
];

export default function BookmarkPage() {
  const { bookmarkList, isFull, deleteBookmark, updateAlias, remainingList } = useBookmarks();
  const isPreview = bookmarkList.length === 0;
  const renderedBookmarkList = isPreview ? previewBookmarkList : bookmarkList;
  const renderedRemainingList = MAX_BOOKMARKS - renderedBookmarkList.length;

  return (
    <div className={bookmarkPageStyles.page}>
      <div className={bookmarkPageStyles.remainSlotWrap}>
        <span className={bookmarkPageStyles.remainSlotContent}>
          북마크 현황 : {isPreview ? renderedRemainingList : remainingList} / {MAX_BOOKMARKS}
        </span>
        {isFull && (
          <span className={bookmarkPageStyles.remainSlotContent}>
            북마크는 최대 6개까지 가능합니다.
          </span>
        )}
        {isPreview && (
          <span className={bookmarkPageStyles.remainSlotContent}>
            테스트 카드 미리보기 데이터입니다.
          </span>
        )}
      </div>
      <BookmarkCardList
        bookmarkList={renderedBookmarkList}
        deleteBookmark={deleteBookmark}
        updateAlias={updateAlias}
      />
    </div>
  );
}
