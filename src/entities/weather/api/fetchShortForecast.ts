import { axiosInstance } from "@/shared/api/axios";
import type { RequestWeatherParams } from "@/entities/weather/model/requestWeatherParams";
import type { WeatherFcstType } from "@/entities/weather/model/weatherTypes";

export const fetchShortForecast = async (
  params: RequestWeatherParams,
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
