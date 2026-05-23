import { fetchRegionNameFromCoord } from "@/entities/kakao/api/fetchRegionNameFromCoord";
import { useWeatherSummary } from "@/features/get-current-weather/model/useWeatherSummary";
import { useBookmarks } from "@/features/bookmark/model/useBookmarks";
import { isAppError } from "@/shared/api/types";
import { cn } from "@/shared/lib/cn";
import { convertToGridCoord } from "@/shared/lib/convertToGridCoord";
import { getUserLocation } from "@/shared/lib/userLocation";
import Button from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookmarkCardList } from "./card/BookmarkCardList";
import { bookmarkCurrentLocationStyles, bookmarkPageStyles } from "./styles";

import type { GridCoord } from "@/entities/weather/model/weather.types";

const formatTemperature = (value: number | null): string => {
  if (value === null) {
    return "--°";
  }

  return `${value}°`;
};

const formatRange = (min: number, max: number): string => `H:${max}° L:${min}°`;

const CurrentLocationWeatherCard = ({
  regionName,
  gridCoord,
}: {
  regionName: string;
  gridCoord: GridCoord;
}) => {
  const { data, isLoading, isFetching, error } = useWeatherSummary(gridCoord);
  const navigate = useNavigate();

  return (
    <button
      type={"button"}
      className={cn(
        bookmarkCurrentLocationStyles.card,
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
        <strong className={cn(bookmarkCurrentLocationStyles.temperature)}>
          {isLoading ? "--°" : formatTemperature(data?.now.temperature ?? null)}
        </strong>
        <div className={cn(bookmarkCurrentLocationStyles.meta)}>
          <span>{error ? "날씨 정보를 불러오지 못했어요" : "현재 위치 날씨"}</span>
          <span>{data ? formatRange(data.todayMin, data.todayMax) : "H:--° L:--°"}</span>
        </div>
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
        <CurrentLocationWeatherCard
          regionName={currentLocation.regionName}
          gridCoord={currentLocation.gridCoord}
        />
      ) : (
        <div className={cn(bookmarkCurrentLocationStyles.card)}>
          <p className={cn(bookmarkCurrentLocationStyles.eyebrow)}>Current Location</p>
          <h2 className={cn(bookmarkCurrentLocationStyles.title)}>
            {currentLocationError || "현재 위치 확인 중"}
          </h2>
          <p className={cn(bookmarkCurrentLocationStyles.placeholderText)}>
            {currentLocationError
              ? "권한을 허용하거나 검색에서 지역을 추가해 주세요."
              : "대표 날씨 카드를 준비하고 있어요."}
          </p>
        </div>
      )}

      <BookmarkCardList
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
