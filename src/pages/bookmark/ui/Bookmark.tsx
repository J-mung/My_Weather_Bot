import { fetchRegionNameFromCoord } from "@/entities/kakao/api/fetchRegionNameFromCoord";
import { useBookmarkForecastPreview } from "@/features/bookmark/model/useBookmarkForecastPreview";
import { useBookmarks } from "@/features/bookmark/model/useBookmarks";
import { isAppError } from "@/shared/api/types";
import { cn } from "@/shared/lib/cn";
import { convertToGridCoord } from "@/shared/lib/convertToGridCoord";
import { getUserLocation } from "@/shared/lib/userLocation";
import Button from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";
import { Skeleton } from "@/shared/ui/skeleton";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookmarkCardList } from "./card/BookmarkCardList";
import { bookmarkCurrentLocationStyles, bookmarkPageStyles } from "./styles";

import type { GridCoord } from "@/entities/weather/model/weather.types";

const formatTemperature = (value: number): string => `${Math.round(value)}°`;
const formatForecastTemperature = (value: number | null): string => {
  if (value === null) {
    return "--°";
  }

  return `${Math.round(value)}°`;
};

const formatTemperatureRange = (todayMax: number, todayMin: number): string =>
  `최고 ${formatTemperature(todayMax)} · 최저 ${formatTemperature(todayMin)}`;

const CurrentLocationSkeletonCard = () => (
  <div className={cn(bookmarkCurrentLocationStyles.card)}>
    <div className={cn(bookmarkCurrentLocationStyles.header)}>
      <div className={"min-w-0 flex-1"}>
        <Skeleton className={"h-4 w-36"} />
        <Skeleton className={"mt-3 h-10 w-full max-w-80"} />
      </div>
      <Skeleton rounded={"full"} className={"h-14 w-14 shrink-0"} />
    </div>

    <div className={cn(bookmarkCurrentLocationStyles.body)}>
      <Skeleton className={"h-5 w-32"} />
      <Skeleton className={"mt-3 h-8 w-full max-w-80"} />
    </div>
  </div>
);

