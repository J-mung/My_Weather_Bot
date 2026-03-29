import type { RequestWeatherParams } from "@/entities/weather/model/request-weather-params.types";
import { APP_ERROR } from "@/shared/api/app-errors";
import { getApiClient } from "@/shared/api/axios";
import { API_ERROR, AppError, isApiError } from "@/shared/api/types";
import type { UltraFcstResponseType } from "./weather-api.types";

const weatherApiClient = getApiClient("weather");

/**
 * 초단기예보 fetch
 */
export const fetchUltraForecast = async (
  params: RequestWeatherParams,
): Promise<UltraFcstResponseType> => {
  try {
    const response = await weatherApiClient.get("/getUltraSrtFcst", {
      params: {
        ...params,
        pageNo: 1,
        numOfRows: 100,
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
        throw new AppError(APP_ERROR.ULTRA_FORECAST_NOT_FOUND, fetchError);
      }

      if (fetchError.status === 429 || fetchError.status >= 500) {
        throw new AppError(APP_ERROR.ULTRA_FORECAST_RETRY_LATER, fetchError);
      }
      throw new AppError(APP_ERROR.ULTRA_FORECAST, fetchError);
    }

    throw new AppError(APP_ERROR.ULTRA_FORECAST_UNEXPECTED, fetchError);
  }
};
