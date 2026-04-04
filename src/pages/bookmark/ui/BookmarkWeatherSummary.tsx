import type { GridCoord } from "@/entities/weather/model/weather.types";
import { useBookmarkSummary } from "@/features/bookmark/model/useBookmarkSummary";
import { cn } from "@/shared/lib/cn";
import { Icon } from "@/shared/ui/icon";
import { Skeleton } from "@/shared/ui/skeleton";
import { bookmarkSummaryStyles } from "./styles";

/**
 * 온도 단위 포맷터
 * @param value
 * @returns
 */
const formatTemperature = (value: number): string => `${Math.round(value)}°`;
const formatCurrentTemperature = (value: number | null): string => {
  if (value === null) {
    return "--°";
  }

  return `${value}°`;
};

export const BookmarkWeatherSummary = ({ nx, ny }: GridCoord) => {
  // GridCoord로 북마크된 위치의 날씨 정보 조회
  const { data, isLoading, error } = useBookmarkSummary({ nx, ny });
  if (isLoading) {
    return (
      <div className={cn(bookmarkSummaryStyles.summaryWrap)}>
        <div className={cn(bookmarkSummaryStyles.summaryMainContent)}>
          <Skeleton className={cn(["h-9 w-15"])} />
        </div>
        <div className={cn(bookmarkSummaryStyles.summarySubContent)}>
          <Skeleton className={cn(["h-9 w-37"])} />
        </div>
      </div>
    );
  }

  // No Data
  if (error) {
    return (
      <div className={cn(bookmarkSummaryStyles.summaryWrap)}>
        <Icon name={"error"} size={"lg"} tone={"danger"} />
        <span className={cn(bookmarkSummaryStyles.summaryNodata)}>{error.meta.description}</span>
      </div>
    );
  }

  return (
    <div className={cn(bookmarkSummaryStyles.summaryWrap)}>
      {data && (
        <>
          <div className={cn("flex items-center justify-between")}>
            <p className={cn(bookmarkSummaryStyles.summaryMainContent)}>
              {formatCurrentTemperature(data.temperature)}
            </p>
          </div>
          <p className={cn(bookmarkSummaryStyles.summarySubContent)}>
            최고 {formatTemperature(data.todayMax)} / 최저 {formatTemperature(data.todayMin)}
          </p>
        </>
      )}
    </div>
  );
};
