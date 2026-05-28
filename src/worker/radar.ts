import { getDefaultWorkerCache } from "./cache";
import {
  RADAR_CACHE_TTL_SECONDS,
  RADAR_COMPOSITE_IMAGE_ENDPOINT,
  RADAR_FALLBACK_CANDIDATE_COUNT,
  RADAR_INTERVAL_MINUTES,
  RADAR_SAFE_DELAY_MINUTES,
} from "./radar.constants";
import { withCors } from "./cors";
import type { Env, WorkerExecutionContext } from "./types";

const RADAR_COMPOSITE_IMAGE_PATH = "nph-rdr_cmp1_img";
const MINUTE_MS = 60 * 1000;
const KST_OFFSET_MS = 9 * 60 * MINUTE_MS;

type RadarCacheStatus = "HIT" | "MISS" | "BYPASS";

const normalizeProxyPath = (path: string): string => {
  const trimmedPath = path.trim();
  const withLeadingSlash = trimmedPath.startsWith("/") ? trimmedPath : `/${trimmedPath}`;
  return withLeadingSlash.replace(/\/+$/, "");
};

const resolveRadarApiBaseUrl = (env: Env): string =>
  (env.RADAR_API_UPSTREAM_BASE_URL || "").trim().replace(/\/+$/, "");

const resolveRadarApiProxyPath = (env: Env): string | null => {
  const proxyPath = (env.RADAR_API_PROXY_PATH || "").trim();
  return proxyPath ? normalizeProxyPath(proxyPath) : null;
};

const resolveRadarApiKey = (env: Env): string =>
  (env.RADAR_API_KEY || env.APIHUB_API_KEY || env.API_KEY || "").trim();

export const isRadarApiRequest = (pathname: string, env: Env): boolean => {
  const proxyPath = resolveRadarApiProxyPath(env);
  return Boolean(proxyPath && (pathname === proxyPath || pathname.startsWith(`${proxyPath}/`)));
};

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

export const formatRadarObservedAtKst = (tm: string): string =>
  `${tm.slice(0, 4)}-${tm.slice(4, 6)}-${tm.slice(6, 8)} ${tm.slice(8, 10)}:${tm.slice(10, 12)}`;

const isValidRadarTm = (tm: string | null): tm is string =>
  Boolean(tm && /^\d{12}$/.test(tm));

export const getRadarCandidateTimes = (
  now = new Date(),
  candidateCount = RADAR_FALLBACK_CANDIDATE_COUNT,
): string[] => {
  const delayedTimestamp = now.getTime() - RADAR_SAFE_DELAY_MINUTES * MINUTE_MS;
  const roundedTimestamp =
    Math.floor(delayedTimestamp / (RADAR_INTERVAL_MINUTES * MINUTE_MS)) *
    RADAR_INTERVAL_MINUTES *
    MINUTE_MS;

  return Array.from({ length: candidateCount }, (_, index) =>
    formatRadarTmKst(new Date(roundedTimestamp - index * RADAR_INTERVAL_MINUTES * MINUTE_MS)),
  );
};

const buildRadarUpstreamUrl = (env: Env, tm: string): URL => {
  const upstreamUrl = new URL(`${resolveRadarApiBaseUrl(env)}/${RADAR_COMPOSITE_IMAGE_PATH}`);

  upstreamUrl.searchParams.set("tm", tm);
  upstreamUrl.searchParams.set("cmp", "HSR");
  upstreamUrl.searchParams.set("qcd", "HSLP");
  upstreamUrl.searchParams.set("obs", "ECHD");
  upstreamUrl.searchParams.set("color", "C4");
  upstreamUrl.searchParams.set("aws", "0");
  upstreamUrl.searchParams.set("acc", "");
  upstreamUrl.searchParams.set("map", "HR");
  upstreamUrl.searchParams.set("grid", "2");
  upstreamUrl.searchParams.set("legend", "1");
  upstreamUrl.searchParams.set("size", "600");
  upstreamUrl.searchParams.set("itv", "5");
  upstreamUrl.searchParams.set("zoom_level", "0");
  upstreamUrl.searchParams.set("zoom_x", "0000000");
  upstreamUrl.searchParams.set("zoom_y", "0000000");
  upstreamUrl.searchParams.set("gov", "");
  upstreamUrl.searchParams.set("authKey", resolveRadarApiKey(env));

  return upstreamUrl;
};

const buildRadarCacheKey = (
  request: Request,
  proxyPath: string,
  endpoint: string,
  tm: string,
): Request => {
  const incomingUrl = new URL(request.url);
  const cacheUrl = new URL(`${incomingUrl.origin}${proxyPath}/${endpoint}`);

  cacheUrl.searchParams.set("tm", tm);

  return new Request(cacheUrl.toString(), { method: "GET" });
};

