import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import type { Plugin, ProxyOptions } from "vite";

const KAKAO_COORD2REGION_PATH = "/v2/local/geo/coord2regioncode.json";
const KAKAO_ADDRESS_SEARCH_PATH = "/v2/local/search/address.json";
const KAKAO_KEYWORD_SEARCH_PATH = "/v2/local/search/keyword.json";
const KAKAO_MAP_SDK_PROXY_PATH = "/dapi.kakao.com/v2/maps/sdk.js";
const KAKAO_MAP_SDK_UPSTREAM_PATH = "/v2/maps/sdk.js";
const CLIENT_CONFIG_API_PATH = "/api/client-config";
const RADAR_COMPOSITE_IMAGE_ENDPOINT = "composite-image";
const RADAR_SAFE_DELAY_MINUTES = 20;
const RADAR_INTERVAL_MINUTES = 10;
const RADAR_FALLBACK_CANDIDATE_COUNT = 6;
const MINUTE_MS = 60 * 1000;
const KST_OFFSET_MS = 9 * 60 * MINUTE_MS;

const parseLocalEnvFile = (filePath: string): Record<string, string> => {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  return fs
    .readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .reduce<Record<string, string>>((acc, line) => {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
        return acc;
      }

      const [key, ...valueParts] = trimmed.split("=");
      const value = valueParts
        .join("=")
        .trim()
        .replace(/^['"]|['"]$/g, "");
      acc[key.trim()] = value;
      return acc;
    }, {});
};

const loadLocalProxyEnv = (mode: string): Record<string, string> => ({
  ...parseLocalEnvFile(path.resolve(process.cwd(), ".dev.vars")),
  ...loadEnv(mode, process.cwd(), ""),
});

const normalizeEnvValue = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim().replace(/;+$/g, "").trim();
  const unquoted = trimmed.replace(/^['"]|['"]$/g, "").trim();

  return unquoted || undefined;
};

// 환경변수 우선순위에 따라 날씨 API base URL 결정
const resolveWeatherApiBaseUrl = (env: Record<string, string>) =>
  env.API_BASE_URL || env.VITE_API_BASE_URL;

// 환경변수 우선순위에 따라 날씨 API key 결정
const resolveWeatherApiKey = (env: Record<string, string>) => env.API_KEY || env.VITE_API_KEY;

// 환경변수 우선순위에 따라 AirKorea API base URL 결정
const resolveAirKoreaApiBaseUrl = (env: Record<string, string>) =>
  env.AIRKOREA_API_BASE_URL ||
  env.AIRKOREA_BASE_URL ||
  env.VITE_AIRKOREA_API_BASE_URL ||
  env.VITE_AIRKOREA_BASE_URL;

// 환경변수 우선순위에 따라 AirKorea API key 결정
const resolveAirKoreaApiKey = (env: Record<string, string>) =>
  env.AIRKOREA_API_KEY || env.VITE_AIRKOREA_API_KEY || env.API_KEY || env.VITE_API_KEY;

// 환경변수 우선순위에 따라 Kakao API base URL 결정
const resolveKakaoApiBaseUrl = (env: Record<string, string>) =>
  env.KAKAO_REST_API_BASE_URL || env.VITE_KAKAO_REST_API_BASE_URL;

// 환경변수 우선순위에 따라 Kakao API key 결정
const resolveKakaoApiKey = (env: Record<string, string>) =>
  env.KAKAO_REST_API_KEY || env.VITE_KAKAO_REST_API_KEY;

// 환경변수 우선순위에 따라 Kakao 지도 SDK key 결정
const resolveKakaoMapKey = (env: Record<string, string>) =>
  env.KAKAO_MAP_KEY || env.VITE_KAKAO_MAP_KEY;

// 환경변수 우선순위에 따라 레이더 API local proxy path 결정
const resolveRadarApiProxyPath = (env: Record<string, string>) =>
  env.RADAR_API_PROXY_PATH || env.VITE_RADAR_API_PROXY_PATH;

// 환경변수 우선순위에 따라 기상청 APIHub 레이더 upstream base URL 결정
const resolveRadarApiBaseUrl = (env: Record<string, string>) =>
  env.RADAR_API_UPSTREAM_BASE_URL || env.VITE_RADAR_API_UPSTREAM_BASE_URL;

// 환경변수 우선순위에 따라 기상청 APIHub 레이더 API key 결정
const resolveRadarApiKey = (env: Record<string, string>) =>
  env.RADAR_API_KEY ||
  env.VITE_RADAR_API_KEY ||
  env.APIHUB_API_KEY ||
  env.API_KEY ||
  env.VITE_API_KEY;

// 환경변수 우선순위에 따라 한국천문연구원 출몰시각 API base URL 결정
const resolveRiseSetApiBaseUrl = (env: Record<string, string>) =>
  normalizeEnvValue(env.RISE_SET_API_BASE_URL || env.VITE_RISE_SET_API_BASE_URL);

// 환경변수 우선순위에 따라 한국천문연구원 출몰시각 API key 결정
const resolveRiseSetApiKey = (env: Record<string, string>) =>
  normalizeEnvValue(
    env.RISE_SET_API_KEY || env.VITE_RISE_SET_API_KEY || env.API_KEY || env.VITE_API_KEY,
  );

// /api/kakao/coord2regioncode 요청을 Kakao upstream 경로로 재작성
const buildKakaoCoord2RegionRewritePath = (path: string): string => {
  const url = new URL(path, "http://localhost");
  const upstreamUrl = new URL(KAKAO_COORD2REGION_PATH, "http://localhost");

  const x = url.searchParams.get("x");
  const y = url.searchParams.get("y");

  if (x) upstreamUrl.searchParams.set("x", x);
  if (y) upstreamUrl.searchParams.set("y", y);
  upstreamUrl.searchParams.set("input_coord", url.searchParams.get("input_coord") ?? "WGS84");

  const query = upstreamUrl.searchParams.toString();
  return query ? `${upstreamUrl.pathname}?${query}` : upstreamUrl.pathname;
};

// /api/kakao/search/address 요청을 Kakao 주소 검색 경로로 재작성
const buildKakaoAddressSearchRewritePath = (path: string): string => {
  const url = new URL(path, "http://localhost");
  const upstreamUrl = new URL(KAKAO_ADDRESS_SEARCH_PATH, "http://localhost");

  const query = url.searchParams.get("query");
  if (query) {
    upstreamUrl.searchParams.set("query", query);
  }

  const search = upstreamUrl.searchParams.toString();
  return search ? `${upstreamUrl.pathname}?${search}` : upstreamUrl.pathname;
};

// /api/kakao/search/keyword 요청을 Kakao 키워드 검색 경로로 재작성
const buildKakaoKeywordSearchRewritePath = (path: string): string => {
  const url = new URL(path, "http://localhost");
  const upstreamUrl = new URL(KAKAO_KEYWORD_SEARCH_PATH, "http://localhost");

  const query = url.searchParams.get("query");
  if (query) {
    upstreamUrl.searchParams.set("query", query);
  }

  const search = upstreamUrl.searchParams.toString();
  return search ? `${upstreamUrl.pathname}?${search}` : upstreamUrl.pathname;
};

// Kakao 지도 SDK dev 요청을 upstream SDK 경로로 재작성하며 SDK key/autoload 옵션 주입
const buildKakaoMapSdkRewritePath = (path: string, apiKey?: string): string => {
  const url = new URL(path, "http://localhost");
  const upstreamUrl = new URL(KAKAO_MAP_SDK_UPSTREAM_PATH, "http://localhost");

  if (apiKey) {
    upstreamUrl.searchParams.set("appkey", apiKey);
  }

  upstreamUrl.searchParams.set("autoload", url.searchParams.get("autoload") ?? "false");

  const search = upstreamUrl.searchParams.toString();
  return search ? `${upstreamUrl.pathname}?${search}` : upstreamUrl.pathname;
};

// /api/air-quality/* 요청을 AirKorea upstream 경로로 재작성하며 serviceKey/returnType 주입
const buildAirQualityRewritePath = (path: string, apiKey?: string): string => {
  const url = new URL(path, "http://localhost");
  const endpoint = url.pathname.replace(/^\/api\/air-quality\//, "/");

  if (apiKey) {
    url.searchParams.set("serviceKey", apiKey);
  }

  if (!url.searchParams.has("returnType")) {
    url.searchParams.set("returnType", "json");
  }

  const query = url.searchParams.toString();
  return query ? `${endpoint}?${query}` : endpoint;
};

// /api/rise-set/* 요청을 한국천문연구원 출몰시각 upstream 경로로 재작성하며 serviceKey 주입
const buildRiseSetRewritePath = (path: string, apiKey?: string): string => {
  const url = new URL(path, "http://localhost");
  const endpoint = url.pathname.replace(/^\/api\/rise-set\//, "/");

  if (apiKey) {
    url.searchParams.set("serviceKey", apiKey);
  }

  const query = url.searchParams.toString();
  return query ? `${endpoint}?${query}` : endpoint;
};

// /api/* 요청을 기상청 upstream 경로로 재작성하며 serviceKey/dataType 주입
const buildWeatherRewritePath = (path: string, apiKey?: string): string => {
  const url = new URL(path, "http://localhost");
  const endpoint = url.pathname.replace(/^\/api\//, "/");

  if (apiKey) {
    url.searchParams.set("serviceKey", apiKey);
  }

  if (!url.searchParams.has("dataType")) {
    url.searchParams.set("dataType", "JSON");
  }

  const query = url.searchParams.toString();
  return query ? `${endpoint}?${query}` : endpoint;
};

// /api/radar/composite-image 요청을 기상청 APIHub 레이더 이미지 경로로 재작성
const buildRadarRewritePath = (path: string, apiKey?: string): string => {
  const url = new URL(path, "http://localhost");
  const upstreamUrl = new URL("/nph-rdr_cmp1_img", "http://localhost");
  const tm = url.searchParams.get("tm");

  if (tm) {
    upstreamUrl.searchParams.set("tm", tm);
  }

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

  if (apiKey) {
    upstreamUrl.searchParams.set("authKey", apiKey);
  }

  const search = upstreamUrl.searchParams.toString();
  return search ? `${upstreamUrl.pathname}?${search}` : upstreamUrl.pathname;
};

const normalizeProxyPath = (value: string): string => {
  const trimmedPath = value.trim();
  const withLeadingSlash = trimmedPath.startsWith("/") ? trimmedPath : `/${trimmedPath}`;
  return withLeadingSlash.replace(/\/+$/, "");
};

const pad2 = (value: number): string => String(value).padStart(2, "0");

const formatRadarTmKst = (date: Date): string => {
  const kstDate = new Date(date.getTime() + KST_OFFSET_MS);

  return [
    kstDate.getUTCFullYear(),
    pad2(kstDate.getUTCMonth() + 1),
    pad2(kstDate.getUTCDate()),
    pad2(kstDate.getUTCHours()),
    pad2(kstDate.getUTCMinutes()),
  ].join("");
};

const formatRadarObservedAtKst = (tm: string): string =>
  `${tm.slice(0, 4)}-${tm.slice(4, 6)}-${tm.slice(6, 8)} ${tm.slice(8, 10)}:${tm.slice(10, 12)}`;

const isValidRadarTm = (tm: string | null): tm is string =>
  Boolean(tm && /^\d{12}$/.test(tm));

const getRadarCandidateTimes = (
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

const isRadarImageResponse = (response: Response): boolean => {
  const contentType = response.headers.get("Content-Type") ?? "";
  return response.ok && contentType.toLowerCase().startsWith("image/");
};

const createClientConfigDevPlugin = (radarApiProxyPath?: string): Plugin => ({
  name: "my-weather-bot-client-config-dev",
  configureServer(server) {
    server.middlewares.use(CLIENT_CONFIG_API_PATH, (req, res) => {
      if (req.method === "OPTIONS") {
        res.statusCode = 204;
        res.end();
        return;
      }

      if (req.method !== "GET") {
        res.statusCode = 405;
        res.end("Method Not Allowed");
        return;
      }

      if (!radarApiProxyPath) {
        res.statusCode = 503;
        res.end("Client configuration unavailable");
        return;
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      res.end(JSON.stringify({ radarApiProxyPath: normalizeProxyPath(radarApiProxyPath) }));
    });
  },
});

const createRadarDevPlugin = (
  radarApiProxyPath?: string,
  radarApiBaseUrl?: string,
  radarApiKey?: string,
): Plugin => ({
  name: "my-weather-bot-radar-dev",
  configureServer(server) {
    if (!radarApiProxyPath) {
      return;
    }

    const normalizedProxyPath = normalizeProxyPath(radarApiProxyPath);
    const radarCompositeImagePath = `${normalizedProxyPath}/${RADAR_COMPOSITE_IMAGE_ENDPOINT}`;

    server.middlewares.use(async (req, res, next) => {
      const requestUrl = req.url ?? "";
      const url = new URL(requestUrl, "http://localhost");

      if (url.pathname !== radarCompositeImagePath) {
        next();
        return;
      }

      if (req.method === "OPTIONS") {
        res.statusCode = 204;
        res.end();
        return;
      }

      if (req.method !== "GET") {
        res.statusCode = 405;
        res.end("Method Not Allowed");
        return;
      }

      if (!radarApiBaseUrl || !radarApiKey) {
        res.statusCode = 503;
        res.end("Radar service unavailable");
        return;
      }

      const requestedTm = url.searchParams.get("tm");
      const candidates = isValidRadarTm(requestedTm) ? [requestedTm] : getRadarCandidateTimes();

      for (const tm of candidates) {
        const upstreamPath = buildRadarRewritePath(`${radarCompositeImagePath}?tm=${tm}`, radarApiKey);
        const upstreamResponse = await fetch(`${radarApiBaseUrl.replace(/\/+$/, "")}${upstreamPath}`);

        if (!isRadarImageResponse(upstreamResponse)) {
          continue;
        }

        const body = Buffer.from(await upstreamResponse.arrayBuffer());
        res.statusCode = upstreamResponse.status;
        res.setHeader("Content-Type", upstreamResponse.headers.get("Content-Type") ?? "image/png");
        res.setHeader("Cache-Control", "no-store");
        res.setHeader("X-Radar-Cache", "BYPASS");
        res.setHeader("X-Radar-Tm", tm);
        res.setHeader("X-Radar-Observed-At-KST", formatRadarObservedAtKst(tm));
        res.setHeader("X-Radar-Candidate-Count", String(candidates.length));
        res.end(body);
        return;
      }

      res.statusCode = 502;
      res.setHeader("Cache-Control", "no-store");
      res.setHeader("X-Radar-Cache", "BYPASS");
      res.end("Radar image unavailable");
    });
  },
});

// Kakao API 전용 dev 프록시 생성
const createKakaoProxy = (baseUrl: string, apiKey?: string) => ({
  target: baseUrl,
  changeOrigin: true,
  rewrite: (path: string) => {
    const pathname = new URL(path, "http://localhost").pathname;

    if (pathname === "/api/kakao/coord2regioncode") {
      return buildKakaoCoord2RegionRewritePath(path);
    }

    if (pathname === "/api/kakao/search/address") {
      return buildKakaoAddressSearchRewritePath(path);
    }

    if (pathname === "/api/kakao/search/keyword") {
      return buildKakaoKeywordSearchRewritePath(path);
    }

    return path;
  },
  headers: apiKey
    ? {
        Authorization: `KakaoAK ${apiKey}`,
      }
    : undefined,
});

// Kakao 지도 SDK 전용 dev 프록시 생성
const createKakaoMapSdkProxy = (apiKey?: string): ProxyOptions => ({
  target: "https://dapi.kakao.com",
  changeOrigin: true,
  rewrite: (path: string) => buildKakaoMapSdkRewritePath(path, apiKey),
  configure: (proxy) => {
    proxy.on("proxyReq", (proxyReq) => {
      proxyReq.removeHeader("origin");
      proxyReq.removeHeader("referer");
    });
  },
});

// AirKorea API 전용 dev 프록시 생성
const createAirQualityProxy = (baseUrl: string, apiKey?: string) => ({
  target: baseUrl,
  changeOrigin: true,
  rewrite: (path: string) => buildAirQualityRewritePath(path, apiKey),
});

// 한국천문연구원 출몰시각 API 전용 dev 프록시 생성
const createRiseSetProxy = (baseUrl: string, apiKey?: string) => ({
  target: baseUrl,
  changeOrigin: true,
  rewrite: (path: string) => buildRiseSetRewritePath(path, apiKey),
});

// 기상청 API 전용 dev 프록시 생성
const createWeatherProxy = (baseUrl: string, apiKey?: string) => ({
  target: baseUrl,
  changeOrigin: true,
  rewrite: (path: string) => buildWeatherRewritePath(path, apiKey),
});

// 레이더 APIHub dev 프록시 생성
const createRadarProxy = (baseUrl: string, apiKey?: string) => ({
  target: baseUrl,
  changeOrigin: true,
  rewrite: (path: string) => buildRadarRewritePath(path, apiKey),
});

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildWeatherProxyPattern = (radarApiProxyPath?: string): string => {
  const radarApiSegment = radarApiProxyPath?.replace(/^\/api\/?/, "").split("/")[0];
  const excludedSegments = ["kakao", "air-quality", "rise-set", radarApiSegment]
    .filter((segment): segment is string => Boolean(segment))
    .map(escapeRegex)
    .join("|");

  return `^/api/(?!${excludedSegments})`;
};

export default defineConfig(({ mode }) => {
  const env = loadLocalProxyEnv(mode);

  const weatherApiBaseUrl = resolveWeatherApiBaseUrl(env);
  const weatherApiKey = resolveWeatherApiKey(env);
  const airKoreaApiBaseUrl = resolveAirKoreaApiBaseUrl(env);
  const airKoreaApiKey = resolveAirKoreaApiKey(env);
  const kakaoApiBaseUrl = resolveKakaoApiBaseUrl(env);
  const kakaoApiKey = resolveKakaoApiKey(env);
  const kakaoMapKey = resolveKakaoMapKey(env);
  const radarApiProxyPath = resolveRadarApiProxyPath(env);
  const radarApiBaseUrl = resolveRadarApiBaseUrl(env);
  const radarApiKey = resolveRadarApiKey(env);
  const riseSetApiBaseUrl = resolveRiseSetApiBaseUrl(env);
  const riseSetApiKey = resolveRiseSetApiKey(env);

  return {
    plugins: [
      react(),
      tailwindcss(),
      createClientConfigDevPlugin(radarApiProxyPath),
      createRadarDevPlugin(radarApiProxyPath, radarApiBaseUrl, radarApiKey),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    server: {
      proxy: {
        [KAKAO_MAP_SDK_PROXY_PATH]: createKakaoMapSdkProxy(kakaoMapKey),
        "/api/kakao": createKakaoProxy(kakaoApiBaseUrl, kakaoApiKey),
        ...(radarApiProxyPath && radarApiBaseUrl
          ? { [radarApiProxyPath]: createRadarProxy(radarApiBaseUrl, radarApiKey) }
          : {}),
        ...(airKoreaApiBaseUrl
          ? { "/api/air-quality": createAirQualityProxy(airKoreaApiBaseUrl, airKoreaApiKey) }
          : {}),
        ...(riseSetApiBaseUrl
          ? { "/api/rise-set": createRiseSetProxy(riseSetApiBaseUrl, riseSetApiKey) }
          : {}),
        [buildWeatherProxyPattern(radarApiProxyPath)]: createWeatherProxy(
          weatherApiBaseUrl,
          weatherApiKey,
        ),
      },
    },
  };
});
