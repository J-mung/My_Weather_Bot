export interface BookmarkItem {
  id: string; // 식별값
  displayName: string; // 지역명
  alias: string; // 사용자 지정 지역명
  nx: number;
  ny: number;
  createdAt: string;
}

export interface AddBookmarkItem {
  displayName: string;
  nx: number;
  ny: number;
  alias?: string;
}