const createRadarHeaders = ({
  contentType,
  cacheControl,
  cacheStatus,
  tm,
  candidateCount,
}: {
  contentType: string | null;
  cacheControl: string;
  cacheStatus: RadarCacheStatus;
  tm: string;
  candidateCount: number;
}): HeadersInit => ({
  "Content-Type": contentType ?? "image/png",
  "Cache-Control": cacheControl,
  "X-Radar-Cache": cacheStatus,
  "X-Radar-Tm": tm,
  "X-Radar-Observed-At-KST": formatRadarObservedAtKst(tm),
  "X-Radar-Candidate-Count": String(candidateCount),
});

const createClientRadarResponse = async ({
  response,
  origin,
  cacheStatus,
  cacheControl,
  tm,
  candidateCount,
}: {
  response: Response;
  origin: string;
  cacheStatus: RadarCacheStatus;
  cacheControl: string;
  tm: string;
  candidateCount: number;
}): Promise<Response> => {
  const body = await response.arrayBuffer();

  return new Response(
    body,
    withCors(origin, {
      status: response.status,
      headers: createRadarHeaders({
        contentType: response.headers.get("Content-Type"),
        cacheControl,
        cacheStatus,
        tm,
        candidateCount,
      }),
    }),
  );
};

const isRadarImageResponse = (response: Response): boolean => {
  const contentType = response.headers.get("Content-Type") ?? "";
  return response.ok && contentType.toLowerCase().startsWith("image/");
};

const fetchFirstAvailableRadarImage = async (
  env: Env,
  candidates: string[],
): Promise<{ response: Response; tm: string } | null> => {
  for (const tm of candidates) {
    const upstreamResponse = await fetch(buildRadarUpstreamUrl(env, tm).toString(), {
      method: "GET",
    });

    if (isRadarImageResponse(upstreamResponse)) {
      return { response: upstreamResponse, tm };
    }
  }

  return null;
};

export const handleRadarApiRequest = async (
  request: Request,
  env: Env,
  context?: WorkerExecutionContext,
): Promise<Response> => {
  const origin = request.headers.get("Origin") ?? "";
  const url = new URL(request.url);
  const proxyPath = resolveRadarApiProxyPath(env);

  if (!proxyPath) {
    return new Response("Radar service unavailable", withCors(origin, { status: 503 }));
  }

  const endpoint = url.pathname.slice(proxyPath.length).replace(/^\/+/, "");

  if (request.method === "OPTIONS") {
    return new Response(null, withCors(origin, { status: 204 }));
  }

  if (request.method !== "GET") {
    return new Response("Method Not Allowed", withCors(origin, { status: 405 }));
  }

  if (endpoint !== RADAR_COMPOSITE_IMAGE_ENDPOINT) {
    return new Response("Invalid endpoint", withCors(origin, { status: 400 }));
  }

  if (!resolveRadarApiBaseUrl(env) || !resolveRadarApiKey(env)) {
    return new Response("Radar service unavailable", withCors(origin, { status: 503 }));
  }

  const requestedTm = url.searchParams.get("tm");
  const candidates = isValidRadarTm(requestedTm) ? [requestedTm] : getRadarCandidateTimes();
  const cache = getDefaultWorkerCache();
  const cacheControl = `public, max-age=${RADAR_CACHE_TTL_SECONDS}`;

  for (const tm of candidates) {
    const cacheKey = buildRadarCacheKey(request, proxyPath, endpoint, tm);
    const cachedResponse = cache ? await cache.match(cacheKey) : null;

    if (cachedResponse) {
      return createClientRadarResponse({
        response: cachedResponse,
        origin,
        cacheStatus: "HIT",
        cacheControl,
        tm,
        candidateCount: candidates.length,
      });
    }
  }

  const radarImage = await fetchFirstAvailableRadarImage(env, candidates);

  if (!radarImage) {
    return new Response(
      "Radar image unavailable",
      withCors(origin, {
        status: 502,
        headers: {
          "Cache-Control": "no-store",
          "X-Radar-Cache": "BYPASS",
        },
      }),
    );
  }

  const body = await radarImage.response.arrayBuffer();
  const headers = createRadarHeaders({
    contentType: radarImage.response.headers.get("Content-Type"),
    cacheControl,
    cacheStatus: cache ? "MISS" : "BYPASS",
    tm: radarImage.tm,
    candidateCount: candidates.length,
  });

  if (cache) {
    const cacheKey = buildRadarCacheKey(request, proxyPath, endpoint, radarImage.tm);
    const cacheResponse = new Response(body.slice(0), {
      status: radarImage.response.status,
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
      status: radarImage.response.status,
      headers,
    }),
  );
};
