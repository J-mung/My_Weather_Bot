import { cn } from "@/shared/lib/cn";
import { ErrorCode } from "@/shared/ui/error-code";
import { Tooltip } from "@/shared/ui/tooltip";
import {
  AIR_QUALITY_GRADE_LABEL,
  formatAirQualityValue,
  getAirQualityDescription,
  getAirQualityGrade,
} from "../lib/air-quality-metric-card.lib";
import type { AirQualityMetricCardProps } from "../lib/air-quality-metric-card.types";
import { MetricSkeletonCard } from "./MetricSkeletonCard";
import { mainPageStyles } from "./styles";

export const AirQualityMetricCard = ({
  title,
  metric,
  label,
  displayDistrict,
  isLoading,
  isError,
  errorCode,
}: AirQualityMetricCardProps) => {
  const grade = getAirQualityGrade({ metric, isLoading, isError });
  const description = getAirQualityDescription({
    metric,
    label,
    displayDistrict,
    isLoading,
    isError,
  });

  if (isLoading) {
    return <MetricSkeletonCard showBadge />;
  }

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
            {description}
            <ErrorCode code={errorCode} />
          </p>
        </div>
      ) : (
        <>
          <strong className={cn(mainPageStyles.metricValue)}>
            {formatAirQualityValue(metric)}
            <span className={cn(mainPageStyles.metricUnit)}>㎍/㎥</span>
          </strong>
          <p className={cn(mainPageStyles.metricDescription)}>{description}</p>
        </>
      )}
    </div>
  );
};
