import type { BookmarkItem } from "@/features/bookmark/model/types";
import { bookmarkPageStyles } from "./styles";

export const CardContextMenu = ({
  openedMenuId,
  bookmarkItem,
  setOpenedMenuId,
  setEditingId,
  setAliasInput,
  deleteBookmark,
}: {
  openedMenuId: string | null;
  bookmarkItem: BookmarkItem;
  setOpenedMenuId: React.Dispatch<React.SetStateAction<string | null>>;
  setEditingId: React.Dispatch<React.SetStateAction<string | null>>;
  setAliasInput: React.Dispatch<React.SetStateAction<string>>;
  deleteBookmark: (id: string) => void;
}) => {
  /**
   * 편집 버튼 클릭
   * @param id
   * @param currentAlias
   */
  const editHandler = (id: string, currentAlias: string) => {
    setOpenedMenuId(null);
    setEditingId(id);
    setAliasInput(currentAlias);
  };

  /**
   * 카드별 컨텍스트 메뉴 토글
   * @param id
   */
  const toggleMenu = (id: string) => {
    setOpenedMenuId((prev) => (prev === id ? null : id));
  };

  /**
   * 북마크 삭제 처리
   * @param id
   */
  const deleteHandler = (id: string) => {
    setOpenedMenuId(null);
    deleteBookmark(id);
  };

  return (
    <div className={bookmarkPageStyles.bookmarkMenuWrap} data-bookmark-menu={"true"}>
      <button
        type={"button"}
        className={bookmarkPageStyles.bookmarkMenuTrigger}
        onClick={() => toggleMenu(bookmarkItem.id)}
        aria-label={"카드 메뉴 열기"}
        title={"카드 메뉴"}
      >
        ⋯
      </button>
      {openedMenuId === bookmarkItem.id && (
        <div className={bookmarkPageStyles.bookmarkMenuPanel}>
          <button
            type={"button"}
            className={bookmarkPageStyles.bookmarkMenuItem}
            onClick={() => editHandler(bookmarkItem.id, bookmarkItem.alias)}
          >
            별칭 수정
          </button>
          <button
            type={"button"}
            className={bookmarkPageStyles.bookmarkMenuItemDanger}
            onClick={() => deleteHandler(bookmarkItem.id)}
          >
            삭제
          </button>
        </div>
      )}
    </div>
  );
};
