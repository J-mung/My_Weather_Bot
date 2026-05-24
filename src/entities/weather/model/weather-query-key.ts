import type { WeatherApiType } from "@/entities/weather/api/weather-api.types";
import type { RequestWeatherParams } from "@/entities/weather/model/weather-model.types";
import { WEATHER_QUERY_ROOT_KEY } from "./weather-cache-policy";

export type WeatherQueryKey = readonly [
  typeof WEATHER_QUERY_ROOT_KEY,
  WeatherApiType,
  string,
  string,
  number,
  number,
];

export const createWeatherQueryKey = (
  type: WeatherApiType,
  params: RequestWeatherParams,
): WeatherQueryKey =>
  [WEATHER_QUERY_ROOT_KEY, type, params.base_date, params.base_time, params.nx, params.ny] as const;

export const isWeatherQueryKey = (queryKey: readonly unknown[]): boolean =>
  queryKey[0] === WEATHER_QUERY_ROOT_KEY;
