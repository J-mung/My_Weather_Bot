import { weatherConditionMeta } from "@/entities/weather/model/weather-condition-meta";
import type { GridCoord } from "@/entities/weather/model/weather.types";
import { useBookmarkForecastPreview } from "@/features/bookmark/model/useBookmarkForecastPreview";
import { cn } from "@/shared/lib/cn";
import { ErrorNotice } from "@/shared/ui/error-notice";
import { Icon } from "@/shared/ui/icon";
import { Skeleton } from "@/shared/ui/skeleton";
import {
  formatBookmarkCurrentForecastTemperature,
  formatBookmarkCurrentTemperatureRange,
} from "../lib/bookmark-current-location-display.lib";
import { bookmarkCurrentLocationStyles } from "./styles";
import { useNavigate } from "react-router-dom";

type CurrentLocationForecastCardProps = {
  regionName: string;
  gridCoord: GridCoord;
};

export const CurrentLocationForecastCard = ({
  regionName,
  gridCoord,
}: CurrentLocationForecastCardProps) => {
  const navigate = useNavigate();
  const { data, isFetching, isLoading, error } = useBookmarkForecastPreview(gridCoord);
  const forecastTemperature = data
    ? formatBookmarkCurrentForecastTemperature(data.forecastTemperature)
    : "--°";
  const forecastRange = data
    ? formatBookmarkCurrentTemperatureRange(data.todayMax, data.todayMin)
    : "";
  const conditionMeta = data ? weatherConditionMeta[data.condition] : weatherConditionMeta["cloudy"];

  return (
    <button
      type={"button"}
      className={cn(
        bookmarkCurrentLocationStyles.card,
        "cursor-pointer",
        isFetching && bookmarkCurrentLocationStyles.fetching,
      )}
      onClick={() => {
        const searchParams = new URLSearchParams({
          location: regionName,
          nx: String(gridCoord.nx),
          ny: String(gridCoord.ny),
        });
        navigate(`/?${searchParams.toString()}`);
      }}
    >
      <div className={cn(bookmarkCurrentLocationStyles.header)}>
        <div className={"min-w-0"}>
          <p className={cn(bookmarkCurrentLocationStyles.eyebrow)}>현재 위치</p>
          <h2 className={cn(bookmarkCurrentLocationStyles.title)}>{regionName}</h2>
        </div>
        {!error && (
          <Icon
            name={conditionMeta.icon}
            className={cn(bookmarkCurrentLocationStyles.icon, conditionMeta.iconClassName)}
          />
        )}
      </div>

      <div className={cn(bookmarkCurrentLocationStyles.body)}>
        {isLoading && (
          <div>
            <Skeleton className={"h-5 w-32"} />
            <Skeleton className={"mt-3 h-8 w-full max-w-80"} />
          </div>
        )}

        {!isLoading && error && (
          <ErrorNotice
            title={"예보를 불러오지 못했어요"}
            description={error.meta.description}
            code={error.meta.code}
            variant={"card"}
          />
        )}

        {!isLoading && !error && data && (
          <div className={cn(bookmarkCurrentLocationStyles.forecastTextGroup)}>
            <span className={cn(bookmarkCurrentLocationStyles.forecastTemperature)}>
              {forecastTemperature}
            </span>
            <span className={cn(bookmarkCurrentLocationStyles.forecastRange)}>
              {forecastRange}
            </span>
          </div>
        )}
      </div>
    </button>
  );
};
