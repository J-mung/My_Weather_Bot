import type { KakaoEndpointKey } from "./types";

export const WEATHER_ALLOWED_ENDPOINTS = new Set([
  "getUltraSrtFcst",
  "getUltraSrtNcst",
  "getVilageFcst",
]);
export const WEATHER_API_PREFIX = "/api/";
export const KAKAO_API_PREFIX = "/api/kakao/";
export const AIR_QUALITY_API_PREFIX = "/api/air-quality/";
export const KAKAO_MAP_SDK_API_PATH = "/api/kakao-map-sdk.js";
export const AIR_QUALITY_ALLOWED_ENDPOINTS = new Set(["getCtprvnRltmMesureDnsty"]);
export const KAKAO_ENDPOINT_KEYS = [
  "coord2regioncode",
  "searchAddress",
  "searchKeyword",
] as const satisfies readonly KakaoEndpointKey[];

/**
 * 요청 api endpoint와 endpoint key type 매핑
 */
export const KAKAO_ENDPOINT_KEY_BY_PATH = {
  "/api/kakao/coord2regioncode": "coord2regioncode",
  "/api/kakao/search/address": "searchAddress",
  "/api/kakao/search/keyword": "searchKeyword",
} as const satisfies Record<string, KakaoEndpointKey>;
