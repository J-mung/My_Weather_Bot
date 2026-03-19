import districtsJson from "@/shared/lib/korea_districts.json";

export const typedDistricts = districtsJson as string[];
export const SPACE_REGEX = /\s+/g;
export const DASH_REGEX = /-/g;

/**
 * Fuse 결과 후처리를 더 엄격하게 적용할 최소 검색어 길이
 */
export const SEARCH_STRICT_MATCH_MIN_LENGTH = 5;

/**
 * Fuse 검색 시 후처리 후보군 확보를 위한 내부 검색 개수
 */
export const SEARCH_CANDIDATE_POOL_LIMIT = 50;
