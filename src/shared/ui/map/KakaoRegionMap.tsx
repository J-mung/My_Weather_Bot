import { fetchLatLonByRegion } from "@/entities/kakao/api/fetchLatLonByRegion";
import { useRadarCompositeImage } from "@/entities/weather/model/useRadarCompositeImage";
import type { LatLon } from "@/entities/weather/model/weather.types";
import { APP_ERROR, appErrorMetaMap } from "@/shared/api/app-errors";
import { isAppError } from "@/shared/api/types";
import { cn } from "@/shared/lib/cn";
import {
  loadKakaoMapSdk,
  type KakaoMap,
  type KakaoMarker,
} from "@/shared/lib/loadKakaoMapSdk";
import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_EMPTY_MESSAGE,
  DEFAULT_ERROR_MESSAGE,
  INITIAL_MAP_LEVEL,
  MAX_MAP_LEVEL,
  MIN_MAP_LEVEL,
  ZOOM_ANIMATION_DURATION_MS,
} from "./kakao-region-map.constants";
import type {
  KakaoRegionMapProps,
  KakaoRegionMapStatus,
  WeatherMapView,
} from "./kakao-region-map.types";
import { KakaoMapStatusOverlay } from "./KakaoMapStatusOverlay";
import { KakaoMapViewToggle } from "./KakaoMapViewToggle";
import { KakaoMapZoomControls } from "./KakaoMapZoomControls";
import { RadarCompositeImagePanel, RadarCompositeInfoPanel } from "./RadarCompositePanel";

export type { KakaoRegionMapStatus };

