import { cn } from "@/shared/lib/cn";
import { MAX_MAP_LEVEL, MIN_MAP_LEVEL } from "./kakao-region-map.constants";

type KakaoMapZoomControlsProps = {
  mapLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
};

export const KakaoMapZoomControls = ({
  mapLevel,
  onZoomIn,
  onZoomOut,
}: KakaoMapZoomControlsProps) => (
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
      onClick={onZoomIn}
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
      onClick={onZoomOut}
    >
      −
    </button>
  </div>
);
