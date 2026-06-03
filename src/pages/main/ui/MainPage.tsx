import { fetchRegionNameFromCoord } from "@/entities/kakao/api/fetchRegionNameFromCoord";
import type { GridCoord, LatLon } from "@/entities/weather/model/weather.types";
import { useAirQualitySummary } from "@/features/air-quality/model/useAirQualitySummary";
import type { BookmarkItem } from "@/features/bookmark/model/types";
import { readBookmarkFromStorage } from "@/features/bookmark/model/useBookmarks";
import { useWeatherSummary } from "@/features/get-current-weather/model/useWeatherSummary";
import { APP_ERROR, appErrorMetaMap } from "@/shared/api/app-errors";
import type { AppErrorMeta } from "@/shared/api/types";
import { isAppError } from "@/shared/api/types";
import { cn } from "@/shared/lib/cn";
import { convertToGridCoord } from "@/shared/lib/convertToGridCoord";
import {
  createRequestAttemptState,
  recordRequestFailure,
  resetRequestAttemptState,
  type RequestAttemptPolicy,
  type RequestAttemptState,
} from "@/shared/lib/requestAttemptPolicy";
import { getUserLocation } from "@/shared/lib/userLocation";
import { ErrorCode } from "@/shared/ui/error-code";
import { IconInput } from "@/shared/ui/input";
import { KakaoRegionMap } from "@/shared/ui/map";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAirQualityDisplayDistrict } from "../lib/air-quality-display.lib";
import { buildDistrictDisplay } from "../lib/district-display.lib";
import { AirQualityMetricCard } from "./AirQualityMetricCard";
import { FavoritePreviewPanel } from "./FavoritePreviewPanel";
import { HourlyInfoCard } from "./HourlyInfoCard";
import {
  LocationPermissionDialog,
  type LocationPermissionStatus,
} from "./LocationPermissionDialog";
import { NowInfoCard } from "./NowInfoCard";
import { OutfitRecommendationCard } from "./OutfitRecommendationCard";
import { mainPageStyles } from "./styles";

const formatProbability = (value: number | null | undefined): string => {
  if (typeof value !== "number") {
    return "--";
  }

  return String(value);
};

const hasResolvedGridCoord = ({ nx, ny }: GridCoord): boolean =>
  Number.isFinite(nx) && Number.isFinite(ny);

const LOCATION_REQUEST_ATTEMPT_POLICY: RequestAttemptPolicy = {
  maxFailures: 3,
  minFeedbackMs: 700,
};

const waitForMinimumFeedback = async (startedAt: number): Promise<void> => {
  const elapsedMs = Date.now() - startedAt;
  const remainingMs = LOCATION_REQUEST_ATTEMPT_POLICY.minFeedbackMs - elapsedMs;

  if (remainingMs > 0) {
    await new Promise((resolve) => window.setTimeout(resolve, remainingMs));
  }
};

