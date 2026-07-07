import { NO_DATA_STATUS_CODE } from "@/shared/api/no-data-status-codes";
import { cn } from "@/shared/lib/cn";
import { Tooltip } from "@/shared/ui/tooltip";
import {
  AIR_QUALITY_GRADE_LABEL,
  formatAirQualityValue,
  getAirQualityDescription,
  getAirQualityGrade,
  getAirQualityNoDataDescription,
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
  isNoData = false,
  errorCode,
}: AirQualityMetricCardProps) => {
  const grade = getAirQualityGrade({ metric, isLoading, isError, isNoData });
  const noDataCode = label.includes("초")
    ? NO_DATA_STATUS_CODE.AIR_QUALITY_PM25
    : NO_DATA_STATUS_CODE.AIR_QUALITY_PM10;
  const description = isNoData
    ? getAirQualityNoDataDescription({ metric, label, displayDistrict })
    : getAirQualityDescription({
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
      ) : isNoData ? (
        <MetricStateCard
          title={`${label} 정보가 아직 없어요`}
          description={description}
          code={noDataCode}
          codeLabel={"상태 코드"}
          iconName={"cloudAlert"}
          tone={"info"}
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
