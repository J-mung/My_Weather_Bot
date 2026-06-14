import type { WeatherCondition } from "@/entities/weather/model/weather.types";
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

// 북마크 예보 미리보기 요청 타입
export type BookmarkForecastPreviewReq = Pick<BookmarkItem, "nx" | "ny">;

// 북마크 예보 미리보기 응답 타입
export type BookmarkForecastPreviewData = {
  forecastTemperature: number | null;
  todayMin: number;
  todayMax: number;
  condition: WeatherCondition;
};

export interface BookmarkForecastPreview {
  data: BookmarkForecastPreviewData | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: AppError | null;
  refresh: () => Promise<void>;
}
