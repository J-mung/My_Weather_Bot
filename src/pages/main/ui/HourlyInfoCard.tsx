import { useRef, type MouseEvent } from "react";

import { weatherConditionMeta } from "@/entities/weather/model/weather-condition-meta";
import { NO_DATA_STATUS_CODE } from "@/shared/api/no-data-status-codes";
import { cn } from "@/shared/lib/cn";
import { IconButton } from "@/shared/ui/button";
import { ErrorNotice } from "@/shared/ui/error-notice";
import { Icon } from "@/shared/ui/icon";
import {
  formatHourlyPrecipitationProbability,
  getHourlyPrecipitationAmountShortText,
  getHourlyPrecipitationAmountText,
  getHourlyPrecipitationAriaLabel,
} from "../lib/hourly-forecast-display.lib";
import { HourlyInfoSkeletonCard } from "./HourlyInfoSkeletonCard";
import { MetricStateCard } from "./MetricStateCard";
import { hourlyInfoCardStyles } from "./styles";
import type { HourlyInfoCardProps } from "./types";

type HourlyForecast = NonNullable<HourlyInfoCardProps["data"]>["hourly"][number];

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
  isNoData = false,
  refresh,
  isDetailOpen = false,
}: HourlyInfoCardProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  // 드래그 상태 계산을 위한 reference
  const dragStateRef = useRef({
    isDragging: false,
    startX: 0,
    startScrollLeft: 0,
  });

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    const elem = scrollRef.current;
    if (!elem) return;

    dragStateRef.current = {
      isDragging: true,
      startX: e.clientX,
      startScrollLeft: elem.scrollLeft,
    };
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
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

  if (isLoading) {
    return (
      <div className={cn(hourlyInfoCardStyles.viewport)}>
        <HourlyInfoSkeletonCard />
      </div>
    );
  }

  if (isNoData) {
    return (
      <div className={cn(hourlyInfoCardStyles.viewport)}>
        <MetricStateCard
          title={"시간대별 예보가 아직 없어요"}
          description={
            "시간대별 예보 데이터가 아직 준비되지 않았어요.\n잠시 후 다시 확인해 주세요."
          }
          code={NO_DATA_STATUS_CODE.WEATHER_HOURLY}
          codeLabel={"상태 코드"}
          tone={"info"}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn(hourlyInfoCardStyles.viewport, hourlyInfoCardStyles.error)}>
        <Icon
          name={"error"}
          size={"lg"}
          tone={"danger"}
          className={"h-25 w-25 md:h-30 md:w-30"}
        />
        <ErrorNotice
          variant={"plain"}
          title={error.meta.title}
          description={error.meta.description}
          code={error.meta.code}
          className={"max-w-100 min-w-50 gap-2"}
          action={
            <IconButton
              variant={"ghost"}
              size={"md"}
              onClick={(e) => {
                e.stopPropagation();
                refresh();
              }}
              iconName={"refresh"}
              iconSize={"md"}
              iconClassName={cn(isFetching && "animate-spin")}
            >
              {error.meta.actionLabel}
            </IconButton>
          }
        />
      </div>
    );
  }

  return (
    <div className={cn(hourlyInfoCardStyles.viewport)}>
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
              const precipitationText = formatHourlyPrecipitationProbability(
                _hour.precipitationProbability,
              );
              const precipitationTone = getHourlyPrecipitationTone(_hour);
              const precipitationAmountShortText = getHourlyPrecipitationAmountShortText(_hour);
              const precipitationAriaLabel = getHourlyPrecipitationAriaLabel(_hour);

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
                    title={precipitationAriaLabel}
                    aria-label={precipitationAriaLabel}
                  >
                    <Icon name={"waterDrop"} size={"sm"} />
                    <span>{precipitationText}</span>
                  </span>
                  <span
                    className={cn(
                      hourlyInfoCardStyles.detailAmount,
                      !precipitationAmountShortText && hourlyInfoCardStyles.detailAmountEmpty,
                    )}
                    title={precipitationAmountShortText ?? undefined}
                    aria-hidden={!precipitationAmountShortText}
                  >
                    {precipitationAmountShortText ?? "상세 없음"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {hourly && isDetailOpen && (
        <section
          id={"hourly-forecast-detail"}
          className={cn(hourlyInfoCardStyles.detailPanel)}
          aria-label={"24시간 시간대별 예보 상세"}
        >
          {hourly.map((_hour) => {
            const conditionMeta = weatherConditionMeta[_hour.condition];
            const precipitationText = formatHourlyPrecipitationProbability(
              _hour.precipitationProbability,
            );
            const precipitationAmountText = getHourlyPrecipitationAmountText(_hour);

            return (
              <div key={`detail-${_hour.time}`} className={cn(hourlyInfoCardStyles.detailRow)}>
                <span className={cn(hourlyInfoCardStyles.detailRowTime)}>{_hour.time}</span>
                <Icon
                  name={conditionMeta.icon}
                  size={"md"}
                  className={cn(hourlyInfoCardStyles.detailRowIcon, conditionMeta.iconClassName)}
                />
                <span className={cn(hourlyInfoCardStyles.detailRowCondition)}>
                  {conditionMeta.label}
                </span>
                <span className={cn(hourlyInfoCardStyles.detailRowTemp)}>{_hour.temp}°</span>
                <span className={cn(hourlyInfoCardStyles.detailRowPrecipitation)}>
                  강수 {precipitationText}
                </span>
                <span className={cn(hourlyInfoCardStyles.detailRowAmount)}>
                  {precipitationAmountText ?? "강수/적설 없음"}
                </span>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
};
