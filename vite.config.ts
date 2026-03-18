import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";

const KAKAO_COORD2REGION_PATH = "/v2/local/geo/coord2regioncode.json";
const KAKAO_ADDRESS_SEARCH_PATH = "/v2/local/search/address.json";

// 환경변수 우선순위에 따라 날씨 API base URL 결정
const resolveWeatherApiBaseUrl = (env: Record<string, string>) =>
  env.API_BASE_URL || env.VITE_API_BASE_URL;

// 환경변수 우선순위에 따라 날씨 API key 결정
const resolveWeatherApiKey = (env: Record<string, string>) => env.API_KEY || env.VITE_API_KEY;

// 환경변수 우선순위에 따라 Kakao API base URL 결정
const resolveKakaoApiBaseUrl = (env: Record<string, string>) =>
  env.KAKAO_REST_API_BASE_URL || env.VITE_KAKAO_REST_API_BASE_URL;

// 환경변수 우선순위에 따라 Kakao API key 결정
const resolveKakaoApiKey = (env: Record<string, string>) =>
  env.KAKAO_REST_API_KEY || env.VITE_KAKAO_REST_API_KEY;

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

    return path;
  },
  headers: apiKey
    ? {
        Authorization: `KakaoAK ${apiKey}`,
      }
    : undefined,
});

// 기상청 API 전용 dev 프록시 생성
const createWeatherProxy = (baseUrl: string, apiKey?: string) => ({
  target: baseUrl,
  changeOrigin: true,
  rewrite: (path: string) => buildWeatherRewritePath(path, apiKey),
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const weatherApiBaseUrl = resolveWeatherApiBaseUrl(env);
  const weatherApiKey = resolveWeatherApiKey(env);
  const kakaoApiBaseUrl = resolveKakaoApiBaseUrl(env);
  const kakaoApiKey = resolveKakaoApiKey(env);

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    server: {
      proxy: {
        "/api/kakao": createKakaoProxy(kakaoApiBaseUrl, kakaoApiKey),
        "^/api/(?!kakao)": createWeatherProxy(weatherApiBaseUrl, weatherApiKey),
      },
    },
  };
});
