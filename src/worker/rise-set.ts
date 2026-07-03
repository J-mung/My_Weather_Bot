import { getDefaultWorkerCache } from "./cache";
import { RISE_SET_ALLOWED_ENDPOINTS, RISE_SET_API_PREFIX } from "./constants";
import { withCors } from "./cors";
import type { Env, WorkerExecutionContext } from "./types";

const RISE_SET_CACHE_TTL_SECONDS = 12 * 60 * 60;

const resolveRiseSetApiBaseUrl = (env: Env): string =>
  (env.RISE_SET_API_BASE_URL || "").replace(/\/+$/, "");

const resolveRiseSetApiKey = (env: Env): string => env.RISE_SET_API_KEY || env.API_KEY;

const buildUpstreamUrl = (request: Request, env: Env, endpoint: string): URL => {
  const incomingUrl = new URL(request.url);
  const upstreamUrl = new URL(`${resolveRiseSetApiBaseUrl(env)}/${endpoint}`);

  incomingUrl.searchParams.forEach((value, key) => {
    upstreamUrl.searchParams.set(key, value);
  });

  upstreamUrl.searchParams.set("serviceKey", resolveRiseSetApiKey(env));

  return upstreamUrl;
};

const buildRiseSetCacheKey = (request: Request, endpoint: string): Request => {
  const incomingUrl = new URL(request.url);
  const cacheUrl = new URL(`${incomingUrl.origin}${RISE_SET_API_PREFIX}${endpoint}`);
  const sortedParams = Array.from(incomingUrl.searchParams.entries())
    .filter(([key]) => key !== "serviceKey")
    .sort(([a], [b]) => a.localeCompare(b));

  sortedParams.forEach(([key, value]) => {
    cacheUrl.searchParams.append(key, value);
  });

  return new Request(cacheUrl.toString(), { method: "GET" });
};

const createRiseSetHeaders = (
  contentType: string | null,
  cacheStatus: "HIT" | "MISS" | "BYPASS",
  cacheControl: string,
): HeadersInit => ({
  "Content-Type": contentType ?? "application/xml; charset=utf-8",
  "Cache-Control": cacheControl,
  "X-Rise-Set-Cache": cacheStatus,
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
      headers: createRiseSetHeaders(response.headers.get("Content-Type"), cacheStatus, cacheControl),
    }),
  );
};

const isCacheableRiseSetResponse = (status: number, body: string): boolean => {
  return status === 200 && body.includes("<resultCode>00</resultCode>") && body.includes("<item>");
};

export const handleRiseSetApiRequest = async (
  request: Request,
  env: Env,
  context?: WorkerExecutionContext,
): Promise<Response> => {
  const origin = request.headers.get("Origin") ?? "";
  const url = new URL(request.url);
  const endpoint = url.pathname.slice(RISE_SET_API_PREFIX.length);

  if (request.method === "OPTIONS") {
    return new Response(null, withCors(origin, { status: 204 }));
  }

  if (request.method !== "GET") {
    return new Response("Method Not Allowed", withCors(origin, { status: 405 }));
  }

  if (!RISE_SET_ALLOWED_ENDPOINTS.has(endpoint)) {
    return new Response("Invalid endpoint", withCors(origin, { status: 400 }));
  }

  if (!resolveRiseSetApiBaseUrl(env) || !resolveRiseSetApiKey(env)) {
    return new Response("Rise set service configuration unavailable", withCors(origin, { status: 500 }));
  }

  const cache = getDefaultWorkerCache();
  const cacheKey = buildRiseSetCacheKey(request, endpoint);
  const cacheControl = `public, max-age=${RISE_SET_CACHE_TTL_SECONDS}`;

  if (cache) {
    const cachedResponse = await cache.match(cacheKey);
    if (cachedResponse) {
      return createClientResponse(cachedResponse, origin, "HIT", cacheControl);
    }
  }

  const upstreamUrl = buildUpstreamUrl(request, env, endpoint);
  const upstreamRes = await fetch(upstreamUrl.toString(), { method: "GET" });
  const body = await upstreamRes.text();
  const isCacheable = isCacheableRiseSetResponse(upstreamRes.status, body);
  const responseCacheControl = isCacheable ? cacheControl : "no-store";
  const cacheStatus = cache && isCacheable ? "MISS" : "BYPASS";
  const headers = createRiseSetHeaders(
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
