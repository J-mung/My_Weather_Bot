import type { BookmarkItem } from "@/features/bookmark/model/types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookmarkWeatherSummary } from "../BookmarkWeatherSummary";
import { bookmarkPageStyles } from "../styles";
import { BookmarkCard } from "./BookmarkCard";
import { CardContextMenu } from "./CardContextMenu";
import { CardEditForm } from "./CardEditForm";

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
  const navigate = useNavigate();

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
            <BookmarkCard
              key={_bookmark.id}
              title={title}
              locationLabel={locationLabel}
              nx={_bookmark.nx}
              ny={_bookmark.ny}
              isEditing={isEditing}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/?id=${_bookmark.id}`);
              }}
              summary={<BookmarkWeatherSummary nx={_bookmark.nx} ny={_bookmark.ny} />}
              actions={
                <CardContextMenu
                  openedMenuId={openedMenuId}
                  bookmarkItem={_bookmark}
                  setOpenedMenuId={setOpenedMenuId}
                  setEditingId={setEditingId}
                  setAliasInput={setAliasInput}
                  deleteBookmark={deleteBookmark}
                />
              }
              editForm={
                <CardEditForm
                  aliasInput={aliasInput}
                  setAliasInput={setAliasInput}
                  saveEdit={saveEdit}
                  cancelEdit={cancelEdit}
                />
              }
            ></BookmarkCard>
          );
        })}
      </div>
      <div></div>
    </>
  );
};
