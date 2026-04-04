import type { RequestWeatherParams } from "@/entities/weather/model/weather-model.types";
import type { BaseDateTime } from "@/entities/weather/model/weather.types";

/**
 * 공통 API 요청 파라미터 반환
 */
export const buildWeatherApiParams = (
  getBaseDateTime: () => BaseDateTime,
): Pick<RequestWeatherParams, "base_date" | "base_time"> => {
  const { base_date, base_time }: BaseDateTime = getBaseDateTime();

  return { base_date, base_time };
};
