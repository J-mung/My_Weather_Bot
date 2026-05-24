import type { GridCoord } from "@/entities/weather/model/weather.types";
import { useBookmarkForecastPreview } from "@/features/bookmark/model/useBookmarkForecastPreview";
import { cn } from "@/shared/lib/cn";
import { Icon } from "@/shared/ui/icon";
import { Skeleton } from "@/shared/ui/skeleton";
import { useEffect, useRef, useState } from "react";
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
  const { data, isLoading, error } = useBookmarkForecastPreview(
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
      <div ref={targetRef} className={cn(bookmarkSummaryStyles.summaryStatusWrap)}>
        <div className={cn(bookmarkSummaryStyles.summaryTitle)}>
          <Icon
            name={"error"}
            size={"sm"}
            tone={"danger"}
            className={cn(bookmarkSummaryStyles.summaryTitleIcon)}
          />
          <span>예보를 불러오지 못했어요</span>
        </div>
        <span className={cn(bookmarkSummaryStyles.summaryDetail)}>{error.meta.description}</span>
      </div>
    );
  }

  return (
    <div ref={targetRef} className={cn(bookmarkSummaryStyles.summaryWrap)}>
      {data && (
        <>
          <span className={cn(bookmarkSummaryStyles.summaryTemperature)}>
            {formatForecastTemperature(data.forecastTemperature)}
          </span>
          <span className={cn(bookmarkSummaryStyles.summaryRange)}>
            {formatTemperatureRange(data.todayMax, data.todayMin)}
          </span>
        </>
      )}
    </div>
  );
};
