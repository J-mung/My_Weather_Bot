import { cn } from "@/shared/lib/cn";
import Button from "@/shared/ui/button";
import { Icon, type IconName } from "@/shared/ui/icon";
import { nowInfoCardStyles } from "./styles";
import type { DetailWeatherItem, NowInfoCardProps } from "./types";
import { weatherConditionMeta } from "./weatherConditionMeta";

const formatMetric = (value: number | null, unit: "%" | "°"): string => {
  if (value === null) {
    return `--${unit}`;
  }

  return `${value}${unit}`;
};

export const NowInfoCard = ({
  district,
  data,
  isLoading,
  isFetching,
  error,
  refresh,
}: NowInfoCardProps) => {
  const dateInfo = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const detailItems: DetailWeatherItem[] = data
    ? [
        { icon: "arrowUp" as const, label: "HIGH" as const, value: data.todayMax },
        { icon: "arrowDown" as const, label: "LOW" as const, value: data.todayMin },
        { icon: "waterDrop" as const, label: "HUMIDITY" as const, value: data.now.humidity },
      ]
    : [];
  const conditionMeta = data
    ? weatherConditionMeta[data.now.condition]
    : weatherConditionMeta["unavailable"];

  return (
    <div className={cn(nowInfoCardStyles.root)}>
      {isLoading && <div className={cn(nowInfoCardStyles.loading)}>Loading...</div>}
      {data && (
        <>
          <div className={cn(nowInfoCardStyles.header)}>
            <div className={cn(nowInfoCardStyles.headerText)}>
              <div className={cn(nowInfoCardStyles.titleRow)}>
                <span
                  className={cn(
                    nowInfoCardStyles.district,
                    isFetching && nowInfoCardStyles.districtLoading,
                  )}
                >
                  {district}
                </span>
                <Button
                  variant={"ghost"}
                  size={"icon"}
                  disabled={isFetching}
                  className={cn(nowInfoCardStyles.refreshButton)}
                  onClick={refresh}
                >
                  <Icon
                    name={"refresh"}
                    tone={"default"}
                    className={cn(isFetching && nowInfoCardStyles.refreshIconLoading)}
                  />
                </Button>
              </div>
              <div className={cn(nowInfoCardStyles.date)}>{dateInfo}</div>
            </div>
            <Icon
              name={conditionMeta.icon}
              tone={"subtle"}
              className={cn(nowInfoCardStyles.weatherIcon, "h-17", "w-17")}
            />
          </div>

          <div className={cn(nowInfoCardStyles.body)}>
            <div className={cn(nowInfoCardStyles.currentTemp)}>
              {formatMetric(data.now.temperature, "°")}
            </div>
            <div className={cn(nowInfoCardStyles.currentMeta)}>
              <div className={cn(nowInfoCardStyles.currentSummary)}>{conditionMeta.label}</div>
              <div className={cn(nowInfoCardStyles.currentFeelsLike)}>
                Feels like {formatMetric(data.now.feelsLike, "°")}
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
      {error && (
        <div className={cn(nowInfoCardStyles.error)}>
          <span>{error.message}</span>
        </div>
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
  label: "HIGH" | "LOW" | "HUMIDITY";
  value: number | null;
}) => {
  const unit = label === "HUMIDITY" ? "%" : "°";
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
