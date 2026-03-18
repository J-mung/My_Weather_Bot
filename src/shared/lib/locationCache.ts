// 지역명 정보 및 좌표 정보 변동을 대비한 캐시 버전
export const GEO_CACHE_VERSION = "v1";
export const GRID_CACHE_VERSION = "v1";

// 7 day
export const GEO_CACHE_TTL = 1000 * 60 * 60 * 24 * 7;
// 30 day
export const GRID_CACHE_TTL = 1000 * 60 * 60 * 24 * 30;

// key 일반화
export const normalizeRegionKey = (region: string): string =>
  region.trim().replace(/\s+/g, " ").toLowerCase();

// 안정성 강화를 위한 캐시 key 조회
export const getGeoCacheKey = (region: string): string =>
  `geo-cache:${GEO_CACHE_VERSION}:${normalizeRegionKey(region)}`;

// 안정성 강화를 위한 캐시 key 조회
export const getGridCacheKey = (lat: number, lon: number): string =>
  `grid-cache:${GRID_CACHE_VERSION}:${lat.toFixed(4)}_${lon.toFixed(4)}`;
