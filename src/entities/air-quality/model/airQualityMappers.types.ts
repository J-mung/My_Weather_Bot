import type { AirQualityStationItemType } from "@/entities/air-quality/api/air-quality-api.types";
import type { AirQualityStationSelectionReason } from "./air-quality.types";

export type StationMatch = {
  item: AirQualityStationItemType;
  keyword: string | null;
  reason: AirQualityStationSelectionReason;
  score: number;
};

export type SelectedAirQualityStation = {
  item: AirQualityStationItemType | null;
  matchedKeyword: string | null;
  selectionReason: AirQualityStationSelectionReason;
};
