import type { AirQualityMetric } from "@/entities/air-quality/model/air-quality.types";

export type AirQualityMetricLabel = "미세먼지" | "초미세먼지";

export type AirQualityMetricCardProps = {
  title: string;
  metric: AirQualityMetric | undefined;
  label: AirQualityMetricLabel;
  displayDistrict: string;
  isLoading: boolean;
  isError: boolean;
  errorCode?: string | null;
};
