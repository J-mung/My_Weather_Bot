const DAY_MINUTES = 24 * 60;

export interface SunPathChartGeometry {
  sunriseX: number;
  sunsetX: number;
  peakX: number;
  baselineY: number;
  peakY: number;
  sunPath: string;
  currentSun: {
    x: number;
    y: number;
  } | null;
}

export const getCurrentKoreaMinutes = (date: Date = new Date()): number => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);

  return (hour % 24) * 60 + minute;
};

export const isSunPathRenderable = (sunriseMinutes: number, sunsetMinutes: number): boolean => {
  return (
    Number.isFinite(sunriseMinutes) &&
    Number.isFinite(sunsetMinutes) &&
    sunriseMinutes >= 0 &&
    sunriseMinutes < DAY_MINUTES &&
    sunsetMinutes > 0 &&
    sunsetMinutes <= DAY_MINUTES &&
    sunriseMinutes < sunsetMinutes
  );
};

export const getSunlightStatusText = ({
  currentMinutes,
  sunriseMinutes,
  sunsetMinutes,
}: {
  currentMinutes: number;
  sunriseMinutes: number;
  sunsetMinutes: number;
}): string => {
  if (currentMinutes < sunriseMinutes) {
    return "아직 해가 뜨기 전이에요";
  }

  if (currentMinutes > sunsetMinutes) {
    return "해가 진 뒤예요";
  }

  return "현재는 해가 떠 있어요";
};

export const createSunPathChartGeometry = ({
  sunriseMinutes,
  sunsetMinutes,
  currentMinutes,
  width = 320,
  baselineY = 78,
  peakY = 18,
}: {
  sunriseMinutes: number;
  sunsetMinutes: number;
  currentMinutes?: number;
  width?: number;
  baselineY?: number;
  peakY?: number;
}): SunPathChartGeometry | null => {
  if (!isSunPathRenderable(sunriseMinutes, sunsetMinutes)) {
    return null;
  }

  const sunriseX = Math.round((sunriseMinutes / DAY_MINUTES) * width);
  const sunsetX = Math.round((sunsetMinutes / DAY_MINUTES) * width);
  const peakX = Math.round((sunriseX + sunsetX) / 2);
  const controlY = 2 * peakY - baselineY;
  const currentSun =
    currentMinutes !== undefined &&
    currentMinutes >= sunriseMinutes &&
    currentMinutes <= sunsetMinutes
      ? (() => {
          const progress = (currentMinutes - sunriseMinutes) / (sunsetMinutes - sunriseMinutes);
          const x = Math.round(sunriseX + (sunsetX - sunriseX) * progress);
          const y = Math.round(baselineY - (baselineY - peakY) * 4 * progress * (1 - progress));

          return { x, y };
        })()
      : null;

  return {
    sunriseX,
    sunsetX,
    peakX,
    baselineY,
    peakY,
    sunPath: `M ${sunriseX} ${baselineY} Q ${peakX} ${controlY} ${sunsetX} ${baselineY}`,
    currentSun,
  };
};
