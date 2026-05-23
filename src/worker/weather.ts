import { WEATHER_ALLOWED_ENDPOINTS, WEATHER_API_PREFIX } from "./constants";
import { withCors } from "./cors";
import type { Env, WorkerExecutionContext } from "./types";

type WeatherEndpoint = "getUltraSrtFcst" | "getUltraSrtNcst" | "getVilageFcst";

type CacheStorageWithDefault = CacheStorage & { default?: Cache };

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

const getWeatherCache = (): Cache | null => {
  const workerCaches = globalThis.caches as CacheStorageWithDefault | undefined;
  return workerCaches?.default ?? null;
};

/**
 * 클라이언트 요청 쿼리를 upstream으로 전달하고,
 * API_KEY/serviceKey를 서버에서만 주입한 기상청 호출 URL 생성
 */
const buildUpstreamUrl = (request: Request, env: Env, endpoint: string): URL => {
  const incomingUrl = new URL(request.url);
  const normalizedBase = env.API_BASE_URL.replace(/\/+$/, "");
  const upstreamUrl = new URL(`${normalizedBase}/${endpoint}`);

  incomingUrl.searchParams.forEach((value, key) => {
    upstreamUrl.searchParams.set(key, value);
  });

  upstreamUrl.searchParams.set("serviceKey", env.API_KEY);

  if (!upstreamUrl.searchParams.has("dataType")) {
    upstreamUrl.searchParams.set("dataType", "JSON");
  }

  return upstreamUrl;
};

const buildWeatherCacheKey = (request: Request, endpoint: string): Request => {
  const incomingUrl = new URL(request.url);
  const cacheUrl = new URL(`${incomingUrl.origin}${WEATHER_API_PREFIX}${endpoint}`);
  const sortedParams = Array.from(incomingUrl.searchParams.entries())
    .filter(([key]) => key !== "serviceKey")
    .sort(([a], [b]) => a.localeCompare(b));

  sortedParams.forEach(([key, value]) => {
    cacheUrl.searchParams.append(key, value);
  });

  return new Request(cacheUrl.toString(), { method: "GET" });
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

const getWeatherCacheTtl = (endpoint: string, request: Request): number => {
  if (endpoint === "getVilageFcst") {
    return getVilageForecastCacheTtl(request);
  }

  return (
    WEATHER_WORKER_CACHE_TTL_SECONDS[endpoint as Exclude<WeatherEndpoint, "getVilageFcst">] ?? 0
  );
};

const createWeatherResponseHeaders = (
  contentType: string | null,
  cacheControl: string,
  cacheStatus: "HIT" | "MISS" | "BYPASS",
): HeadersInit => ({
  "Content-Type": contentType ?? "application/json; charset=utf-8",
  "Cache-Control": cacheControl,
  "X-Weather-Cache": cacheStatus,
});

const createClientWeatherResponse = async (
  response: Response,
  origin: string,
  cacheStatus: "HIT" | "MISS" | "BYPASS",
  cacheControl: string,
): Promise<Response> => {
  const body = await response.text();

  return new Response(
    body,
    withCors(origin, {
      status: response.status,
      headers: createWeatherResponseHeaders(
        response.headers.get("Content-Type"),
        cacheControl,
        cacheStatus,
      ),
    }),
  );
};

/**
 * /api/* 요청 처리
 *    - OPTIONS: preflight 처리
 *    - GET: 허용 endpoint 검증 후 기상청 API 프록시 호출
 */
export const handleApiRequest = async (
  request: Request,
  env: Env,
  context?: WorkerExecutionContext,
): Promise<Response> => {
  const origin = request.headers.get("Origin") ?? "";
  const url = new URL(request.url);
  const endpoint = url.pathname.slice(WEATHER_API_PREFIX.length);

  if (request.method === "OPTIONS") {
    return new Response(null, withCors(origin, { status: 204 }));
  }

  if (request.method !== "GET") {
    return new Response("Method Not Allowed", withCors(origin, { status: 405 }));
  }

  if (!WEATHER_ALLOWED_ENDPOINTS.has(endpoint)) {
    return new Response("Invalid endpoint", withCors(origin, { status: 400 }));
  }

  if (!env.API_BASE_URL || !env.API_KEY) {
    const missing = [!env.API_BASE_URL ? "API_BASE_URL" : null, !env.API_KEY ? "API_KEY" : null]
      .filter(Boolean)
      .join(", ");
    return new Response(`Missing API env: ${missing}`, { status: 500 });
  }

  const cache = getWeatherCache();
  const cacheKey = buildWeatherCacheKey(request, endpoint);
  const cacheTtlSeconds = getWeatherCacheTtl(endpoint, request);
  const cacheControl = `public, max-age=${cacheTtlSeconds}`;

  if (cache && cacheTtlSeconds > 0) {
    const cachedResponse = await cache.match(cacheKey);
    if (cachedResponse) {
      return createClientWeatherResponse(cachedResponse, origin, "HIT", cacheControl);
    }
  }

  const upstreamUrl = buildUpstreamUrl(request, env, endpoint);
  const upstreamRes = await fetch(upstreamUrl.toString(), { method: "GET" });
  const body = await upstreamRes.text();
  const responseCacheControl = upstreamRes.ok && cacheTtlSeconds > 0 ? cacheControl : "no-store";
  const cacheStatus = cache && upstreamRes.ok && cacheTtlSeconds > 0 ? "MISS" : "BYPASS";
  const headers = createWeatherResponseHeaders(
    upstreamRes.headers.get("Content-Type"),
    responseCacheControl,
    cacheStatus,
  );

  if (cache && upstreamRes.ok && cacheTtlSeconds > 0) {
    const cacheResponse = new Response(body, {
      status: upstreamRes.status,
      headers,
    });
    const putPromise = cache.put(cacheKey, cacheResponse);

    if (context) {
      context.waitUntil(putPromise);
    } else {
      await putPromise;
    }
  }

  return new Response(
    body,
    withCors(origin, {
      status: upstreamRes.status,
      headers,
    }),
  );
};
