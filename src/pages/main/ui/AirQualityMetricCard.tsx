import type {
  AirQualityGrade,
  AirQualityMetric,
} from "@/entities/air-quality/model/air-quality.types";
import { cn } from "@/shared/lib/cn";
import { ErrorCode } from "@/shared/ui/error-code";
import { Tooltip } from "@/shared/ui/tooltip";
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
  errorCode?: string | null;
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
  errorCode,
}: AirQualityMetricCardProps) => {
  const grade = getAirQualityGrade(metric, isLoading, isError);

  return (
    <div className={cn(mainPageStyles.metricCard)}>
      <div className={cn(mainPageStyles.metricHeader)}>
        <Tooltip
          content={title}
          className={"flex-1"}
          tooltipClassName={"normal-case tracking-normal"}
        >
          <span className={cn(mainPageStyles.metricHeaderLabel)} title={title}>
            {title}
          </span>
        </Tooltip>
        <span
          className={cn(mainPageStyles.metricGradeBadge, mainPageStyles.metricGradeTone[grade])}
        >
          {AIR_QUALITY_GRADE_LABEL[grade]}
        </span>
      </div>
      {isError ? (
        <div
          className={cn(
            "mt-6 flex flex-1 flex-col justify-center rounded-2xl bg-[var(--surface-soft)] px-4 py-5 text-center",
          )}
        >
          <p className={cn("break-words text-sm leading-6 text-[var(--text-sub)]")}>
            {getAirQualityDescription(metric, label, displayDistrict, isLoading, isError)}
            <ErrorCode code={errorCode} />
          </p>
        </div>
      ) : (
        <>
          <strong className={cn(mainPageStyles.metricValue)}>
            {formatAirQualityValue(metric)}
            <span className={cn(mainPageStyles.metricUnit)}>㎍/㎥</span>
          </strong>
          <p className={cn(mainPageStyles.metricDescription)}>
            {getAirQualityDescription(metric, label, displayDistrict, isLoading, isError)}
          </p>
        </>
      )}
    </div>
  );
};
