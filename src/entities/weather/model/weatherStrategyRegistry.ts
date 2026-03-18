import { fetchShortForecast } from "@/entities/weather/api/fetchShortForecast";
import { fetchUltraForecast } from "@/entities/weather/api/fetchUltraForecast";
import { fetchUltraNow } from "@/entities/weather/api/fetchUltraNow";
import {
  type WeatherApiType as WeatherApiTypeValue,
  type WeatherResponseMap,
} from "@/entities/weather/api/weather-api.types";
import type { RequestWeatherParams } from "@/entities/weather/model/request-weather-params.types";
import { buildWeatherApiParams } from "@/shared/lib/weatherApiParams";
import {
  getUltraSrtFcstBaseDateTime,
  getUltraSrtNcstBaseDateTime,
  getVilageFcstBaseDateTime,
  getVilageFcstTodayTempRangeBaseDateTime,
} from "@/shared/lib/weatherDateTime";

/**
 * 전략 패턴 사용
 *    - buildParams(): API 별로 요구하는 값이 상이하여 paramater 반환 함수를 캡슐화
 *    - fetch API 함수 (axios)
 */
export type WeatherStrategy<T extends WeatherApiTypeValue = WeatherApiTypeValue> = {
  buildParams: () => Promise<RequestWeatherParams>;
  fetch: (params: RequestWeatherParams) => Promise<WeatherResponseMap[T]>;
};

export const weatherStrategyRegistry: { [K in keyof WeatherResponseMap]: WeatherStrategy<K> } = {
  ULTRA_NOW: {
    buildParams: () => buildWeatherApiParams(getUltraSrtNcstBaseDateTime),
    fetch: fetchUltraNow,
  },
  ULTRA_FORECAST: {
    buildParams: () => buildWeatherApiParams(getUltraSrtFcstBaseDateTime),
    fetch: fetchUltraForecast,
  },
  SHORT_FORECAST: {
    buildParams: () => buildWeatherApiParams(getVilageFcstBaseDateTime),
    fetch: fetchShortForecast,
  },
  TODAY_TEMP_RANGE: {
    buildParams: () => buildWeatherApiParams(getVilageFcstTodayTempRangeBaseDateTime),
    fetch: fetchShortForecast,
  },
};
