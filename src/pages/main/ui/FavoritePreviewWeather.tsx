import { weatherConditionMeta } from "@/entities/weather/model/weather-condition-meta";
import { useBookmarkForecastPreview } from "@/features/bookmark/model/useBookmarkForecastPreview";
import { cn } from "@/shared/lib/cn";
import { IconButton } from "@/shared/ui/button";
import { ErrorCode } from "@/shared/ui/error-code";
import { Icon } from "@/shared/ui/icon";
import { Skeleton } from "@/shared/ui/skeleton";
import {
  formatFavoritePreviewTemperature,
  formatFavoritePreviewTemperatureRange,
} from "../lib/favorite-preview-display.lib";
import { useVisibleOnce } from "../lib/useVisibleOnce";
import { favoritePreviewPanelStyles } from "./styles";
import type { FavoritePreviewCardProps } from "./types";

export const FavoritePreviewWeather = ({
  bookmark,
}: Pick<FavoritePreviewCardProps, "bookmark">) => {
  const { targetRef, isVisible } = useVisibleOnce();
  const { data, isLoading, error, refresh } = useBookmarkForecastPreview(
    { nx: bookmark.nx, ny: bookmark.ny },
    { enabled: isVisible },
  );

  if (!isVisible || isLoading) {
    return (
      <div ref={targetRef} className={cn(favoritePreviewPanelStyles.weatherPreview)}>
        <Skeleton className={"h-9 w-16"} />
        <div className={cn(favoritePreviewPanelStyles.weatherPreviewText)}>
          <Skeleton className={"h-4 w-20"} />
          <Skeleton className={"h-3 w-32"} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div ref={targetRef} className={cn(favoritePreviewPanelStyles.weatherError)}>
        <div className={cn(favoritePreviewPanelStyles.weatherErrorText)}>
          <span>예보를 불러오지 못했어요</span>
          <ErrorCode code={error.meta.code} className={"mt-0 text-[0.6875rem]"} />
        </div>
        <IconButton
          type={"button"}
          variant={"ghost"}
          size={"sm"}
          iconName={"refresh"}
          iconSize={"sm"}
          className={cn(favoritePreviewPanelStyles.weatherRetryButton)}
          onClick={(event) => {
            event.stopPropagation();
            void refresh();
          }}
        >
          다시 시도
        </IconButton>
      </div>
    );
  }

  if (!data) {
    return (
      <div ref={targetRef} className={cn(favoritePreviewPanelStyles.weatherError)}>
        예보를 확인 중이에요
      </div>
    );
  }

  const conditionMeta = weatherConditionMeta[data.condition];

  return (
    <div ref={targetRef} className={cn(favoritePreviewPanelStyles.weatherPreview)}>
      <Icon
        name={conditionMeta.icon}
        className={cn(favoritePreviewPanelStyles.weatherIcon, conditionMeta.iconClassName)}
      />
      <div className={cn(favoritePreviewPanelStyles.weatherPreviewText)}>
        <span className={cn(favoritePreviewPanelStyles.weatherPrimary)}>
          {formatFavoritePreviewTemperature(data.forecastTemperature)}
          <span className={cn(favoritePreviewPanelStyles.weatherCondition)}>
            {conditionMeta.label}
          </span>
        </span>
        <span className={cn(favoritePreviewPanelStyles.weatherRange)}>
          {formatFavoritePreviewTemperatureRange(data.todayMax, data.todayMin)}
        </span>
      </div>
    </div>
  );
};
