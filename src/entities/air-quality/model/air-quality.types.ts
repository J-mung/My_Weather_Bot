export type AirQualityGrade = "good" | "normal" | "bad" | "veryBad" | "unavailable";

export interface AirQualityMetric {
  value: number | null;
  grade: AirQualityGrade;
  flag: string | null;
}

export interface AirQualitySummary {
  sidoName: string;
  stationName: string | null;
  dataTime: string | null;
  pm10: AirQualityMetric;
  pm25: AirQualityMetric;
}
