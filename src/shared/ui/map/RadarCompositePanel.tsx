import { formatRadarTmDisplay } from "@/entities/weather/model/radarTime";
import type { RadarCompositeImageData } from "@/entities/weather/api/fetchRadarCompositeImage";
import { cn } from "@/shared/lib/cn";

const formatObservedAt = (observedAtText: string): string => {
  if (/^\d{12}$/.test(observedAtText)) {
    return formatRadarTmDisplay(observedAtText);
  }

  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(observedAtText)) {
    return `${observedAtText.replaceAll("-", ".")} 기준`;
  }

  return observedAtText;
};

type RadarCompositeImagePanelProps = {
  data: RadarCompositeImageData | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refresh: () => void;
};

type RadarCompositeInfoPanelProps = {
  data: RadarCompositeImageData | null;
};

export const RadarCompositeImagePanel = ({
  data,
  isLoading,
  isError,
  error,
  refresh,
}: RadarCompositeImagePanelProps) => {
  return (
    <div className={cn("relative h-full bg-slate-950")}>
      {data && (
        <img
          src={data.imageUrl}
          alt={"기상청 최근 강수 레이더 영상"}
          className={cn("h-full w-full object-contain")}
          draggable={false}
        />
      )}

      {isLoading && (
        <div
          className={cn(
            "absolute inset-0 grid place-items-center bg-slate-950/90 px-5 text-center",
          )}
        >
          <div className={cn("max-w-sm text-white")}>
            <span className={cn("block font-extrabold")}>레이더 영상을 불러오고 있어요</span>
            <span className={cn("mt-2 block text-sm leading-6 text-white/70")}>
              최근 기상청 레이더 합성영상을 확인하고 있습니다.
            </span>
          </div>
        </div>
      )}

      {isError && !isLoading && (
        <div className={cn("absolute inset-0 grid place-items-center bg-slate-950 px-5 text-center")}>
          <div className={cn("max-w-sm text-white")}>
            <span className={cn("block font-extrabold")}>레이더 영상을 표시하지 못했어요</span>
            <span className={cn("mt-2 block text-sm leading-6 text-white/70")}>
              {error?.message ?? "잠시 후 다시 시도해 주세요."}
            </span>
            <button
              type={"button"}
              className={cn(
                "mt-4 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
              )}
              onClick={refresh}
            >
              다시 시도
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const RadarCompositeInfoPanel = ({ data }: RadarCompositeInfoPanelProps) => {
  return (
    <div className={cn("border-t border-[var(--line)] bg-white px-4 py-3 md:px-5")}>
      <div className={cn("flex flex-wrap items-center justify-between gap-2")}>
        <div className={cn("min-w-0")}>
          <p
            className={cn(
              "text-xs font-extrabold tracking-[0.18em] text-[var(--text-muted)] uppercase",
            )}
          >
            Recent Radar
          </p>
          <p className={cn("mt-1 break-words text-sm font-bold text-[var(--text-main)]")}>
            {data ? formatObservedAt(data.observedAtText) : "기준 시각 확인 중"}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-bold text-[var(--text-sub)]",
          )}
        >
          자료: 기상청
        </span>
      </div>
      <p className={cn("mt-2 text-xs leading-5 text-[var(--text-sub)]")}>
        색이 진할수록 강한 강수 영역입니다. 레이더 자료는 실제 현장보다 수분~수십 분 지연될 수 있어요.
      </p>
    </div>
  );
};