export const KakaoRegionMap = ({
  location,
  coordinates = null,
  title = "날씨 지도",
  description,
  className,
  mapClassName,
  emptyMessage = DEFAULT_EMPTY_MESSAGE,
  showHeader = true,
  enableRadarView = false,
}: KakaoRegionMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMap | null>(null);
  const markerRef = useRef<KakaoMarker | null>(null);
  const [status, setStatus] = useState<KakaoRegionMapStatus>("idle");
  const [message, setMessage] = useState(emptyMessage);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [mapLevel, setMapLevel] = useState(INITIAL_MAP_LEVEL);
  const [activeView, setActiveView] = useState<WeatherMapView>("location");
  const trimmedLocation = location.trim();
  const lat = coordinates?.lat;
  const lon = coordinates?.lon;
  const hasCoordinates = typeof lat === "number" && typeof lon === "number";
  const hasMapTarget = Boolean(trimmedLocation || hasCoordinates);

  useEffect(() => {
    if (!hasMapTarget) {
      mapRef.current = null;
      markerRef.current?.setMap(null);
      markerRef.current = null;
      mapContainerRef.current?.replaceChildren();
      return;
    }

    let ignore = false;

    const renderMap = async () => {
      const container = mapContainerRef.current;

      if (!container) {
        return;
      }

      setStatus("loading");
      setMessage("지도를 불러오고 있어요.");
      setErrorCode(null);

      try {
        const targetPromise: Promise<LatLon> = hasCoordinates
          ? Promise.resolve({ lat, lon } as LatLon)
          : fetchLatLonByRegion(trimmedLocation);
        const [target, kakaoMaps] = await Promise.all([targetPromise, loadKakaoMapSdk()]);

        if (ignore) {
          return;
        }

        const center = new kakaoMaps.LatLng(target.lat, target.lon);
        const map = new kakaoMaps.Map(container, {
          center,
          level: INITIAL_MAP_LEVEL,
        });
        const marker = new kakaoMaps.Marker({ position: center });
        marker.setMap(map);
        mapRef.current = map;
        markerRef.current = marker;
        setMapLevel(map.getLevel());
        setStatus("success");
        setMessage("");
        setErrorCode(null);
      } catch (error: unknown) {
        if (ignore) {
          return;
        }

        mapRef.current = null;
        markerRef.current?.setMap(null);
        markerRef.current = null;
        mapContainerRef.current?.replaceChildren();
        setStatus("error");
        if (isAppError(error)) {
          setMessage(error.meta.description);
          setErrorCode(error.meta.code);
          return;
        }

        const fallbackError = appErrorMetaMap[APP_ERROR.MAP_LOAD];
        setMessage(fallbackError.description || DEFAULT_ERROR_MESSAGE);
        setErrorCode(fallbackError.code);
      }
    };

    void renderMap();

    return () => {
      ignore = true;
      mapRef.current = null;
      markerRef.current?.setMap(null);
      markerRef.current = null;
    };
  }, [hasCoordinates, hasMapTarget, lat, lon, trimmedLocation]);

  const updateMapLevel = (delta: number) => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    const nextLevel = Math.min(MAX_MAP_LEVEL, Math.max(MIN_MAP_LEVEL, map.getLevel() + delta));
    map.setLevel(nextLevel, {
      animate: {
        duration: ZOOM_ANIMATION_DURATION_MS,
      },
    });
    setMapLevel(nextLevel);
  };

  const effectiveStatus = hasMapTarget ? status : "idle";
  const effectiveMessage = hasMapTarget ? message : emptyMessage;
  const effectiveErrorCode = hasMapTarget && effectiveStatus === "error" ? errorCode : null;
  const isRadarViewActive = enableRadarView && activeView === "radar";
  const radarImage = useRadarCompositeImage(isRadarViewActive);
  const shouldShowStatus = !isRadarViewActive && effectiveStatus !== "success";
  const shouldShowZoomControls = !isRadarViewActive && effectiveStatus === "success";
  const displayTitle = trimmedLocation || title;
  const displayDescription = description ?? "선택한 지역의 위치를 카카오 지도에서 확인합니다.";

  return (
    <section
      className={cn(
        "overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-white shadow-sm",
        className,
      )}
      aria-label={`${displayTitle} 지도`}
    >
      {showHeader && (
        <div className={cn("border-b border-[var(--line)] px-5 py-4 md:px-6")}>
          <span
            className={cn(
              "text-xs font-extrabold tracking-[0.18em] text-[var(--text-sub)] uppercase",
            )}
          >
            {title}
          </span>
          <h2
            className={cn(
              "mt-1 break-words text-xl font-extrabold tracking-[-0.03em] text-[var(--text-main)] md:text-2xl",
            )}
          >
            {displayTitle}
          </h2>
          <span className={cn("mt-1 block break-words text-sm leading-6 text-[var(--text-sub)]")}>
            {displayDescription}
          </span>
        </div>
      )}
      <div className={cn("relative bg-[var(--surface-soft)]", mapClassName)}>
        <div
          ref={mapContainerRef}
          className={cn(
            "h-full w-full transition-opacity duration-200",
            isRadarViewActive && "pointer-events-none opacity-0",
          )}
        />
        {enableRadarView && <KakaoMapViewToggle activeView={activeView} onChange={setActiveView} />}
        {isRadarViewActive && (
          <div className={cn("absolute inset-0 z-10")} role={"tabpanel"}>
            <RadarCompositeImagePanel
              data={radarImage.data}
              isLoading={radarImage.isLoading}
              isError={radarImage.isError}
              error={radarImage.error}
              refresh={radarImage.refresh}
            />
          </div>
        )}
        {shouldShowZoomControls && (
          <KakaoMapZoomControls
            mapLevel={mapLevel}
            onZoomIn={() => updateMapLevel(-1)}
            onZoomOut={() => updateMapLevel(1)}
          />
        )}
        {shouldShowStatus && (
          <KakaoMapStatusOverlay
            status={effectiveStatus}
            message={effectiveMessage}
            errorCode={effectiveErrorCode}
          />
        )}
      </div>
      {isRadarViewActive && <RadarCompositeInfoPanel data={radarImage.data} />}
    </section>
  );
};
