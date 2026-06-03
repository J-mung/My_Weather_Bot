import { fetchRegionNameFromCoord } from "@/entities/kakao/api/fetchRegionNameFromCoord";
import { APP_ERROR, appErrorMetaMap } from "@/shared/api/app-errors";
import { weatherConditionMeta } from "@/entities/weather/model/weather-condition-meta";
import type { GridCoord } from "@/entities/weather/model/weather.types";
import { useBookmarkForecastPreview } from "@/features/bookmark/model/useBookmarkForecastPreview";
import { useBookmarks } from "@/features/bookmark/model/useBookmarks";
import { isAppError, type AppErrorMeta } from "@/shared/api/types";
import { cn } from "@/shared/lib/cn";
import { convertToGridCoord } from "@/shared/lib/convertToGridCoord";
import { getUserLocation } from "@/shared/lib/userLocation";
import Button from "@/shared/ui/button";
import { ErrorCode } from "@/shared/ui/error-code";
import { Icon } from "@/shared/ui/icon";
import { Skeleton } from "@/shared/ui/skeleton";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookmarkCardList } from "./card/BookmarkCardList";
import { bookmarkCurrentLocationStyles, bookmarkPageStyles } from "./styles";

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
              <ErrorCode code={error.meta.code} />
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

const CurrentLocationErrorCard = ({ errorMeta }: { errorMeta: AppErrorMeta }) => {
  return (
    <div className={cn(bookmarkCurrentLocationStyles.card)}>
      <div className={cn(bookmarkCurrentLocationStyles.header)}>
        <div className={"min-w-0"}>
          <span className={cn(bookmarkCurrentLocationStyles.eyebrow)}>현재 위치</span>
          <h2 className={cn(bookmarkCurrentLocationStyles.title)}>
            현재 위치를 불러오지 못했어요
          </h2>
        </div>
        <Icon
          name={"error"}
          size={"lg"}
          tone={"danger"}
          className={cn(bookmarkCurrentLocationStyles.icon)}
        />
      </div>

      <div className={cn(bookmarkCurrentLocationStyles.body)}>
        <div className={cn(bookmarkCurrentLocationStyles.statusWrap)}>
          <div className={cn(bookmarkCurrentLocationStyles.forecastTitle)}>
            <Icon
              name={"error"}
              size={"sm"}
              tone={"danger"}
              className={cn(bookmarkCurrentLocationStyles.forecastTitleIcon)}
            />
            <span>현재 위치 확인이 필요해요</span>
          </div>
          <span className={cn(bookmarkCurrentLocationStyles.forecastDetail)}>
            {errorMeta.description}
            <ErrorCode code={errorMeta.code} />
          </span>
        </div>
        <span className={cn(bookmarkCurrentLocationStyles.placeholderText)}>
          위치 권한을 허용하거나 검색에서 지역을 추가해 주세요.
        </span>
      </div>
    </div>
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
  const [currentLocationError, setCurrentLocationError] = useState<AppErrorMeta | null>(null);

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
        setCurrentLocationError(null);
      } catch (error: unknown) {
        if (ignore) return;

        if (isAppError(error)) {
          setCurrentLocationError(error.meta);
          return;
        }

        setCurrentLocationError(appErrorMetaMap[APP_ERROR.LOCATION_LOOKUP_UNEXPECTED]);
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
          <p className={cn(bookmarkPageStyles.eyebrow)}>내 지역</p>
          <h1 className={cn(bookmarkPageStyles.title)}>즐겨찾기 관리</h1>
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
            {isManageMode ? "완료" : "목록 편집"}
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
            새 지역 추가
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
        <CurrentLocationErrorCard errorMeta={currentLocationError} />
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
          <strong>알림 관리</strong>
          <span>알림 기능은 이후 단계에서 연결할 예정이에요.</span>
        </span>
        <Icon name={"arrowUp"} className={cn(bookmarkPageStyles.manageAlertsArrow)} />
      </button>
    </div>
  );
}
