import type { RequestWeatherParams } from "@/entities/weather/model/weather-model.types";
import { APP_ERROR } from "@/shared/api/app-errors";
import { getApiClient } from "@/shared/api/axios";
import { API_ERROR, AppError, isApiError } from "@/shared/api/types";
import type { UltraNowResponseType } from "./weather-api.types";

const weatherApiClient = getApiClient("weather");

/**
 * 초단기실황 fetch 요청 API
 * @param gridCoord
 * @returns
 */
export const fetchUltraNow = async (
  params: RequestWeatherParams,
): Promise<UltraNowResponseType> => {
  try {
    const response = await weatherApiClient.get("/getUltraSrtNcst", {
      params: {
        ...params,
        numOfRows: 10,
        pageNo: 1,
        dataType: "JSON",
      },
    });

    return response.data;
  } catch (fetchError: unknown) {
    if (fetchError instanceof AppError) {
      throw fetchError;
    }

    if (isApiError(fetchError) && fetchError.type === API_ERROR.HTTP) {
      if (fetchError.status === 404) {
        throw new AppError(APP_ERROR.ULTRA_NOW_NOT_FOUND, fetchError);
      }

      if (fetchError.status === 429 || fetchError.status >= 500) {
        throw new AppError(APP_ERROR.ULTRA_NOW_RETRY_LATER, fetchError);
      }

      throw new AppError(APP_ERROR.ULTRA_NOW, fetchError);
    }

    throw new AppError(APP_ERROR.ULTRA_NOW_UNEXPECTED, fetchError);
  }
};
