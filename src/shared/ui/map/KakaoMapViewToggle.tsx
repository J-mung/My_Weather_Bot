import { cn } from "@/shared/lib/cn";
import type { WeatherMapView } from "./kakao-region-map.types";

type KakaoMapViewToggleProps = {
  activeView: WeatherMapView;
  onChange: (view: WeatherMapView) => void;
};

export const KakaoMapViewToggle = ({ activeView, onChange }: KakaoMapViewToggleProps) => (
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
      onClick={() => onChange("location")}
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
      onClick={() => onChange("radar")}
    >
      강수 레이더
    </button>
  </div>
);
