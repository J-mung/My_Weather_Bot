import { cn } from "@/shared/lib/cn";
import { Tooltip } from "@/shared/ui/tooltip";
import {
  AIR_QUALITY_GRADE_LABEL,
  formatAirQualityValue,
  getAirQualityDescription,
  getAirQualityGrade,
} from "../lib/air-quality-metric-card.lib";
import type { AirQualityMetricCardProps } from "../lib/air-quality-metric-card.types";
import { MetricStateCard } from "./MetricStateCard";
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
        <MetricStateCard
          title={"대기질 정보를 불러오지 못했어요"}
          description={description}
          code={errorCode}
          iconName={"cloudAlert"}
        />
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
