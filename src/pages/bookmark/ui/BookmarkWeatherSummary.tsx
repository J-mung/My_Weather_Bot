import type { GridCoord } from "@/entities/weather/model/weather.types";
import { useWeatherSummary } from "@/features/get-current-weather/model/useWeatherSummary";
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
  const { data, isLoading, isError } = useWeatherSummary({ nx, ny });

  if (isLoading) {
    return (
      <div className={bookmarkSummaryStyles.summaryWrap}>
        <p className={bookmarkSummaryStyles.summaryMainContent}>--°</p>
        <p className={bookmarkSummaryStyles.summarySubContent}>최고 --° · 최저 --°</p>
      </div>
    );
  }

  // No Data
  if (isError || !data) {
    return (
      <div className={bookmarkSummaryStyles.summaryWrap}>
        <p className={bookmarkSummaryStyles.summaryMainContent}>-</p>
        <p className={bookmarkSummaryStyles.summaryNodata}>날씨 정보를 불러오지 못했습니다.</p>
      </div>
    );
  }

  return (
    <div className={bookmarkSummaryStyles.summaryWrap}>
      <div className={"flex items-center justify-between"}>
        <p className={bookmarkSummaryStyles.summaryMainContent}>
          {formatCurrentTemperature(data.now.temperature)}
        </p>
      </div>
      <p className={bookmarkSummaryStyles.summarySubContent}>
        최고 {formatTemperature(data.todayMax)} / 최저 {formatTemperature(data.todayMin)}
      </p>
    </div>
  );
};