const CurrentLocationForecastCard = ({
  regionName,
  gridCoord,
}: {
  regionName: string;
  gridCoord: GridCoord;
}) => {
  const navigate = useNavigate();
  const { data, isFetching, isLoading, error } = useBookmarkForecastPreview(gridCoord);
  const forecastTemperature = data ? formatForecastTemperature(data.forecastTemperature) : "--°";
  const forecastRange = data ? formatTemperatureRange(data.todayMax, data.todayMin) : "";

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
          <p className={cn(bookmarkCurrentLocationStyles.eyebrow)}>Current Location</p>
          <h2 className={cn(bookmarkCurrentLocationStyles.title)}>{regionName}</h2>
        </div>
        <Icon
          name={"wbSunny"}
          tone={"current"}
          className={cn(bookmarkCurrentLocationStyles.icon)}
        />
      </div>

      <div className={cn(bookmarkCurrentLocationStyles.body)}>
        {isLoading && (
          <div>
            <Skeleton className={"h-5 w-32"} />
            <Skeleton className={"mt-3 h-8 w-full max-w-80"} />
          </div>
        )}

        {!isLoading && error && (
          <div className={cn(bookmarkCurrentLocationStyles.statusWrap)}>
            <div className={cn(bookmarkCurrentLocationStyles.forecastTitle)}>
              <Icon
                name={"error"}
                size={"sm"}
                tone={"danger"}
                className={cn(bookmarkCurrentLocationStyles.forecastTitleIcon)}
              />
              <span>예보를 불러오지 못했어요</span>
            </div>
            <span className={cn(bookmarkCurrentLocationStyles.forecastDetail)}>
              {error.meta.description}
            </span>
          </div>
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

export default function BookmarkPage() {
  const { bookmarkList, isFull, deleteBookmark, updateAlias, remainingList, totalBookmarkList } =
    useBookmarks();
  const navigate = useNavigate();
  const [isManageMode, setIsManageMode] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    regionName: string;
    gridCoord: GridCoord;
  } | null>(null);
  const [currentLocationError, setCurrentLocationError] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadCurrentLocation = async () => {
      try {
        const userLocation = await getUserLocation();
        const [regionName] = await Promise.all([
          fetchRegionNameFromCoord(userLocation),
          Promise.resolve(),
        ]);

        if (ignore) return;

        setCurrentLocation({
          regionName,
          gridCoord: convertToGridCoord(userLocation),
        });
        setCurrentLocationError("");
      } catch (error: unknown) {
        if (ignore) return;

        if (isAppError(error)) {
          setCurrentLocationError(error.meta.description);
          return;
        }

        setCurrentLocationError("현재 위치 대표 카드를 불러오지 못했습니다.");
      }
    };

    void loadCurrentLocation();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className={cn(bookmarkPageStyles.page)}>
      <section className={cn(bookmarkPageStyles.hero)}>
        <div className={cn(bookmarkPageStyles.heroText)}>
          <p className={cn(bookmarkPageStyles.eyebrow)}>Your Locations</p>
          <h1 className={cn(bookmarkPageStyles.title)}>Manage Favorites</h1>
          <p className={cn(bookmarkPageStyles.description)}>
            자주 확인하는 지역을 저장하고 메인 날씨 화면으로 빠르게 이동하세요.
          </p>
        </div>
        <div className={cn(bookmarkPageStyles.actionList)}>
          <Button
            type={"button"}
            variant={"secondary"}
            size={"md"}
            className={cn(bookmarkPageStyles.actionButton)}
            onClick={() => {
              setIsManageMode((prev) => !prev);
            }}
          >
            <Icon name={"edit"} />
            {isManageMode ? "Done" : "Edit List"}
          </Button>
          <Button
            type={"button"}
            variant={"primary"}
            size={"md"}
            className={cn(bookmarkPageStyles.actionButton)}
            onClick={() => {
              navigate("/search");
            }}
          >
            <Icon name={"addCircle"} />
            Add New
          </Button>
        </div>
      </section>

      <div className={cn(bookmarkPageStyles.remainSlotWrap)}>
        <span className={cn(bookmarkPageStyles.remainSlotContent)}>
          북마크 {remainingList} / {totalBookmarkList}
        </span>
        {isFull ? (
          <span className={cn(bookmarkPageStyles.remainSlotContent)}>
            북마크는 최대 6개까지 가능합니다.
          </span>
        ) : (
          <span className={cn(bookmarkPageStyles.remainSlotHint)}>
            {totalBookmarkList - remainingList}개 더 추가할 수 있어요.
          </span>
        )}
      </div>

      {currentLocation ? (
        <CurrentLocationForecastCard
          regionName={currentLocation.regionName}
          gridCoord={currentLocation.gridCoord}
        />
      ) : !currentLocationError ? (
        <CurrentLocationSkeletonCard />
      ) : (
        <div className={cn(bookmarkCurrentLocationStyles.card)}>
          <p className={cn(bookmarkCurrentLocationStyles.eyebrow)}>Current Location</p>
          <h2 className={cn(bookmarkCurrentLocationStyles.title)}>
            {currentLocationError}
          </h2>
          <p className={cn(bookmarkCurrentLocationStyles.placeholderText)}>
            권한을 허용하거나 검색에서 지역을 추가해 주세요.
          </p>
        </div>
      )}

      <BookmarkCardList
        key={isManageMode ? "manage" : "view"}
        bookmarkList={bookmarkList}
        isFull={isFull}
        isManageMode={isManageMode}
        deleteBookmark={deleteBookmark}
        updateAlias={updateAlias}
        onAddBookmark={() => {
          navigate("/search");
        }}
      />

      <button
        type={"button"}
        className={cn(bookmarkPageStyles.manageAlertsCard)}
        onClick={() => {
          navigate("/search");
        }}
      >
        <span className={cn(bookmarkPageStyles.manageAlertsIcon)}>
          <Icon name={"cloudAlert"} />
        </span>
        <span className={cn(bookmarkPageStyles.manageAlertsText)}>
          <strong>Manage Alerts</strong>
          <span>알림 기능은 이후 단계에서 연결할 예정이에요.</span>
        </span>
        <Icon name={"arrowUp"} className={cn(bookmarkPageStyles.manageAlertsArrow)} />
      </button>
    </div>
  );
}
