import type { BookmarkItem } from "@/features/bookmark/model/types";
import Button from "@/shared/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/shared/ui/context-menu";
import { Icon } from "@/shared/ui/icon";

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
          variant={"ghost"}
          size={"sm"}
          title={"카드 메뉴"}
          aria-label={"카드 메뉴 열기"}
        >
          <Icon name={"moreHoriz"} size={"lg"} tone={"default"} />
        </Button>
      </ContextMenuTrigger>

      <ContextMenuContent align={"end"}>
        <ContextMenuItem
          onSelect={() => {
            editHandler(bookmarkItem.id, bookmarkItem.alias);
          }}
        >
          <Icon name={"edit"} size={"lg"} />
          <span>별칭 수정</span>
        </ContextMenuItem>
        <ContextMenuItem
          tone="danger"
          onSelect={() => {
            deleteHandler(bookmarkItem.id);
          }}
        >
          <Icon name={"delete"} size={"lg"} />
          <span>삭제</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
