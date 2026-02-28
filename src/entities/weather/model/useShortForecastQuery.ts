import { useQuery } from "@tanstack/react-query";
import type { CurrentWeatherParams } from "../../../features/get-current-weather/model/currentWeatherParams";
import { fetchShortForecast } from "../api/fetchShortForecast";

export const useShortForecastQuery = (params: CurrentWeatherParams) => {
  return useQuery({
    queryKey: ["weeather", "shortForecast", ...Object.values(params)],
    queryFn: () => fetchShortForecast(params),
    staleTime: 1000 * 60 * 5,
  });
};
