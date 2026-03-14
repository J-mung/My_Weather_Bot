import type { RequestWeatherParams } from "@/entities/weather/model/requestWeatherParams";
import { getApiClient } from "@/shared/api/axios";
import type { UltraFcstResponseType } from "./weather-api.types";

const weatherApiClient = getApiClient("weather");

/**
 * 초단기예보 fetch
 */
export const fetchUltraForecast = async (
  params: RequestWeatherParams,
): Promise<UltraFcstResponseType> => {
  const response = await weatherApiClient.get("/getUltraSrtFcst", {
    params: {
      ...params,
      pageNo: 1,
      numOfRows: 100,
      dataType: "JSON",
    },
  });

  return response.data;
};
