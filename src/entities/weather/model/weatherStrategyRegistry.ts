import { fetchShortForecast } from "@/entities/weather/api/fetchShortForecast";
import { fetchUltraNow } from "@/entities/weather/api/fetchUltraNow";
import { type WeatherApiType as WeatherApiTypeValue, type WeatherResponseMap } from "@/entities/weather/api/weatherApiTypes";
import type { RequestWeatherParams } from "@/entities/weather/model/requestWeatherParams";
import { buildWeatherApiParams } from "@/shared/lib/weatherApiParams";
import {
  getUltraSrtNcstBaseDateTime,
  getVilageFcstBaseDateTime,
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
  SHORT_FORECAST: {
    buildParams: () => buildWeatherApiParams(getVilageFcstBaseDateTime),
    fetch: fetchShortForecast,
  },
};
