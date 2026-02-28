import type { CurrentWeatherParams } from "../../../features/get-current-weather/model/currentWeatherParams";
import { axiosInstance } from "../../../shared/api/axios";
import type { WeatherNowType } from "../model/weatherTypes";

/**
 * 초단기실황 fetch 요청 API
 * @param gridCoord
 * @returns
 */
export const fetchUltraNow = async (params: CurrentWeatherParams): Promise<WeatherNowType> => {
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
