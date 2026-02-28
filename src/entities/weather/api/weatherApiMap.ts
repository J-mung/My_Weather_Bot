import type { CurrentWeatherParams } from "../../../features/get-current-weather/model/currentWeatherParams";
import type { WeatherFcstType, WeatherNowType } from "../model/weatherTypes";
import { fetchShortForecast } from "./fetchShortForecast";
import { fetchUltraNow } from "./fetchUltraNow";

export type WeatherResponseMap = {
  ULTRA_NOW: WeatherNowType;
  SHORT_FORECAST: WeatherFcstType;
};

export const WeatherApiType = {
  ULTRA_NOW: "ULTRA_NOW",
  SHORT_FORECAST: "SHORT_FORECAST",
} as const;

export type WeatherApiType = (typeof WeatherApiType)[keyof typeof WeatherApiType];

/**
 * Api Map
 *    - 프레젠테이션 레이어에서는 api를 감추기
 */
export const weatherApiMap: {
  [K in keyof WeatherResponseMap]: (params: CurrentWeatherParams) => Promise<WeatherResponseMap[K]>;
} = {
  ULTRA_NOW: fetchUltraNow,
  SHORT_FORECAST: fetchShortForecast,
};
