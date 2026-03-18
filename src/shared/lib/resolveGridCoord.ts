import { fetchLatLonByRegion } from "@/entities/kakao/api/fetchLatLonByRegion";
import type { GridCoord, LatLon } from "@/entities/weather/model/weather.types";
import { convertToGridCoord } from "./convertToGridcoord";
import { GEO_CACHE_TTL, getGeoCacheKey, getGridCacheKey, GRID_CACHE_TTL } from "./locationCache";
import { getStorageCache, setStorageCache } from "./storageCache";

/**
 * 지역명으로 위/경도 반환
 *    - 캐싱 데이터 우선 반환
 * @param region
 * @returns
 */
const getLatLonByRegion = async (region: string): Promise<LatLon> => {
  const cacheKey = getGeoCacheKey(region);
  const cached = getStorageCache<LatLon>(cacheKey, GEO_CACHE_TTL);

  if (cached) {
    return cached;
  }

  const latLon = await fetchLatLonByRegion(region);
  setStorageCache(cacheKey, latLon);

  return latLon;
};

/**
 * 위경도로 기상청 좌표를 생성해 반환
 *    - 캐싱 데이터 우선 반환
 * @param lat
 * @param lon
 * @returns
 */
const getGridByLatLon = (lat: number, lon: number): GridCoord => {
  const cacheKey = getGridCacheKey(lat, lon);
  const cached = getStorageCache<GridCoord>(cacheKey, GRID_CACHE_TTL);

  if (cached) {
    return cached;
  }

  const grid = convertToGridCoord({ lat, lon });
  setStorageCache(cacheKey, grid);

  return grid;
};

/**
 * 지역명으로 기상청 좌표 생성해 반환
 * @param region
 * @returns
 */
export const resolveGridCoordByRegion = async (region: string): Promise<GridCoord> => {
  const { lat, lon } = await getLatLonByRegion(region);
  return getGridByLatLon(lat, lon);
};
