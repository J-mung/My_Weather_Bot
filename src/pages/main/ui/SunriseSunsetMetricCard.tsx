import type { RiseSetSummary } from "@/entities/sun/model/riseSetMappers";
import { NO_DATA_STATUS_CODE } from "@/shared/api/no-data-status-codes";
import { cn } from "@/shared/lib/cn";
import {
  createSunPathChartGeometry,
  getCurrentKoreaMinutes,
  getSunlightStatusText,
} from "../lib/sunrise-sunset-display.lib";
import { MetricStateCard } from "./MetricStateCard";
import { MetricSkeletonCard } from "./MetricSkeletonCard";
import { mainPageStyles } from "./styles";

const CHART_WIDTH = 320;
const CHART_HEIGHT = 112;

const SunPathChart = ({ data, currentMinutes }: { data: RiseSetSummary; currentMinutes: number }) => {
  const geometry = createSunPathChartGeometry({
    sunriseMinutes: data.sunriseMinutes,
    sunsetMinutes: data.sunsetMinutes,
    currentMinutes,
    width: CHART_WIDTH,
  });

  if (!geometry) {
    return null;
  }

  return (
    <svg
      viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      role="img"
      aria-label={`오늘 일출 ${data.sunriseText}, 일몰 ${data.sunsetText}, 낮 길이 ${data.dayLengthText}`}
      className="mt-4 h-32 w-full overflow-visible"
    >
      <line
        x1="0"
        y1={geometry.baselineY}
        x2={CHART_WIDTH}
        y2={geometry.baselineY}
        stroke="var(--line)"
        strokeWidth="2"
        strokeDasharray="4 6"
      />
      <path
        d={geometry.sunPath}
        fill="none"
        stroke="var(--color-amber-400)"
        strokeLinecap="round"
        strokeWidth="4"
      />
      <circle cx={geometry.sunriseX} cy={geometry.baselineY} r="4" fill="var(--color-amber-300)" />
      <circle cx={geometry.sunsetX} cy={geometry.baselineY} r="4" fill="var(--color-amber-300)" />
      {geometry.currentSun && (
        <g aria-hidden="true">
          <circle cx={geometry.currentSun.x} cy={geometry.currentSun.y} r="9" fill="var(--color-amber-200)" opacity="0.35" />
          <circle cx={geometry.currentSun.x} cy={geometry.currentSun.y} r="5" fill="var(--color-amber-400)" />
        </g>
      )}
      <text x={geometry.sunriseX} y="106" textAnchor="middle" className="fill-[var(--text-sub)] text-[0.68rem] font-bold">
        {data.sunriseText}
      </text>
      <text x={geometry.sunsetX} y="106" textAnchor="middle" className="fill-[var(--text-sub)] text-[0.68rem] font-bold">
        {data.sunsetText}
      </text>
    </svg>
  );
};

export const SunriseSunsetMetricCard = ({
  data,
  isLoading,
  isError,
  isNoData = false,
  errorCode,
}: {
  data: RiseSetSummary | null;
  isLoading: boolean;
  isError: boolean;
  isNoData?: boolean;
  errorCode?: string | null;
}) => {
  if (isLoading) {
    return <MetricSkeletonCard className="sm:col-span-2 xl:col-span-4" />;
  }

  const currentMinutes = getCurrentKoreaMinutes();
  const displayData = data && !isError && !isNoData ? data : null;
  const statusText =
    displayData
      ? getSunlightStatusText({
          currentMinutes,
          sunriseMinutes: displayData.sunriseMinutes,
          sunsetMinutes: displayData.sunsetMinutes,
        })
      : isNoData
        ? "오늘의 일출·일몰 데이터가 아직 없어요.\n잠시 후 다시 확인해 주세요."
        : "일출·일몰 정보를 요청하는 중 문제가 발생했어요.\n잠시 후 다시 확인해 주세요.";

  return (
    <div className={cn(mainPageStyles.metricCard, "sm:col-span-2", "xl:col-span-4")}>
      <div className={cn(mainPageStyles.metricHeader)}>
        <span className={cn(mainPageStyles.metricHeaderLabel)}>일출 · 일몰</span>
      </div>

      {displayData ? (
        <>
          <SunPathChart data={displayData} currentMinutes={currentMinutes} />
          <p className={cn(mainPageStyles.metricDescription)}>
            낮 {displayData.dayLengthText} · {statusText}
          </p>
        </>
      ) : (
        <MetricStateCard
          title={
            isNoData
              ? "이 지역의 일출·일몰 정보가 아직 없어요"
              : "일출·일몰 정보를 불러오지 못했어요"
          }
          description={statusText}
          code={isNoData ? NO_DATA_STATUS_CODE.SUNRISE_SUNSET : errorCode}
          codeLabel={isNoData ? "상태 코드" : "에러 코드"}
          iconName={"wbSunny"}
          tone={"info"}
        />
      )}
    </div>
  );
};
