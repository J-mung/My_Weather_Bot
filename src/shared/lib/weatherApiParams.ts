import type { RequestWeatherParams } from "@/entities/weather/model/requestWeatherParams";
import type { BaseDateTime, GridCoord } from "@/entities/weather/model/weatherTypes";
import { convertToGridCoord } from "@/shared/lib/convertToGridcoord";
import { getUserLocation } from "@/shared/lib/userLocation";
import {
  getUltraSrtNcstBaseDateTime,
  getVilageFcstBaseDateTime,
} from "@/shared/lib/weatherDateTime";

/**
 * 공통 API 요청 파라미터 반환
 */
export const buildWeatherApiParams = async (
  getBaseDateTime: () => BaseDateTime,
): Promise<RequestWeatherParams> => {
  const userLocation = await getUserLocation();
  const { base_date, base_time }: BaseDateTime = getBaseDateTime();
  const { nx, ny }: GridCoord = convertToGridCoord(userLocation);

  return { base_date, base_time, nx, ny };
};

/**
 * ULTRA_NOW 기본 요청 파라미터 반환 (하위 호환)
 */
export const getWeatherApiParams = async (): Promise<RequestWeatherParams> =>
  buildWeatherApiParams(getUltraSrtNcstBaseDateTime);

/**
 * SHORT_FORECAST 기본 요청 파라미터 반환
 */
export const getShortFcstWeatherApiParams = async (): Promise<RequestWeatherParams> =>
  buildWeatherApiParams(getVilageFcstBaseDateTime);
