import { weatherConditionMeta } from "@/entities/weather/model/weather-condition-meta";
import { NO_DATA_STATUS_CODE } from "@/shared/api/no-data-status-codes";
import { cn } from "@/shared/lib/cn";
import Button, { IconButton } from "@/shared/ui/button";
import { ErrorNotice } from "@/shared/ui/error-notice";
import { Icon, type IconName } from "@/shared/ui/icon";
import { MetricStateCard } from "./MetricStateCard";
import { Tooltip } from "@/shared/ui/tooltip";
import { NowInfoSkeletonCard } from "./NowInfoSkeletonCard";
import { nowInfoCardStyles } from "./styles";
import type { DetailWeatherItem, NowInfoCardProps } from "./types";

const formatMetric = (value: number | null, unit: "%" | "°"): string => {
  if (value === null) {
    return `--${unit}`;
  }

  return `${value}${unit}`;
};

export const NowInfoCard = ({
  primaryDistrict,
  secondaryDistrict,
  fullDistrict,
  isAlias: _isAlias,
  data,
  isLoading,
  isFetching,
  error,
  isNoData = false,
  refresh,
}: NowInfoCardProps) => {
  const dateInfo = new Intl.DateTimeFormat("ko-KR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const detailItems: DetailWeatherItem[] = data
    ? [
        { icon: "arrowUp" as const, label: "최고" as const, value: data.todayMax },
        { icon: "arrowDown" as const, label: "최저" as const, value: data.todayMin },
        { icon: "waterDrop" as const, label: "습도" as const, value: data.now.humidity },
      ]
    : [];
  const conditionMeta = data
    ? weatherConditionMeta[data.now.condition]
    : weatherConditionMeta["unavailable"];

  if (isLoading) {
    return <NowInfoSkeletonCard />;
  }

  if (isNoData) {
    return (
      <div className={cn(nowInfoCardStyles.root, nowInfoCardStyles.error)}>
        <MetricStateCard
          title={"현재 날씨 데이터가 아직 없어요"}
          description={
            "현재 위치의 날씨 데이터가 아직 준비되지 않았어요.\n잠시 후 다시 확인해 주세요."
          }
          code={NO_DATA_STATUS_CODE.WEATHER_NOW}
          codeLabel={"상태 코드"}
          tone={"info"}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn(nowInfoCardStyles.root, nowInfoCardStyles.error)}>
        <Icon name={"error"} size={"lg"} tone={"danger"} className={"h-25 w-25 md:h-30 md:w-30"} />
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
    <div className={cn(nowInfoCardStyles.root)}>
      {data && (
        <>
          <div className={cn(nowInfoCardStyles.header)}>
            <div className={cn(nowInfoCardStyles.headerText)}>
              <div className={cn(nowInfoCardStyles.titleRow)}>
                <div className={cn(nowInfoCardStyles.titleGroup)}>
                  <div className={cn(nowInfoCardStyles.mobileTitle, "md:hidden")}>
                    {secondaryDistrict && (
                      <Tooltip
                        content={fullDistrict}
                        align={"center"}
                        className={"w-full justify-center"}
                      >
                        <span
                          className={cn(nowInfoCardStyles.districtSecondary)}
                          title={fullDistrict}
                        >
                          {secondaryDistrict}
                        </span>
                      </Tooltip>
                    )}
                    <Tooltip
                      content={fullDistrict}
                      align={"center"}
                      className={"w-full justify-center"}
                    >
                      <span
                        className={cn(
                          nowInfoCardStyles.districtPrimary,
                          isFetching && nowInfoCardStyles.districtFetching,
                        )}
                        title={fullDistrict}
                      >
                        {primaryDistrict}
                      </span>
                    </Tooltip>
                  </div>

                  <div className={cn(nowInfoCardStyles.desktopTitle, "hidden md:block")}>
                    <Tooltip content={fullDistrict} className={"w-full"}>
                      <span
                        className={cn(
                          nowInfoCardStyles.districtDesktop,
                          isFetching && nowInfoCardStyles.districtFetching,
                        )}
                        title={fullDistrict}
                      >
                        {fullDistrict}
                      </span>
                    </Tooltip>
                  </div>
                </div>

                <Tooltip
                  content={"새로고침"}
                  align={"center"}
                  className={cn(nowInfoCardStyles.refreshButton)}
                  tooltipClassName={"whitespace-nowrap"}
                >
                  <Button
                    variant={"ghost"}
                    size={"icon"}
                    disabled={isFetching}
                    onClick={refresh}
                  >
                    <Icon
                      name={"refresh"}
                      tone={"default"}
                      className={cn(isFetching && nowInfoCardStyles.refreshIconLoading)}
                    />
                  </Button>
                </Tooltip>
              </div>
              <div className={cn(nowInfoCardStyles.date)}>{dateInfo}</div>
            </div>
            <Icon
              name={conditionMeta.icon}
              className={cn(nowInfoCardStyles.weatherIcon, conditionMeta.iconClassName)}
            />
          </div>

          <div className={cn(nowInfoCardStyles.body)}>
            <div className={cn(nowInfoCardStyles.currentTemp)}>
              {formatMetric(data.now.temperature, "°")}
            </div>
            <div className={cn(nowInfoCardStyles.currentMeta)}>
              <div className={cn(nowInfoCardStyles.currentSummary)}>{conditionMeta.label}</div>
              <div className={cn(nowInfoCardStyles.currentFeelsLike)}>
                체감 {formatMetric(data.now.feelsLike, "°")}
              </div>
            </div>
          </div>

          <div className={cn(nowInfoCardStyles.divider)} />

          <div className={cn(nowInfoCardStyles.detailList)}>
            {detailItems.map((item) => (
              <DetailWeather
                key={item.label}
                icon={item.icon}
                label={item.label}
                value={item.value}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const DetailWeather = ({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: "최고" | "최저" | "습도";
  value: number | null;
}) => {
  const unit = label === "습도" ? "%" : "°";
  return (
    <div className={cn(nowInfoCardStyles.detailItem)}>
      <Icon
        name={icon}
        tone={"subtle"}
        className={cn(nowInfoCardStyles.detailIcon, "h-8", "w-8")}
      />
      <div className={cn(nowInfoCardStyles.detailText)}>
        <span className={cn(nowInfoCardStyles.detailLabel)}>{label}</span>
        <span className={cn(nowInfoCardStyles.detailValue)}>{formatMetric(value, unit)}</span>
      </div>
    </div>
  );
};