type CurrentLocationResolution =
  | {
      status: "success";
      regionName: string;
      userLocation: LatLon;
    }
  | {
      status: "error";
      errorMeta: AppErrorMeta;
      isPermissionDenied: boolean;
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

  const navigate = useNavigate();
  const [favoritePreviewList, setFavoritePreviewList] = useState<BookmarkItem[]>(() =>
    readBookmarkFromStorage(),
  );
  const [currentRegionName, setCurrentRegionName] = useState("");
  const [currentLatLon, setCurrentLatLon] = useState<LatLon | null>(null);
  const [currentRegionError, setCurrentRegionError] = useState<AppErrorMeta | null>(null);
  const [locationPermissionStatus, setLocationPermissionStatus] =
    useState<LocationPermissionStatus>("unknown");
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [locationRequestAttemptState, setLocationRequestAttemptState] =
    useState<RequestAttemptState>(() =>
      createRequestAttemptState(LOCATION_REQUEST_ATTEMPT_POLICY),
    );
  const isLocationRequestInFlightRef = useRef(false);
  const locationRequestAttemptStateRef = useRef(locationRequestAttemptState);
  const weatherParam = currentLatLon && !displayDistrict ? convertToGridCoord(currentLatLon) : param;
  const isWeatherEnabled = displayDistrict
    ? hasResolvedGridCoord(param)
    : currentLatLon !== null;
  const { data, isLoading, isFetching, error, refresh } = useWeatherSummary(weatherParam, {
    enabled: isWeatherEnabled,
  });

  useEffect(() => {
    locationRequestAttemptStateRef.current = locationRequestAttemptState;
  }, [locationRequestAttemptState]);

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

  const navigateToLocationRequestLimitError = useCallback(() => {
    navigate("/error?reason=location-request-limit", { replace: true });
  }, [navigate]);

  const loadCurrentRegionName = useCallback(async () => {
    if (isLocationRequestInFlightRef.current) {
      return;
    }

    if (locationRequestAttemptStateRef.current.isLimitReached) {
      navigateToLocationRequestLimitError();
      return;
    }

    isLocationRequestInFlightRef.current = true;
    setIsRequestingLocation(true);
    const startedAt = Date.now();
    let resolution: CurrentLocationResolution;

    try {
      const userLocation = await getUserLocation();
      const regionName = await fetchRegionNameFromCoord(userLocation);

      resolution = {
        status: "success",
        regionName,
        userLocation,
      };
    } catch (fetchError: unknown) {
      const errorMeta = isAppError(fetchError)
        ? fetchError.meta
        : appErrorMetaMap[APP_ERROR.LOCATION_LOOKUP_UNEXPECTED];

      resolution = {
        status: "error",
        errorMeta,
        isPermissionDenied:
          isAppError(fetchError) && fetchError.type === APP_ERROR.LOCATION_PERMISSION,
      };
    }

    await waitForMinimumFeedback(startedAt);

    if (resolution.status === "success") {
      setCurrentRegionName(resolution.regionName);
      setCurrentLatLon(resolution.userLocation);
      setCurrentRegionError(null);
      setLocationPermissionStatus("granted");
      setIsLocationDialogOpen(false);
      const resetState = resetRequestAttemptState(LOCATION_REQUEST_ATTEMPT_POLICY);
      locationRequestAttemptStateRef.current = resetState;
      setLocationRequestAttemptState(resetState);
    } else {
      const nextAttemptState = recordRequestFailure(
        locationRequestAttemptStateRef.current,
        LOCATION_REQUEST_ATTEMPT_POLICY,
      );
      locationRequestAttemptStateRef.current = nextAttemptState;
      setLocationRequestAttemptState(nextAttemptState);

      if (resolution.isPermissionDenied) {
        setLocationPermissionStatus("denied");
      }

      if (nextAttemptState.isLimitReached) {
        setIsRequestingLocation(false);
        isLocationRequestInFlightRef.current = false;
        navigateToLocationRequestLimitError();
        return;
      }

      setCurrentRegionName("");
      setCurrentLatLon(null);
      setCurrentRegionError(resolution.errorMeta);
      setIsLocationDialogOpen(true);
    }

    setIsRequestingLocation(false);
    isLocationRequestInFlightRef.current = false;
  }, [navigateToLocationRequestLimitError]);

  useEffect(() => {
    if (displayDistrict) {
      return;
    }

    if (!("geolocation" in navigator)) {
      const unsupportedTimer = window.setTimeout(() => {
        setLocationPermissionStatus("unsupported");
        setCurrentRegionError(appErrorMetaMap[APP_ERROR.LOCATION_UNAVAILABLE]);
        setIsLocationDialogOpen(true);
      }, 0);

      return () => {
        window.clearTimeout(unsupportedTimer);
      };
    }

    let ignore = false;
    let permissionStatus: PermissionStatus | null = null;

    const prepareCurrentLocation = async () => {
      if (!("permissions" in navigator) || !navigator.permissions.query) {
        setIsLocationDialogOpen(true);
        return;
      }

      try {
        permissionStatus = await navigator.permissions.query({
          name: "geolocation" as PermissionName,
        });

        if (ignore) {
          return;
        }

        const applyPermissionState = () => {
          if (!permissionStatus) {
            return;
          }

          const nextState = permissionStatus.state;
          setLocationPermissionStatus(nextState);

          if (nextState === "granted") {
            setIsLocationDialogOpen(false);
            void loadCurrentRegionName();
            return;
          }

          setIsLocationDialogOpen(true);
        };

        permissionStatus.onchange = applyPermissionState;
        applyPermissionState();
      } catch {
        if (!ignore) {
          setLocationPermissionStatus("unknown");
          setIsLocationDialogOpen(true);
        }
      }
    };

    void prepareCurrentLocation();

    return () => {
      ignore = true;
      if (permissionStatus) {
        permissionStatus.onchange = null;
      }
    };
  }, [displayDistrict, loadCurrentRegionName]);

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
          <p className={cn(mainPageStyles.searchStatus)}>
            {currentRegionError.description}
            <ErrorCode code={currentRegionError.code} />
          </p>
        )}
      </div>

      <LocationPermissionDialog
        isOpen={isLocationDialogOpen && !displayDistrict}
        status={locationPermissionStatus}
        error={currentRegionError}
        isRequesting={isRequestingLocation}
        onRequestLocation={() => {
          void loadCurrentRegionName();
        }}
        onSearchLocation={() => {
          setIsLocationDialogOpen(false);
          navigate("/search", { replace: true });
        }}
      />

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
                시간대별 예보
              </h2>
              <span className={cn(mainPageStyles.sectionActionText)}>24시간 보기</span>
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
              title={"미세먼지"}
              metric={airQuality.data?.pm10}
              label={"미세먼지"}
              displayDistrict={getAirQualityDisplayDistrict(districtDisplay.fullDistrict)}
              isLoading={airQuality.isLoading}
              isError={airQuality.isError}
              errorCode={airQuality.error?.code}
            />

            <AirQualityMetricCard
              title={"초미세먼지"}
              metric={airQuality.data?.pm25}
              label={"초미세먼지"}
              displayDistrict={getAirQualityDisplayDistrict(districtDisplay.fullDistrict)}
              isLoading={airQuality.isLoading}
              isError={airQuality.isError}
              errorCode={airQuality.error?.code}
            />

            <div className={cn(mainPageStyles.metricCard)}>
              <div className={cn(mainPageStyles.metricHeader)}>
                <span className={cn(mainPageStyles.metricHeaderLabel)}>강수확률</span>
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
                <span className={cn(mainPageStyles.metricHeaderLabel)}>풍속</span>
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
            title={"날씨 지도"}
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
