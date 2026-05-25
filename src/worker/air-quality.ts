import { AIR_QUALITY_ALLOWED_ENDPOINTS, AIR_QUALITY_API_PREFIX } from "./constants";
import { withCors } from "./cors";
import type { Env, WorkerExecutionContext } from "./types";

type CacheStorageWithDefault = CacheStorage & { default?: Cache };

const DEFAULT_AIRKOREA_API_BASE_URL = "https://apis.data.go.kr/B552584/ArpltnInforInqireSvc";
const AIR_QUALITY_CACHE_TTL_SECONDS = 20 * 60;

const getAirQualityCache = (): Cache | null => {
  const workerCaches = globalThis.caches as CacheStorageWithDefault | undefined;
  return workerCaches?.default ?? null;
};

const resolveAirKoreaApiBaseUrl = (env: Env): string =>
  (env.AIRKOREA_API_BASE_URL || env.AIRKOREA_BASE_URL || DEFAULT_AIRKOREA_API_BASE_URL).replace(
    /\/+$/,
    "",
  );

const resolveAirKoreaApiKey = (env: Env): string => env.AIRKOREA_API_KEY || env.API_KEY;

const buildUpstreamUrl = (request: Request, env: Env, endpoint: string): URL => {
  const incomingUrl = new URL(request.url);
  const upstreamUrl = new URL(`${resolveAirKoreaApiBaseUrl(env)}/${endpoint}`);

  incomingUrl.searchParams.forEach((value, key) => {
    upstreamUrl.searchParams.set(key, value);
  });

  upstreamUrl.searchParams.set("serviceKey", resolveAirKoreaApiKey(env));

  if (!upstreamUrl.searchParams.has("returnType")) {
    upstreamUrl.searchParams.set("returnType", "json");
  }

  return upstreamUrl;
};

const buildAirQualityCacheKey = (request: Request, endpoint: string): Request => {
  const incomingUrl = new URL(request.url);
  const cacheUrl = new URL(`${incomingUrl.origin}${AIR_QUALITY_API_PREFIX}${endpoint}`);
  const sortedParams = Array.from(incomingUrl.searchParams.entries())
    .filter(([key]) => key !== "serviceKey")
    .sort(([a], [b]) => a.localeCompare(b));

  sortedParams.forEach(([key, value]) => {
    cacheUrl.searchParams.append(key, value);
  });

  return new Request(cacheUrl.toString(), { method: "GET" });
};

const createAirQualityHeaders = (
  contentType: string | null,
  cacheStatus: "HIT" | "MISS" | "BYPASS",
  cacheControl: string,
): HeadersInit => ({
  "Content-Type": contentType ?? "application/json; charset=utf-8",
  "Cache-Control": cacheControl,
  "X-Air-Quality-Cache": cacheStatus,
});

const createClientResponse = async (
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
      headers: createAirQualityHeaders(
        response.headers.get("Content-Type"),
        cacheStatus,
        cacheControl,
      ),
    }),
  );
};

const isCacheableAirQualityResponse = (
  status: number,
  contentType: string | null,
  body: string,
): boolean => {
  if (status !== 200 || !contentType?.includes("application/json")) {
    return false;
  }

  try {
    const parsed = JSON.parse(body) as { response?: { header?: { resultCode?: string } } };
    return parsed.response?.header?.resultCode === "00";
  } catch {
    return false;
  }
};

export const handleAirQualityApiRequest = async (
  request: Request,
  env: Env,
  context?: WorkerExecutionContext,
): Promise<Response> => {
  const origin = request.headers.get("Origin") ?? "";
  const url = new URL(request.url);
  const endpoint = url.pathname.slice(AIR_QUALITY_API_PREFIX.length);

  if (request.method === "OPTIONS") {
    return new Response(null, withCors(origin, { status: 204 }));
  }

  if (request.method !== "GET") {
    return new Response("Method Not Allowed", withCors(origin, { status: 405 }));
  }

  if (!AIR_QUALITY_ALLOWED_ENDPOINTS.has(endpoint)) {
    return new Response("Invalid endpoint", withCors(origin, { status: 400 }));
  }

  if (!resolveAirKoreaApiKey(env)) {
    return new Response(
      "Air quality service configuration unavailable",
      withCors(origin, { status: 500 }),
    );
  }

  const cache = getAirQualityCache();
  const cacheKey = buildAirQualityCacheKey(request, endpoint);
  const cacheControl = `public, max-age=${AIR_QUALITY_CACHE_TTL_SECONDS}`;

  if (cache) {
    const cachedResponse = await cache.match(cacheKey);
    if (cachedResponse) {
      return createClientResponse(cachedResponse, origin, "HIT", cacheControl);
    }
  }

  const upstreamUrl = buildUpstreamUrl(request, env, endpoint);
  const upstreamRes = await fetch(upstreamUrl.toString(), { method: "GET" });
  const body = await upstreamRes.text();
  const isCacheable = isCacheableAirQualityResponse(
    upstreamRes.status,
    upstreamRes.headers.get("Content-Type"),
    body,
  );
  const responseCacheControl = isCacheable ? cacheControl : "no-store";
  const cacheStatus = cache && isCacheable ? "MISS" : "BYPASS";
  const headers = createAirQualityHeaders(
    upstreamRes.headers.get("Content-Type"),
    cacheStatus,
    responseCacheControl,
  );

  if (cache && isCacheable) {
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
