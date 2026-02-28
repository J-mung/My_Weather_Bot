import { useQuery } from "@tanstack/react-query";
import type { CurrentWeatherParams } from "../../../features/get-current-weather/model/currentWeatherParams";
import { weatherApiMap, type WeatherApiType, type WeatherResponseMap } from "../api/weatherApiMap";

export const useWeatherQuery = <T extends WeatherApiType>(
  type: T,
  params: CurrentWeatherParams,
  options?: { enabled?: boolean },
) => {
  const api = weatherApiMap[type];

  if (!api) {
    throw new Error("지원하지 않는 기능입니다.");
  }

  return useQuery<WeatherResponseMap[T]>({
    queryKey: ["weather", type, ...(params ? Object.values(params) : [])],
    queryFn: () => api(params),
    staleTime: 1000 * 60 * 5,
    enabled: options?.enabled ?? true,
  });
};
