import type {
  AirQualityGrade,
  AirQualityMetric,
} from "@/entities/air-quality/model/air-quality.types";
import { cn } from "@/shared/lib/cn";
import { mainPageStyles } from "./styles";

const AIR_QUALITY_GRADE_LABEL: Record<AirQualityMetric["grade"], string> = {
  good: "좋음",
  normal: "보통",
  bad: "나쁨",
  veryBad: "매우 나쁨",
  unavailable: "확인 중",
};

type AirQualityMetricCardProps = {
  title: string;
  metric: AirQualityMetric | undefined;
  label: "미세먼지" | "초미세먼지";
  displayDistrict: string;
  isLoading: boolean;
  isError: boolean;
};

const getAirQualityGrade = (
  metric: AirQualityMetric | undefined,
  isLoading: boolean,
  isError: boolean,
): AirQualityGrade => {
  if (isError || isLoading || typeof metric?.value !== "number") {
    return "unavailable";
  }

  return metric.grade;
};

const formatAirQualityValue = (metric: AirQualityMetric | undefined): string => {
  if (typeof metric?.value !== "number") {
    return "--";
  }

  return String(metric.value);
};

const getAirQualityDescription = (
  metric: AirQualityMetric | undefined,
  label: "미세먼지" | "초미세먼지",
  displayDistrict: string,
  isLoading: boolean,
  isError: boolean,
): string => {
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

export const AirQualityMetricCard = ({
  title,
  metric,
  label,
  displayDistrict,
  isLoading,
  isError,
}: AirQualityMetricCardProps) => {
  const grade = getAirQualityGrade(metric, isLoading, isError);

  return (
    <div className={cn(mainPageStyles.metricCard)}>
      <div className={cn(mainPageStyles.metricHeader)}>
        <span className={cn(mainPageStyles.metricHeaderLabel)}>{title}</span>
        <span
          className={cn(mainPageStyles.metricGradeBadge, mainPageStyles.metricGradeTone[grade])}
        >
          {AIR_QUALITY_GRADE_LABEL[grade]}
        </span>
      </div>
      <strong className={cn(mainPageStyles.metricValue)}>
        {formatAirQualityValue(metric)}
        <span className={cn(mainPageStyles.metricUnit)}>㎍/㎥</span>
      </strong>
      <p className={cn(mainPageStyles.metricDescription)}>
        {getAirQualityDescription(metric, label, displayDistrict, isLoading, isError)}
      </p>
    </div>
  );
};
