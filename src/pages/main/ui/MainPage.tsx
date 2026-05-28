import { fetchRegionNameFromCoord } from "@/entities/kakao/api/fetchRegionNameFromCoord";
import type { GridCoord, LatLon } from "@/entities/weather/model/weather.types";
import type { BookmarkItem } from "@/features/bookmark/model/types";
import { readBookmarkFromStorage } from "@/features/bookmark/model/useBookmarks";
import { useAirQualitySummary } from "@/features/air-quality/model/useAirQualitySummary";
import { useWeatherSummary } from "@/features/get-current-weather/model/useWeatherSummary";
import { isAppError } from "@/shared/api/types";
import { cn } from "@/shared/lib/cn";
import { getUserLocation } from "@/shared/lib/userLocation";
import { IconInput } from "@/shared/ui/input";
import { KakaoRegionMap } from "@/shared/ui/map";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAirQualityDisplayDistrict } from "../lib/air-quality-display.lib";
import { buildDistrictDisplay } from "../lib/district-display.lib";
import { AirQualityMetricCard } from "./AirQualityMetricCard";
import { FavoritePreviewPanel } from "./FavoritePreviewPanel";
import { HourlyInfoCard } from "./HourlyInfoCard";
import { NowInfoCard } from "./NowInfoCard";
import { OutfitRecommendationCard } from "./OutfitRecommendationCard";
import { mainPageStyles } from "./styles";

const formatProbability = (value: number | null | undefined): string => {
  if (typeof value !== "number") {
    return "--";
  }

  return String(value);
};

