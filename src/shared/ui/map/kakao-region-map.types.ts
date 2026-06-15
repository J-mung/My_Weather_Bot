import type { LatLon } from "@/entities/weather/model/weather.types";

export type KakaoRegionMapStatus = "idle" | "loading" | "success" | "error";
export type WeatherMapView = "location" | "radar";

export type KakaoRegionMapProps = {
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
