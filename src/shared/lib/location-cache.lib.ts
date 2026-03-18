import { GEO_CACHE_VERSION, GRID_CACHE_VERSION } from "./location-cache.constants";

// key 일반화
export const normalizeRegionKey = (region: string): string =>
  region.trim().replace(/\s+/g, " ").toLowerCase();

// 안정성 강화를 위한 캐시 key 조회
export const getGeoCacheKey = (region: string): string =>
  `geo-cache:${GEO_CACHE_VERSION}:${normalizeRegionKey(region)}`;

// 안정성 강화를 위한 캐시 key 조회
export const getGridCacheKey = (lat: number, lon: number): string =>
  `grid-cache:${GRID_CACHE_VERSION}:${lat.toFixed(4)}_${lon.toFixed(4)}`;
