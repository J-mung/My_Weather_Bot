import { useEffect, useRef, useState } from "react";

import { weatherConditionMeta } from "@/entities/weather/model/weather-condition-meta";
import { useBookmarkForecastPreview } from "@/features/bookmark/model/useBookmarkForecastPreview";
import { cn } from "@/shared/lib/cn";
import Button, { IconButton } from "@/shared/ui/button";
import { ErrorCode } from "@/shared/ui/error-code";
import { Icon } from "@/shared/ui/icon";
import { Skeleton } from "@/shared/ui/skeleton";
import {
  formatFavoritePreviewTemperature,
  formatFavoritePreviewTemperatureRange,
} from "../lib/favorite-preview-display.lib";
import { favoritePreviewPanelStyles } from "./styles";
import type { FavoritePreviewCardProps, FavoritePreviewPanelProps } from "./types";

const MAX_PREVIEW_COUNT = 3;

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

const FavoritePreviewWeather = ({ bookmark }: Pick<FavoritePreviewCardProps, "bookmark">) => {
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

const FavoritePreviewCard = ({ bookmark, onClick }: FavoritePreviewCardProps) => {
  const title = bookmark.alias.trim() || bookmark.displayName;

  return (
    <article className={cn(favoritePreviewPanelStyles.card)}>
      <button
        type={"button"}
        className={cn(favoritePreviewPanelStyles.cardButton)}
        onClick={onClick}
      >
        <div className={"min-w-0"}>
          <p className={cn(favoritePreviewPanelStyles.cardTitle)}>{title}</p>
          <p className={cn(favoritePreviewPanelStyles.cardLocation)}>{bookmark.displayName}</p>
        </div>
        <Icon name={"arrowUp"} tone={"subtle"} className={cn(favoritePreviewPanelStyles.moreIcon)} />
      </button>
      <FavoritePreviewWeather bookmark={bookmark} />
    </article>
  );
};

export const FavoritePreviewPanel = ({
  bookmarks,
  onBookmarkClick,
  onAddClick,
  onManageClick,
}: FavoritePreviewPanelProps) => {
  const previewBookmarks = bookmarks.slice(0, MAX_PREVIEW_COUNT);

  return (
    <aside className={cn(favoritePreviewPanelStyles.root)} aria-label={"즐겨찾기 미리보기"}>
      <div className={cn(favoritePreviewPanelStyles.header)}>
        <h2 className={cn(favoritePreviewPanelStyles.title)}>즐겨찾기</h2>
        <Button
          variant={"ghost"}
          size={"sm"}
          className={cn(favoritePreviewPanelStyles.manageButton)}
          onClick={onManageClick}
        >
          관리
        </Button>
      </div>

      <div className={cn(favoritePreviewPanelStyles.list)}>
        {previewBookmarks.map((bookmark) => (
          <FavoritePreviewCard
            key={bookmark.id}
            bookmark={bookmark}
            onClick={() => onBookmarkClick(bookmark)}
          />
        ))}

        {previewBookmarks.length === 0 && (
          <div className={cn(favoritePreviewPanelStyles.emptyCard)}>
            <Icon name={"bookmarkAdd"} tone={"subtle"} />
            <p className={cn(favoritePreviewPanelStyles.emptyTitle)}>아직 즐겨찾기가 없어요</p>
            <p className={cn(favoritePreviewPanelStyles.emptyDescription)}>
              자주 보는 지역을 추가하면 메인에서 빠르게 확인할 수 있어요.
            </p>
          </div>
        )}

        <button
          type={"button"}
          className={cn(favoritePreviewPanelStyles.addButton)}
          onClick={onAddClick}
        >
          <Icon name={"addCircle"} tone={"subtle"} />
          <span>지역 추가</span>
        </button>
      </div>
    </aside>
  );
};
