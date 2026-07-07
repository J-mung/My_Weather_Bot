import type { GridCoord } from "@/entities/weather/model/weather.types";
import { useBookmarkForecastPreview } from "@/features/bookmark/model/useBookmarkForecastPreview";
import { NO_DATA_STATUS_CODE } from "@/shared/api/no-data-status-codes";
import { cn } from "@/shared/lib/cn";
import { ErrorNotice } from "@/shared/ui/error-notice";
import { Icon } from "@/shared/ui/icon";
import { MetricStateCard } from "@/shared/ui/metric-state-card";
import { Skeleton } from "@/shared/ui/skeleton";
import { useEffect, useRef, useState } from "react";
import { getBookmarkConditionDisplay } from "../lib/bookmark-forecast-display.lib";
import { bookmarkSummaryStyles } from "./styles";

const formatTemperature = (value: number): string => `${Math.round(value)}°`;
const formatForecastTemperature = (value: number | null): string => {
  if (value === null) {
    return "--°";
  }

  return `${Math.round(value)}°`;
};

const formatTemperatureRange = (todayMax: number, todayMin: number): string =>
  `최고 ${formatTemperature(todayMax)} · 최저 ${formatTemperature(todayMin)}`;

export const BookmarkForecastPreviewNoData = () => (
  <div className={cn(bookmarkSummaryStyles.summaryStatusWrap)}>
    <MetricStateCard
      title={"예보 데이터가 아직 없어요"}
      description={"북마크 지역의 예보 데이터가 아직 준비되지 않았어요."}
      code={NO_DATA_STATUS_CODE.BOOKMARK_PREVIEW}
      codeLabel={"상태 코드"}
      imageSrc={null}
      tone={"info"}
    />
  </div>
);

const useVisibleOnce = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isVisible) {
      return;
    }

    const target = targetRef.current;
    if (!target) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      const timer = setTimeout(() => setIsVisible(true), 0);
      return () => clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "120px" },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [isVisible]);

  return { targetRef, isVisible };
};

export const BookmarkForecastPreview = ({ nx, ny }: GridCoord) => {
  const { targetRef, isVisible } = useVisibleOnce();
  const { data, isLoading, error, isNoData } = useBookmarkForecastPreview(
    { nx, ny },
    { enabled: isVisible },
  );

  if (!isVisible || isLoading) {
    return (
      <div ref={targetRef} className={cn(bookmarkSummaryStyles.summaryWrap)}>
        <Skeleton className={"h-4 w-28"} />
        <Skeleton className={"h-6 w-full max-w-48"} />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorNotice
        ref={targetRef}
        title={"예보를 불러오지 못했어요"}
        description={error.meta.description}
        code={error.meta.code}
        className={cn(bookmarkSummaryStyles.summaryStatusWrap)}
      />
    );
  }

  if (isNoData) {
    return <BookmarkForecastPreviewNoData />;
  }

  return (
    <div ref={targetRef} className={cn(bookmarkSummaryStyles.summaryWrap)}>
      {data &&
        (() => {
          const conditionDisplay = getBookmarkConditionDisplay(data.condition);

          return (
            <>
              <div className={cn(bookmarkSummaryStyles.summaryPrimary)}>
                <Icon
                  name={conditionDisplay.icon}
                  className={cn(
                    bookmarkSummaryStyles.summaryConditionIcon,
                    conditionDisplay.iconClassName,
                  )}
                />
                <div className={cn(bookmarkSummaryStyles.summaryPrimaryText)}>
                  <span className={cn(bookmarkSummaryStyles.summaryTemperature)}>
                    {formatForecastTemperature(data.forecastTemperature)}
                  </span>
                  <span className={cn(bookmarkSummaryStyles.summaryConditionLabel)}>
                    {conditionDisplay.label}
                  </span>
                </div>
              </div>
              <span className={cn(bookmarkSummaryStyles.summaryRange)}>
                {formatTemperatureRange(data.todayMax, data.todayMin)}
              </span>
            </>
          );
        })()}
    </div>
  );
};
