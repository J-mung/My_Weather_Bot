import type {
  AirQualityGrade,
  AirQualityMetric,
} from "@/entities/air-quality/model/air-quality.types";
import type { AirQualityMetricLabel } from "./air-quality-metric-card.types";

export const AIR_QUALITY_GRADE_LABEL: Record<AirQualityMetric["grade"], string> = {
  good: "좋음",
  normal: "보통",
  bad: "나쁨",
  veryBad: "매우 나쁨",
  unavailable: "확인 중",
};

export const getAirQualityGrade = ({
  metric,
  isLoading,
  isError,
}: {
  metric: AirQualityMetric | undefined;
  isLoading: boolean;
  isError: boolean;
}): AirQualityGrade => {
  if (isError || isLoading || typeof metric?.value !== "number") {
    return "unavailable";
  }

  return metric.grade;
};

export const formatAirQualityValue = (metric: AirQualityMetric | undefined): string => {
  if (typeof metric?.value !== "number") {
    return "--";
  }

  return String(metric.value);
};

export const getAirQualityDescription = ({
  metric,
  label,
  displayDistrict,
  isLoading,
  isError,
}: {
  metric: AirQualityMetric | undefined;
  label: AirQualityMetricLabel;
  displayDistrict: string;
  isLoading: boolean;
  isError: boolean;
}): string => {
  if (isError) {
    return "대기질 정보를 불러오지 못했어요.";
  }

  if (isLoading) {
    return "대기질 정보를 확인하고 있어요.";
  }

  if (!metric || metric.value === null) {
    return metric?.flag || "대기질 정보가 아직 없어요.";
  }

  return `${displayDistrict || "선택 지역"} 기준 ${label} ${AIR_QUALITY_GRADE_LABEL[metric.grade]}`;
};
