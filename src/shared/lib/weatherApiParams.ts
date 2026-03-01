import type { RequestWeatherParams } from "@/entities/weather/model/requestWeatherParams";
import type { BaseDateTime, GridCoord } from "@/entities/weather/model/weatherTypes";
import { convertToGridCoord } from "@/shared/lib/convertToGridcoord";
import { getUserLocation } from "@/shared/lib/userLocation";

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
