export type WeatherEndpoint = "getUltraSrtFcst" | "getUltraSrtNcst" | "getVilageFcst";

const MINUTE_SECONDS = 60;
const HOUR_SECONDS = 60 * MINUTE_SECONDS;
const KOREA_TIME_OFFSET_MS = 9 * 60 * 60 * 1000;
const VILAGE_FCST_INTERVAL_MS = 3 * 60 * 60 * 1000;
const VILAGE_FCST_ACTIVE_MAX_TTL_SECONDS = 3 * HOUR_SECONDS;
const VILAGE_FCST_ARCHIVE_TTL_SECONDS = 4 * HOUR_SECONDS;
const VILAGE_FCST_FALLBACK_TTL_SECONDS = 2 * HOUR_SECONDS;

const WEATHER_WORKER_CACHE_TTL_SECONDS: Record<
  Exclude<WeatherEndpoint, "getVilageFcst">,
  number
> = {
  getUltraSrtNcst: 20 * MINUTE_SECONDS,
  getUltraSrtFcst: 30 * MINUTE_SECONDS,
};

const parseKoreaDateTime = (baseDate: string | null, baseTime: string | null): Date | null => {
  if (!baseDate || !baseTime || !/^\d{8}$/.test(baseDate) || !/^\d{4}$/.test(baseTime)) {
    return null;
  }

  const year = Number(baseDate.slice(0, 4));
  const month = Number(baseDate.slice(4, 6));
  const day = Number(baseDate.slice(6, 8));
  const hour = Number(baseTime.slice(0, 2));
  const minute = Number(baseTime.slice(2, 4));

  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59) {
    return null;
  }

  return new Date(Date.UTC(year, month - 1, day, hour, minute) - KOREA_TIME_OFFSET_MS);
};

const clampTtl = (ttlSeconds: number, maxSeconds: number): number =>
  Math.max(MINUTE_SECONDS, Math.min(Math.ceil(ttlSeconds), maxSeconds));

const getVilageForecastCacheTtl = (request: Request, now: Date = new Date()): number => {
  const url = new URL(request.url);
  const baseDateTime = parseKoreaDateTime(
    url.searchParams.get("base_date"),
    url.searchParams.get("base_time"),
  );

  if (!baseDateTime) {
    return VILAGE_FCST_FALLBACK_TTL_SECONDS;
  }

  const nextBaseDateTime = new Date(baseDateTime.getTime() + VILAGE_FCST_INTERVAL_MS);

  if (now < baseDateTime) {
    return VILAGE_FCST_FALLBACK_TTL_SECONDS;
  }

  if (now < nextBaseDateTime) {
    return clampTtl(
      (nextBaseDateTime.getTime() - now.getTime()) / 1000,
      VILAGE_FCST_ACTIVE_MAX_TTL_SECONDS,
    );
  }

  return VILAGE_FCST_ARCHIVE_TTL_SECONDS;
};

export const getWeatherCacheTtl = (endpoint: string, request: Request): number => {
  if (endpoint === "getVilageFcst") {
    return getVilageForecastCacheTtl(request);
  }

  return (
    WEATHER_WORKER_CACHE_TTL_SECONDS[endpoint as Exclude<WeatherEndpoint, "getVilageFcst">] ?? 0
  );
};
