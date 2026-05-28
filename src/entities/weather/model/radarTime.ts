const MINUTE_MS = 60 * 1000;
const KST_OFFSET_MS = 9 * 60 * MINUTE_MS;
const RADAR_SAFE_DELAY_MINUTES = 20;
const RADAR_INTERVAL_MINUTES = 10;

const pad2 = (value: number): string => String(value).padStart(2, "0");

export const formatRadarTmKst = (date: Date): string => {
  const kstDate = new Date(date.getTime() + KST_OFFSET_MS);

  return [
    kstDate.getUTCFullYear(),
    pad2(kstDate.getUTCMonth() + 1),
    pad2(kstDate.getUTCDate()),
    pad2(kstDate.getUTCHours()),
    pad2(kstDate.getUTCMinutes()),
  ].join("");
};

export const getLatestRadarTmKst = (now = new Date()): string => {
  const delayedTimestamp = now.getTime() - RADAR_SAFE_DELAY_MINUTES * MINUTE_MS;
  const roundedTimestamp =
    Math.floor(delayedTimestamp / (RADAR_INTERVAL_MINUTES * MINUTE_MS)) *
    RADAR_INTERVAL_MINUTES *
    MINUTE_MS;

  return formatRadarTmKst(new Date(roundedTimestamp));
};

export const formatRadarTmDisplay = (tm: string): string => {
  if (!/^\d{12}$/.test(tm)) {
    return "기준 시각 확인 중";
  }

  return `${tm.slice(0, 4)}.${tm.slice(4, 6)}.${tm.slice(6, 8)} ${tm.slice(8, 10)}:${tm.slice(10, 12)} 기준`;
};
