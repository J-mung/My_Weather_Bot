import type { SummaryDomain } from "@/entities/weather/model/weather.types";
import { cn } from "@/shared/lib/cn";
import { Icon } from "@/shared/ui/icon";
import { useRef } from "react";
import { HourlyInfoSkeletonCard } from "./HourlyInfoSkeletonCard";
import { hourlyInfoCardStyles } from "./styles";
import { weatherConditionMeta } from "./weather-condition-meta";

export const HourlyInfoCard = ({
  data,
  isLoading,
  error,
}: {
  data: SummaryDomain | null;
  isLoading: boolean;
  error: Error | null;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  // 드래그 상태 계산을 위한 reference
  const dragStateRef = useRef({
    isDragging: false,
    startX: 0,
    startScrollLeft: 0,
  });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const elem = scrollRef.current;
    if (!elem) return;

    dragStateRef.current = {
      isDragging: true,
      startX: e.clientX,
      startScrollLeft: elem.scrollLeft,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const elem = scrollRef.current;
    const drag = dragStateRef.current;

    if (!elem || !drag.isDragging) return;

    const deltaX = e.clientX - drag.startX;
    elem.scrollLeft = drag.startScrollLeft - deltaX;
  };

  const handleMouseUp = () => {
    dragStateRef.current.isDragging = false;
  };

  const hourly = data?.hourly;

  return (
    <div className={cn(hourlyInfoCardStyles.viewport)}>
      {isLoading && <HourlyInfoSkeletonCard />}
      {/* 마우스 drag로 스크롤 가능 */}
      <div
        ref={scrollRef}
        className={cn(hourlyInfoCardStyles.wrapper)}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {hourly && (
          <div className={cn(hourlyInfoCardStyles.list)}>
            {hourly.map((_hour) => (
              <div key={_hour.time} className={cn(hourlyInfoCardStyles.detail)}>
                <span className={cn(hourlyInfoCardStyles.detailHour)}>{_hour.time}</span>
                <Icon
                  name={weatherConditionMeta[_hour.condition].icon}
                  size={"lg"}
                  tone={"subtle"}
                  className={cn(hourlyInfoCardStyles.detailIcon)}
                />
                <span className={cn(hourlyInfoCardStyles.detailValue)}>{_hour.temp}°</span>
              </div>
            ))}
          </div>
        )}
        {error && <div className={cn(hourlyInfoCardStyles.error)}>{error.message}</div>}
      </div>
    </div>
  );
};
