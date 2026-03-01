import type { BookmarkItem } from "@/features/bookmark/model/types";
import { useEffect, useState } from "react";
import { BookmarkWeatherSummary } from "./BookmarkWeatherSummary";
import { CardContextMenu } from "./CardContextMenu";
import { CardEditForm } from "./CardEditForm";
import { bookmarkPageStyles } from "./styles";

export const BookmarkCardList = ({
  bookmarkList,
  deleteBookmark,
  updateAlias,
}: {
  bookmarkList: BookmarkItem[];
  deleteBookmark: (id: string) => void;
  updateAlias: (id: string, alias: string) => void;
}) => {
  const [openedMenuId, setOpenedMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [aliasInput, setAliasInput] = useState<string>("");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const targetElement = event.target as Element | null;
      // 컨텍스트 메뉴 내부 클릭이면 클릭된 버튼 핸들러가 닫기 진행
      if (targetElement?.closest("[data-bookmark-menu='true']")) return;
      // 컨텍스트 메뉴 외부 클릭이면 메뉴 바로 닫기
      setOpenedMenuId(null);
    };

    // 문서 이벤트로 컨텍스트 메뉴 클릭 반응
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /**
   * 별칭 편집 저장
   * @returns
   */
  const saveEdit = () => {
    if (!editingId) return;
    updateAlias(editingId, aliasInput);
    setEditingId(null);
    setAliasInput("");
  };

  /**
   * 별칭 편집 취소
   */
  const cancelEdit = () => {
    setEditingId(null);
    setAliasInput("");
  };

  return (
    <>
      {bookmarkList.length === 0 && (
        <div className={bookmarkPageStyles.bookmarkListNodata}>
          <span>등록된 즐겨찾기가 없습니다.</span>
        </div>
      )}
      <div className={bookmarkPageStyles.bookmarkListWrap}>
        {bookmarkList.map((_bookmark) => {
          const isEditing = editingId === _bookmark.id;
          const locationLabel = _bookmark.displayName;
          const title = _bookmark.alias || locationLabel;

          return (
            <div key={_bookmark.id} className={bookmarkPageStyles.bookmarkCard}>
              {!isEditing ? (
                <>
                  <div className={bookmarkPageStyles.bookmarkCardHeader}>
                    <div>
                      <span className={bookmarkPageStyles.bookmarkCardTitle}>{title}</span>
                      <span className={bookmarkPageStyles.bookmarkCardLocation}>
                        {locationLabel}
                      </span>
                    </div>
                    <div className={bookmarkPageStyles.bookmarkCardCaption}>
                      <span className={bookmarkPageStyles.bookmarkCardTemp}>
                        nx: {_bookmark.nx}, ny: {_bookmark.ny}
                      </span>
                    </div>
                  </div>
                  <BookmarkWeatherSummary nx={_bookmark.nx} ny={_bookmark.ny} />
                  <div className={bookmarkPageStyles.bookmarkCardAction}>
                    <CardContextMenu
                      openedMenuId={openedMenuId}
                      bookmarkItem={_bookmark}
                      setOpenedMenuId={setOpenedMenuId}
                      setEditingId={setEditingId}
                      setAliasInput={setAliasInput}
                      deleteBookmark={deleteBookmark}
                    />
                  </div>
                </>
              ) : (
                <CardEditForm
                  aliasInput={aliasInput}
                  setAliasInput={setAliasInput}
                  saveEdit={saveEdit}
                  cancelEdit={cancelEdit}
                />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};
