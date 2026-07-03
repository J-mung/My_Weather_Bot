import type { RiseSetSummary } from "@/entities/sun/model/riseSetMappers";
import { cn } from "@/shared/lib/cn";
import {
  createSunPathChartGeometry,
  getCurrentKoreaMinutes,
  getSunlightStatusText,
} from "../lib/sunrise-sunset-display.lib";
import { MetricSkeletonCard } from "./MetricSkeletonCard";
import { mainPageStyles } from "./styles";

const CHART_WIDTH = 320;
const CHART_HEIGHT = 104;

const SunPathChart = ({ data }: { data: RiseSetSummary }) => {
  const geometry = createSunPathChartGeometry({
    sunriseMinutes: data.sunriseMinutes,
    sunsetMinutes: data.sunsetMinutes,
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
      className="mt-4 h-28 w-full overflow-visible"
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
        d={geometry.sunrisePath}
        fill="none"
        stroke="url(#sunrise-gradient)"
        strokeLinecap="round"
        strokeWidth="5"
      />
      <path
        d={geometry.sunsetPath}
        fill="none"
        stroke="url(#sunset-gradient)"
        strokeLinecap="round"
        strokeWidth="5"
      />
      <defs>
        <linearGradient id="sunrise-gradient" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="var(--color-amber-300)" />
          <stop offset="100%" stopColor="var(--color-orange-400)" />
        </linearGradient>
        <linearGradient id="sunset-gradient" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="var(--color-orange-400)" />
          <stop offset="100%" stopColor="var(--color-violet-400)" />
        </linearGradient>
      </defs>
      <circle cx={geometry.sunriseX} cy={geometry.baselineY} r="5" fill="var(--color-amber-400)" />
      <circle cx={geometry.sunsetX} cy={geometry.baselineY} r="5" fill="var(--color-violet-400)" />
      <text x={geometry.sunriseX} y="98" textAnchor="middle" className="fill-[var(--text-sub)] text-[0.65rem] font-bold">
        일출
      </text>
      <text x={geometry.sunsetX} y="98" textAnchor="middle" className="fill-[var(--text-sub)] text-[0.65rem] font-bold">
        일몰
      </text>
    </svg>
  );
};

export const SunriseSunsetMetricCard = ({
  data,
  isLoading,
  isError,
}: {
  data: RiseSetSummary | null;
  isLoading: boolean;
  isError: boolean;
}) => {
  if (isLoading) {
    return <MetricSkeletonCard className="sm:col-span-2 xl:col-span-4" />;
  }

  const statusText = data
    ? getSunlightStatusText({
        currentMinutes: getCurrentKoreaMinutes(),
        sunriseMinutes: data.sunriseMinutes,
        sunsetMinutes: data.sunsetMinutes,
      })
    : "일출·일몰 정보를 불러오지 못했어요.";

  return (
    <div className={cn(mainPageStyles.metricCard, "sm:col-span-2", "xl:col-span-4")}>
      <div className={cn(mainPageStyles.metricHeader)}>
        <span className={cn(mainPageStyles.metricHeaderLabel)}>일출 · 일몰</span>
      </div>

      {data && !isError ? (
        <>
          <SunPathChart data={data} />
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm font-bold text-[var(--text-main)]">
            <span>일출 {data.sunriseText}</span>
            <span className="text-right">일몰 {data.sunsetText}</span>
          </div>
          <p className={cn(mainPageStyles.metricDescription)}>
            낮 {data.dayLengthText} · {statusText}
          </p>
        </>
      ) : (
        <>
          <strong className={cn(mainPageStyles.metricValue)}>--:--</strong>
          <p className={cn(mainPageStyles.metricDescription)}>{statusText}</p>
        </>
      )}
    </div>
  );
};
