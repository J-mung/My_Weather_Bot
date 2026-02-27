import { useQuery } from "@tanstack/react-query";
import type { CurrentWeatherParams } from "../../../features/get-current-weather/model/current-weather.params";
import { axiosInstance } from "../../../shared/api/axios";
import type { WeatherNowType } from "../model/weather.types";

/**
 * 초단기실황 fetch 요청 API
 * @param gridCoord
 * @returns
 */
const fetchWeatherNow = async (params: CurrentWeatherParams): Promise<WeatherNowType> => {
  const response = await axiosInstance.get("/getUltraSrtNcst", {
    params: {
      ...params,
      numOfRows: 10,
      pageNo: 1,
      dataType: "JSON",
    },
  });

  return response.data;
};

/**
 * 초단기실황 fetch 요청 API useQuery
 * @param gridCoord
 * @returns
 */
export const useWeatherNow = (params: CurrentWeatherParams | null, enabled = false) => {
  return useQuery({
    queryKey: ["weather-now", params],
    queryFn: () => {
      if (!params) throw new Error("Grid Coord is null");
      return fetchWeatherNow(params);
    },
    enabled: enabled && !!params,
    staleTime: 1000 * 60 * 5,
  });
};
