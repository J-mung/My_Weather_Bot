import type { BookmarkItem } from "@/features/bookmark/model/types";
import Button from "@/shared/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/shared/ui/context-menu";

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
   * 북마크 삭제 처리
   * @param id
   */
  const deleteHandler = (id: string) => {
    setOpenedMenuId(null);
    deleteBookmark(id);
  };

  return (
    <ContextMenu
      open={openedMenuId === bookmarkItem.id}
      onOpenChange={(nextOpen) => setOpenedMenuId(nextOpen ? bookmarkItem.id : null)}
    >
      <ContextMenuTrigger>
        <Button
          type={"button"}
          variant={"secondary"}
          size={"md"}
          title={"카드 메뉴"}
          aria-label={"카드 메뉴 열기"}
        >
          ⋯
        </Button>
      </ContextMenuTrigger>

      <ContextMenuContent align={"end"}>
        <ContextMenuItem
          onSelect={() => {
            editHandler(bookmarkItem.id, bookmarkItem.alias);
          }}
        >
          별칭 수정
        </ContextMenuItem>
        <ContextMenuItem
          tone="danger"
          onSelect={() => {
            deleteHandler(bookmarkItem.id);
          }}
        >
          삭제
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
