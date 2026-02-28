import type { CurrentWeatherParams } from "../../../features/get-current-weather/model/currentWeatherParams";
import { axiosInstance } from "../../../shared/api/axios";
import type { WeatherFcstType } from "../model/weatherTypes";

export const fetchShortForecast = async (
  params: CurrentWeatherParams,
): Promise<WeatherFcstType> => {
  const response = await axiosInstance.get("getVilageFcst", {
    params: {
      ...params,
      pageNo: 1,
      numOfRows: 100,
      dataType: "JSON",
    },
  });

  return response.data;
};
