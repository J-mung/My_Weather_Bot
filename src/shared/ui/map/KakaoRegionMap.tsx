import { fetchLatLonByRegion } from "@/entities/kakao/api/fetchLatLonByRegion";
import { useRadarCompositeImage } from "@/entities/weather/model/useRadarCompositeImage";
import type { LatLon } from "@/entities/weather/model/weather.types";
import { isAppError } from "@/shared/api/types";
import { cn } from "@/shared/lib/cn";
import {
  loadKakaoMapSdk,
  type KakaoMap,
  type KakaoMarker,
} from "@/shared/lib/loadKakaoMapSdk";
import { useEffect, useRef, useState } from "react";
import { RadarCompositeImagePanel, RadarCompositeInfoPanel } from "./RadarCompositePanel";

export type KakaoRegionMapStatus = "idle" | "loading" | "success" | "error";
type WeatherMapView = "location" | "radar";

type KakaoRegionMapProps = {
  location: string;
  coordinates?: LatLon | null;
  title?: string;
  description?: string;
  className?: string;
  mapClassName?: string;
  emptyMessage?: string;
  showHeader?: boolean;
  enableRadarView?: boolean;
};

const DEFAULT_EMPTY_MESSAGE = "지도를 표시할 지역을 검색하거나 선택해 주세요.";
const DEFAULT_ERROR_MESSAGE = "지도를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";
const INITIAL_MAP_LEVEL = 5;
const MIN_MAP_LEVEL = 1;
const MAX_MAP_LEVEL = 14;
const ZOOM_ANIMATION_DURATION_MS = 300;

export const KakaoRegionMap = ({
  location,
  coordinates = null,
  title = "Weather Map",
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
      } catch (error: unknown) {
        if (ignore) {
          return;
        }

        mapRef.current = null;
        markerRef.current?.setMap(null);
        markerRef.current = null;
        mapContainerRef.current?.replaceChildren();
        setStatus("error");
        setMessage(
          isAppError(error)
            ? error.meta.description
            : error instanceof Error
              ? error.message
              : DEFAULT_ERROR_MESSAGE,
        );
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
        {enableRadarView && (
          <div
            className={cn(
              "absolute left-3 top-3 z-20 flex overflow-hidden rounded-full border border-[var(--line)] bg-white/95 p-1 shadow-sm backdrop-blur",
            )}
            role={"tablist"}
            aria-label={"지도 보기 전환"}
          >
            <button
              type={"button"}
              role={"tab"}
              aria-selected={activeView === "location"}
              className={cn(
                "rounded-full px-3 py-2 text-xs font-extrabold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
                activeView === "location"
                  ? "bg-[var(--text-main)] text-white"
                  : "text-[var(--text-sub)] hover:bg-[var(--surface-soft)]",
              )}
              onClick={() => setActiveView("location")}
            >
              위치 지도
            </button>
            <button
              type={"button"}
              role={"tab"}
              aria-selected={activeView === "radar"}
              className={cn(
                "rounded-full px-3 py-2 text-xs font-extrabold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
                activeView === "radar"
                  ? "bg-[var(--accent-strong)] text-white"
                  : "text-[var(--text-sub)] hover:bg-[var(--surface-soft)]",
              )}
              onClick={() => setActiveView("radar")}
            >
              강수 레이더
            </button>
          </div>
        )}
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
          <div
            className={cn(
              "absolute right-3 top-3 z-10 flex overflow-hidden rounded-full border border-[var(--line)] bg-white/95 shadow-sm backdrop-blur",
            )}
            aria-label={"지도 확대/축소"}
          >
            <button
              type={"button"}
              className={cn(
                "grid h-10 w-10 place-items-center text-xl font-extrabold text-[var(--text-main)] transition hover:bg-[var(--surface-soft)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--accent)] disabled:cursor-not-allowed disabled:text-[var(--text-muted)]",
              )}
              aria-label={"지도 확대"}
              disabled={mapLevel <= MIN_MAP_LEVEL}
              onClick={() => updateMapLevel(-1)}
            >
              +
            </button>
            <button
              type={"button"}
              className={cn(
                "grid h-10 w-10 place-items-center border-l border-[var(--line)] text-xl font-extrabold text-[var(--text-main)] transition hover:bg-[var(--surface-soft)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--accent)] disabled:cursor-not-allowed disabled:text-[var(--text-muted)]",
              )}
              aria-label={"지도 축소"}
              disabled={mapLevel >= MAX_MAP_LEVEL}
              onClick={() => updateMapLevel(1)}
            >
              −
            </button>
          </div>
        )}
        {shouldShowStatus && (
          <div
            className={cn(
              "absolute inset-0 grid place-items-center bg-[var(--surface-soft)] px-5 text-center",
            )}
          >
            <div className={cn("max-w-sm")}>
              <span className={cn("block font-extrabold text-[var(--text-main)]")}>
                {effectiveStatus === "loading"
                  ? "지도를 불러오고 있어요"
                  : effectiveStatus === "idle"
                    ? "지도 표시 지역을 선택해 주세요"
                    : "지도를 표시하지 못했어요"}
              </span>
              <span className={cn("mt-2 block text-sm leading-6 text-[var(--text-sub)]")}>
                {effectiveMessage || DEFAULT_ERROR_MESSAGE}
              </span>
            </div>
          </div>
        )}
      </div>
      {isRadarViewActive && <RadarCompositeInfoPanel data={radarImage.data} />}
    </section>
  );
};
