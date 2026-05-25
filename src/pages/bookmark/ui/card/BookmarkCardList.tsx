import type { BookmarkItem } from "@/features/bookmark/model/types";
import { cn } from "@/shared/lib/cn";
import Button from "@/shared/ui/button";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookmarkForecastPreview } from "../BookmarkForecastPreview";
import { bookmarkPageStyles } from "../styles";
import { BookmarkCard } from "./BookmarkCard";
import { CardContextMenu } from "./CardContextMenu";
import { CardEditForm } from "./CardEditForm";

export const BookmarkCardList = ({
  bookmarkList,
  isFull,
  isManageMode,
  deleteBookmark,
  updateAlias,
  onAddBookmark,
}: {
  bookmarkList: BookmarkItem[];
  isFull: boolean;
  isManageMode: boolean;
  deleteBookmark: (id: string) => void;
  updateAlias: (id: string, alias: string) => void;
  onAddBookmark: () => void;
}) => {
  const [openedMenuId, setOpenedMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [aliasInput, setAliasInput] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const navigate = useNavigate();
  const bookmarkIds = useMemo(() => bookmarkList.map((bookmark) => bookmark.id), [bookmarkList]);
  const selectedIdList = useMemo(
    () => bookmarkIds.filter((id) => selectedIds.has(id)),
    [bookmarkIds, selectedIds],
  );
  const selectedCount = selectedIdList.length;
  const isAllSelected = bookmarkIds.length > 0 && selectedCount === bookmarkIds.length;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
        return next;
      }

      next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(bookmarkIds));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const deleteSingleBookmark = (id: string) => {
    deleteBookmark(id);
    setOpenedMenuId(null);
    setSelectedIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

    if (editingId === id) {
      setEditingId(null);
      setAliasInput("");
    }
  };

  const deleteSelectedBookmarks = () => {
    if (selectedIdList.length === 0) return;

    selectedIdList.forEach((id) => deleteBookmark(id));
    setSelectedIds(new Set());
    setOpenedMenuId(null);

    if (editingId && selectedIds.has(editingId)) {
      setEditingId(null);
      setAliasInput("");
    }
  };

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
        <div className={cn(bookmarkPageStyles.bookmarkListNodata)}>
          <span>등록된 즐겨찾기가 없습니다.</span>
        </div>
      )}

      {isManageMode && bookmarkList.length > 0 && (
        <div className={cn(bookmarkPageStyles.editToolbar)}>
          <span className={cn(bookmarkPageStyles.editToolbarText)}>
            {selectedCount > 0 ? `${selectedCount}개 선택됨` : "삭제할 북마크를 선택하세요"}
          </span>
          <div className={cn(bookmarkPageStyles.editToolbarActions)}>
            <Button
              type={"button"}
              variant={"secondary"}
              size={"sm"}
              onClick={isAllSelected ? clearSelection : selectAll}
            >
              {isAllSelected ? "선택 해제" : "전체 선택"}
            </Button>
            <Button
              type={"button"}
              variant={"danger"}
              size={"sm"}
              disabled={selectedCount === 0}
              onClick={deleteSelectedBookmarks}
            >
              선택 삭제
            </Button>
          </div>
        </div>
      )}

      <div className={cn(bookmarkPageStyles.bookmarkListWrap)}>
        {bookmarkList.map((_bookmark) => {
          const isEditing = editingId === _bookmark.id;
          const isSelected = selectedIds.has(_bookmark.id);
          const locationLabel = _bookmark.displayName;
          const title = _bookmark.alias || locationLabel;

          return (
            <BookmarkCard
              key={_bookmark.id}
              title={title}
              locationLabel={locationLabel}
              isEditing={isEditing}
              className={cn(isSelected && bookmarkPageStyles.bookmarkCardSelected)}
              onClick={(e) => {
                e.stopPropagation();
                if (isEditing) {
                  return;
                }

                if (isManageMode) {
                  toggleSelect(_bookmark.id);
                  return;
                }

                navigate(`/?id=${_bookmark.id}`);
              }}
              selectionControl={
                isManageMode && !isEditing ? (
                  <button
                    type={"button"}
                    className={cn(
                      bookmarkPageStyles.bookmarkSelectButton,
                      isSelected && bookmarkPageStyles.bookmarkSelectButtonSelected,
                    )}
                    aria-label={`${title} ${isSelected ? "선택 해제" : "선택"}`}
                    aria-pressed={isSelected}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelect(_bookmark.id);
                    }}
                  >
                    ✓
                  </button>
                ) : null
              }
              summary={<BookmarkForecastPreview nx={_bookmark.nx} ny={_bookmark.ny} />}
              actions={
                isManageMode ? (
                  <CardContextMenu
                    openedMenuId={openedMenuId}
                    bookmarkItem={_bookmark}
                    setOpenedMenuId={setOpenedMenuId}
                    setEditingId={setEditingId}
                    setAliasInput={setAliasInput}
                    deleteBookmark={deleteSingleBookmark}
                  />
                ) : null
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

        {!isFull && (
          <button
            type={"button"}
            className={cn(bookmarkPageStyles.addCityCard)}
            onClick={onAddBookmark}
          >
            <span className={cn(bookmarkPageStyles.addCityIcon)}>+</span>
            <span>Add Location</span>
          </button>
        )}
      </div>
      <div></div>
    </>
  );
};