export default function MainPage() {
  const routelocation = useLocation();
  const { param, displayDistrict, displayAlias } = useMemo((): {
    param: GridCoord;
    displayDistrict: string;
    displayAlias: string;
  } => {
    const queryParams = new URLSearchParams(routelocation.search);
    const queryLocation = queryParams.get("location") ?? "";
    const bookmarkId = queryParams.get("id");

    if (bookmarkId) {
      const bookmarkList: BookmarkItem[] = readBookmarkFromStorage();
      const bookmark = bookmarkList.find((_bookmark) => _bookmark.id === bookmarkId);

      if (bookmark) {
        return {
          param: { nx: bookmark.nx, ny: bookmark.ny },
          displayDistrict: bookmark.displayName,
          displayAlias: bookmark.alias?.trim() || bookmark.displayName,
        };
      }
    }

    return {
      param: {
        nx: Number(queryParams.get("nx")) || Number.POSITIVE_INFINITY,
        ny: Number(queryParams.get("ny")) || Number.POSITIVE_INFINITY,
      },
      displayDistrict: queryLocation,
      displayAlias: queryLocation,
    };
  }, [routelocation.search]);

  const { data, isLoading, isFetching, error, refresh } = useWeatherSummary(param);
  const navigate = useNavigate();
  const [favoritePreviewList, setFavoritePreviewList] = useState<BookmarkItem[]>(() =>
    readBookmarkFromStorage(),
  );
  const [currentRegionName, setCurrentRegionName] = useState("");
  const [currentLatLon, setCurrentLatLon] = useState<LatLon | null>(null);
  const [currentRegionError, setCurrentRegionError] = useState("");

  useEffect(() => {
    const syncFavoritePreviewList = () => {
      setFavoritePreviewList(readBookmarkFromStorage());
    };

    window.addEventListener("focus", syncFavoritePreviewList);
    window.addEventListener("storage", syncFavoritePreviewList);

    return () => {
      window.removeEventListener("focus", syncFavoritePreviewList);
      window.removeEventListener("storage", syncFavoritePreviewList);
    };
  }, []);

  useEffect(() => {
    if (displayDistrict) {
      return;
    }

    let ignore = false;

    const loadCurrentRegionName = async () => {
      try {
        const userLocation = await getUserLocation();
        const regionName = await fetchRegionNameFromCoord(userLocation);
        if (!ignore) {
          setCurrentRegionName(regionName);
          setCurrentLatLon(userLocation);
          setCurrentRegionError("");
        }
      } catch (fetchError: unknown) {
        if (ignore) return;
        setCurrentRegionName("");
        setCurrentLatLon(null);

        if (isAppError(fetchError)) {
          alert(fetchError.meta.description);
          setCurrentRegionError(fetchError.meta.description);
          return;
        }

        alert("지역 정보를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        setCurrentRegionError(
          "지역 정보를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
        );
      }
    };

    void loadCurrentRegionName();

    return () => {
      ignore = true;
    };
  }, [displayDistrict]);

  const locationLabel = displayDistrict || currentRegionName;
  const aliasLabel = displayAlias || currentRegionName;
  const airQuality = useAirQualitySummary(locationLabel);
  const districtDisplay = buildDistrictDisplay({
    district: locationLabel || "알 수 없음",
    alias: aliasLabel || "",
  });
  const searchParams = new URLSearchParams({
    location: displayDistrict,
  });
  const mapLocationLabel = locationLabel || displayDistrict;
  const mapCoordinates = displayDistrict ? null : currentLatLon;

  return (
    <div className={cn(mainPageStyles.page)}>
      <div className={cn(mainPageStyles.searchWrap)}>
        <IconInput
          value={displayDistrict}
          placeholder={"검색어 입력..."}
          aria-label={"검색어 입력..."}
          showIconButton={false}
          onClick={() => {
            navigate(`/search?${searchParams.toString()}`, { replace: true });
          }}
          readOnly
          disabled={false}
        />
        {currentRegionError && !displayDistrict && (
          <p className={cn(mainPageStyles.searchStatus)}>{currentRegionError}</p>
        )}
      </div>

      <div className={cn(mainPageStyles.dashboardGrid)}>
        <div className={cn(mainPageStyles.mainColumn)}>
          <div className={cn(mainPageStyles.section, mainPageStyles.heroSection)}>
            <NowInfoCard
              primaryDistrict={districtDisplay.primaryDistrict}
              secondaryDistrict={districtDisplay.secondaryDistrict}
              fullDistrict={districtDisplay.fullDistrict}
              isAlias={districtDisplay.isAlias}
              data={data}
              isLoading={isLoading}
              isFetching={isFetching}
              error={error}
              refresh={refresh}
            />
          </div>
          {!error && (
            <div className={cn(mainPageStyles.section)}>
              <OutfitRecommendationCard
                recommendation={data?.outfitRecommendation ?? null}
                isLoading={isLoading}
                isFetching={isFetching}
              />
            </div>
          )}
          <div className={cn(mainPageStyles.section)}>
            <div className={cn(mainPageStyles.sectionHeader)}>
              <h2
                className={cn(
                  mainPageStyles.sectionTitle,
                  isFetching && mainPageStyles.sectionTitleFetching,
                )}
              >
                Hourly Forecast
              </h2>
              <span className={cn(mainPageStyles.sectionActionText)}>24-hour view</span>
            </div>
            <HourlyInfoCard
              data={data}
              isLoading={isLoading}
              isFetching={isFetching}
              error={error}
              refresh={refresh}
            />
          </div>

          <div className={cn(mainPageStyles.metricGrid)}>
            <AirQualityMetricCard
              title={"Fine Dust"}
              metric={airQuality.data?.pm10}
              label={"미세먼지"}
              displayDistrict={getAirQualityDisplayDistrict(districtDisplay.fullDistrict)}
              isLoading={airQuality.isLoading}
              isError={airQuality.isError}
            />

            <AirQualityMetricCard
              title={"Ultra Fine Dust"}
              metric={airQuality.data?.pm25}
              label={"초미세먼지"}
              displayDistrict={getAirQualityDisplayDistrict(districtDisplay.fullDistrict)}
              isLoading={airQuality.isLoading}
              isError={airQuality.isError}
            />

            <div className={cn(mainPageStyles.metricCard)}>
              <div className={cn(mainPageStyles.metricHeader)}>
                <span className={cn(mainPageStyles.metricHeaderLabel)}>Rain Chance</span>
              </div>
              <strong className={cn(mainPageStyles.metricValue)}>
                {formatProbability(data?.precipitation.probability)}
                <span className={cn(mainPageStyles.metricUnit)}>%</span>
              </strong>
              <p className={cn(mainPageStyles.metricDescription)}>
                {data?.precipitation.rainAmountText || data?.precipitation.snowAmountText
                  ? [data.precipitation.rainAmountText, data.precipitation.snowAmountText]
                      .filter(Boolean)
                      .join(" · ")
                  : "강수 가능성을 확인하고 우산을 준비하세요."}
              </p>
            </div>

            <div className={cn(mainPageStyles.metricCard)}>
              <div className={cn(mainPageStyles.metricHeader)}>
                <span className={cn(mainPageStyles.metricHeaderLabel)}>Wind Speed</span>
              </div>
              <strong className={cn(mainPageStyles.metricValue)}>
                {data?.now.windSpeedMs ?? "--"}
                <span className={cn(mainPageStyles.metricUnit)}>m/s</span>
              </strong>
              <p className={cn(mainPageStyles.metricDescription)}>
                강풍이면 겉옷과 우산 고정에 주의하세요.
              </p>
            </div>
          </div>

          <KakaoRegionMap
            location={mapLocationLabel}
            coordinates={mapCoordinates}
            title={"Weather Map"}
            mapClassName={cn(mainPageStyles.mapCanvas)}
            showHeader={false}
            enableRadarView
          />
        </div>

        <FavoritePreviewPanel
          bookmarks={favoritePreviewList}
          onBookmarkClick={(bookmark) => {
            const nextSearchParams = new URLSearchParams({
              location: bookmark.displayName,
              nx: String(bookmark.nx),
              ny: String(bookmark.ny),
              id: bookmark.id,
            });
            navigate(`/?${nextSearchParams.toString()}`);
          }}
          onAddClick={() => {
            navigate("/search");
          }}
          onManageClick={() => {
            navigate("/bookmark");
          }}
        />
      </div>
    </div>
  );
}
