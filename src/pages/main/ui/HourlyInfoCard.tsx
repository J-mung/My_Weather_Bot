import { weatherConditionMeta } from "@/entities/weather/model/weather-condition-meta";
import { cn } from "@/shared/lib/cn";
import Button from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";
import { useRef } from "react";
import { HourlyInfoSkeletonCard } from "./HourlyInfoSkeletonCard";
import { hourlyInfoCardStyles } from "./styles";
import type { HourlyInfoCardProps } from "./types";

type HourlyForecast = NonNullable<HourlyInfoCardProps["data"]>["hourly"][number];

const getHourlyPrecipitationText = ({ precipitationProbability }: HourlyForecast): string => {
  return typeof precipitationProbability === "number" ? `${precipitationProbability}%` : "--%";
};

const getHourlyPrecipitationTone = ({ precipitationProbability }: HourlyForecast) => {
  if (typeof precipitationProbability !== "number" || precipitationProbability <= 0) {
    return hourlyInfoCardStyles.detailPrecipitationMuted;
  }

  if (precipitationProbability >= 70) {
    return hourlyInfoCardStyles.detailPrecipitationHigh;
  }

  if (precipitationProbability >= 40) {
    return hourlyInfoCardStyles.detailPrecipitationMedium;
  }

  return hourlyInfoCardStyles.detailPrecipitationLow;
};

export const HourlyInfoCard = ({
  data,
  isLoading,
  isFetching,
  error,
  refresh,
}: HourlyInfoCardProps) => {
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

  if (error) {
    return (
      <div className={cn(hourlyInfoCardStyles.viewport, hourlyInfoCardStyles.error)}>
        <Icon
          name={"error"}
          size={"lg"}
          tone={"danger"}
          className={"h-25 w-25 md:h-30 md:w-30"}
        />
        <div className={"flex flex-fill flex-col gap-5"}>
          <span className={"max-w-100 min-w-50 whitespace-pre-wrap"}>{error.meta.description}</span>
          <Button
            variant={"ghost"}
            size={"md"}
            className={"gap-2"}
            onClick={(e) => {
              e.stopPropagation();
              refresh();
            }}
          >
            <Icon name={"refresh"} size={"md"} className={isFetching ? "animate-spin" : ""} />
            {error.meta.actionLabel}
          </Button>
        </div>
      </div>
    );
  }

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
            {hourly.map((_hour) => {
              const conditionMeta = weatherConditionMeta[_hour.condition];
              const precipitationText = getHourlyPrecipitationText(_hour);
              const precipitationTone = getHourlyPrecipitationTone(_hour);

              return (
                <div key={_hour.time} className={cn(hourlyInfoCardStyles.detail)}>
                  <span className={cn(hourlyInfoCardStyles.detailHour)}>{_hour.time}</span>
                  <Icon
                    name={conditionMeta.icon}
                    size={"lg"}
                    className={cn(hourlyInfoCardStyles.detailIcon, conditionMeta.iconClassName)}
                  />
                  <span className={cn(hourlyInfoCardStyles.detailValue)}>{_hour.temp}°</span>
                  <span
                    className={cn(
                      hourlyInfoCardStyles.detailPrecipitation,
                      precipitationTone,
                    )}
                    title={`강수확률: ${precipitationText}`}
                    aria-label={`강수확률 ${precipitationText}`}
                  >
                    <Icon name={"waterDrop"} size={"sm"} />
                    <span>{precipitationText}</span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
