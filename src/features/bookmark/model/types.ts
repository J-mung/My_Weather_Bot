import type { AppError } from "@/shared/api/types";

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

// 북마크 정보 요청 타입
export type BookmarkSummaryReq = Pick<BookmarkItem, "nx" | "ny">;

// 북마크 정보 응답 타입
export type BookmarkSummaryData = {
  temperature: number | null;
  todayMin: number;
  todayMax: number;
};

export interface BookmarkSummary {
  data: BookmarkSummaryData | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: AppError | null;
}
