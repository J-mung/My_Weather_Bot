import type { RequestWeatherParams } from "@/entities/weather/model/requestWeatherParams";
import { axiosInstance } from "@/shared/api/axios";
import type { UltraNowResponseType } from "./weatherApiTypes";

/**
 * 초단기실황 fetch 요청 API
 * @param gridCoord
 * @returns
 */
export const fetchUltraNow = async (
  params: RequestWeatherParams,
): Promise<UltraNowResponseType> => {
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
