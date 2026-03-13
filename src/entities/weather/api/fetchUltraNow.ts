import type { RequestWeatherParams } from "@/entities/weather/model/requestWeatherParams";
import { getApiClient } from "@/shared/api/axios";
import type { UltraNowResponseType } from "./weatherApiTypes";

const weatherApiClient = getApiClient("weather");

/**
 * 초단기실황 fetch 요청 API
 * @param gridCoord
 * @returns
 */
export const fetchUltraNow = async (
  params: RequestWeatherParams,
): Promise<UltraNowResponseType> => {
  const response = await weatherApiClient.get("/getUltraSrtNcst", {
    params: {
      ...params,
      numOfRows: 10,
      pageNo: 1,
      dataType: "JSON",
    },
  });

  return response.data;
};
