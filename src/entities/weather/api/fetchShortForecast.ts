import type { RequestWeatherParams } from "@/entities/weather/model/requestWeatherParams";
import { axiosInstance } from "@/shared/api/axios";
import type { ShortFcstResponseType } from "./weatherApiTypes";

export const fetchShortForecast = async (
  params: RequestWeatherParams,
): Promise<ShortFcstResponseType> => {
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
