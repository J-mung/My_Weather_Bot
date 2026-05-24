export type AirQualityGrade = "good" | "normal" | "bad" | "veryBad" | "unavailable";

export type AirQualityStationSelectionReason =
  | "exact"
  | "includes"
  | "reverseIncludes"
  | "fallback"
  | "unavailable";

export interface AirQualityMetric {
  value: number | null;
  grade: AirQualityGrade;
  flag: string | null;
}

export interface AirQualitySummary {
  sidoName: string;
  stationName: string | null;
  dataTime: string | null;
  matchedKeyword: string | null;
  selectionReason: AirQualityStationSelectionReason;
  pm10: AirQualityMetric;
  pm25: AirQualityMetric;
}
