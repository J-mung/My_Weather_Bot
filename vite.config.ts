import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";

const KAKAO_COORD2REGION_PATH = "/v2/local/geo/coord2regioncode.json";
const KAKAO_ADDRESS_SEARCH_PATH = "/v2/local/search/address.json";
const KAKAO_KEYWORD_SEARCH_PATH = "/v2/local/search/keyword.json";
const KAKAO_MAP_SDK_PROXY_PATH = "/dapi.kakao.com/v2/maps/sdk.js";
const KAKAO_MAP_SDK_UPSTREAM_PATH = "/v2/maps/sdk.js";

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
const createKakaoMapSdkProxy = (apiKey?: string) => ({
  target: "https://dapi.kakao.com",
  changeOrigin: true,
  rewrite: (path: string) => buildKakaoMapSdkRewritePath(path, apiKey),
});

// AirKorea API 전용 dev 프록시 생성
const createAirQualityProxy = (baseUrl: string, apiKey?: string) => ({
  target: baseUrl,
  changeOrigin: true,
  rewrite: (path: string) => buildAirQualityRewritePath(path, apiKey),
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
  const excludedSegments = ["kakao", "air-quality", radarApiSegment]
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

  return {
    plugins: [react(), tailwindcss()],
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
        [buildWeatherProxyPattern(radarApiProxyPath)]: createWeatherProxy(
          weatherApiBaseUrl,
          weatherApiKey,
        ),
      },
    },
  };
});
