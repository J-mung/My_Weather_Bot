import { useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { type AddBookmarkItem, type BookmarkItem } from "./types";

const BOOKMARK_STORAGE_KEY = "weather_bookmark";
const MAX_BOOKMARKS = 6;

const createBookmarkId = () => uuidv4();

const isBookmarkItem = (value: unknown): value is BookmarkItem => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<BookmarkItem>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.displayName === "string" &&
    typeof candidate.alias === "string" &&
    typeof candidate.nx === "number" &&
    Number.isFinite(candidate.nx) &&
    typeof candidate.ny === "number" &&
    Number.isFinite(candidate.ny) &&
    typeof candidate.createdAt === "string"
  );
};

export const readBookmarkFromStorage = (): BookmarkItem[] => {
  try {
    const storageList = localStorage.getItem(BOOKMARK_STORAGE_KEY);
    if (!storageList) return [];

    const parsed = JSON.parse(storageList) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isBookmarkItem);
  } catch {
    return [];
  }
};

/**
 * 북마크 CRUD 담당 훅
 */
export const useBookmarks = () => {
  const [bookmarkList, setBookmarkList] = useState<BookmarkItem[]>(() => readBookmarkFromStorage());

  useEffect(() => {
    localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(bookmarkList));
  }, [bookmarkList]);

  const isFull = bookmarkList.length >= MAX_BOOKMARKS;

  /**
   * 북마크 추가
   * @param input
   * @returns
   */
  const addBookmark = (input: AddBookmarkItem): { success: boolean; message: string } => {
    // 모두 찼을 때
    if (isFull) {
      return { success: false, message: "북마크는 최대 6개까지 가능합니다." };
    }

    // 중복 등록 확인
    const alreadyAdded = bookmarkList.some(
      (_bookmark) => _bookmark.displayName === input.displayName,
    );

    if (alreadyAdded) {
      return { success: false, message: "이미 북마크로 등록된 장소입니다." };
    }

    // 새 등록 가능해서 등록
    const next: BookmarkItem = {
      id: createBookmarkId(),
      displayName: input.displayName,
      alias: input.alias ?? "",
      nx: input.nx,
      ny: input.ny,
      createdAt: new Date().toISOString(),
    };

    setBookmarkList((prev) => [next, ...prev]);
    return { success: true, message: "북마크에 등록 되었습니다." };
  };

  /**
   * 북마크 삭제
   */
  const deleteBookmark = (id: string) => {
    setBookmarkList((prev) => prev.filter((_bookmark) => _bookmark.id !== id));
  };

  /**
   * 북마크 별칭 업데이트 (최대 20자 제한))
   * @param id
   * @param alias
   */
  const updateAlias = (id: string, alias: string) => {
    const trimAlias = alias.trim().slice(0, 20);
    setBookmarkList((prev) =>
      prev.map((_bookmark) =>
        _bookmark.id === id ? { ..._bookmark, alias: trimAlias } : _bookmark,
      ),
    );
  };

  /**
   * 이미 등록됐는지 확인
   * @param displayName
   * @returns
   */
  const isBookmarked = (displayName: string): boolean =>
    bookmarkList.some((_bookmark) => _bookmark.displayName === displayName);

  const getBookmarkedId = (displayName: string): string | null =>
    bookmarkList.find((_bookmark) => _bookmark.displayName === displayName)?.id || null;

  /**
   * 북마크 목록 현황
   */
  const remainingList = useMemo(() => bookmarkList.length, [bookmarkList.length]);

  const totalBookmarkList = MAX_BOOKMARKS;

  return {
    bookmarkList,
    isFull,
    addBookmark,
    deleteBookmark,
    updateAlias,
    isBookmarked,
    getBookmarkedId,
    remainingList,
    totalBookmarkList,
  };
};
