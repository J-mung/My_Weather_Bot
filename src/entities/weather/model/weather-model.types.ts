import {
  type WeatherApiType as WeatherApiTypeValue,
  type WeatherResponseMap,
} from "@/entities/weather/api/weather-api.types";

export interface RequestWeatherParams {
  base_date: string;
  base_time: string;
  nx: number;
  ny: number;
}

export type WeatherStrategy<T extends WeatherApiTypeValue = WeatherApiTypeValue> = {
  buildParams: () => Pick<RequestWeatherParams, "base_date" | "base_time">;
  fetch: (params: RequestWeatherParams) => Promise<WeatherResponseMap[T]>;
};
