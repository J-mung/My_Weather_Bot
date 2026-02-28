import { useQuery } from "@tanstack/react-query";
import type { CurrentWeatherParams } from "../../../features/get-current-weather/model/currentWeatherParams";
import { fetchUltraNow } from "../api/fetchUltraNow";

/**
 * 초단기실황 fetch 요청 API useQuery
 * @param gridCoord
 * @returns
 */
export const useUltraNowQuery = (params: CurrentWeatherParams) => {
  return useQuery({
    queryKey: ["weather-now", params],
    queryFn: () => fetchUltraNow(params),
    enabled: !!params,
    staleTime: 1000 * 60 * 5,
  });
};
