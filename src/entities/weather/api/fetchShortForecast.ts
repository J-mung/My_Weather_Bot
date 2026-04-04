import type { RequestWeatherParams } from "@/entities/weather/model/weather-model.types";
import { APP_ERROR } from "@/shared/api/app-errors";
import { getApiClient } from "@/shared/api/axios";
import { API_ERROR, AppError, isApiError } from "@/shared/api/types";
import type { ShortFcstResponseType } from "./weather-api.types";

const weatherApiClient = getApiClient("weather");

/**
 * 단기예보 fetch
 *  !!주의: numOfRows가 500 이상이어야 최저기온(TMN) 최고기온(TMX) 받을 수 있음
 *  https://velog.io/@hotbreakb/%EA%B8%B0%EC%83%81%EC%B2%AD41-%EB%8B%A8%EA%B8%B0%EC%98%88%EB%B3%B4-%EC%A1%B0%ED%9A%8C%EC%84%9C%EB%B9%84%EC%8A%A4-%EC%B5%9C%EA%B3%A0-%EC%B5%9C%EC%A0%80-%EA%B8%B0%EC%98%A8-%EB%B0%9B%EA%B8%B0TMX-TMN
 * @param params
 * @returns
 */
export const fetchShortForecast = async (
  params: RequestWeatherParams,
): Promise<ShortFcstResponseType> => {
  try {
    const response = await weatherApiClient.get("getVilageFcst", {
      params: {
        ...params,
        pageNo: 1,
        numOfRows: 500, // !!주의: 500 이상 지정
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
        throw new AppError(APP_ERROR.SHORT_FORECAST_NOT_FOUND, fetchError);
      }

      if (fetchError.status === 429 || fetchError.status >= 500) {
        throw new AppError(APP_ERROR.SHORT_FORECAST_RETRY_LATER, fetchError);
      }

      throw new AppError(APP_ERROR.SHORT_FORECAST, fetchError);
    }

    throw new AppError(APP_ERROR.SHORT_FORECAST_UNEXPECTED, fetchError);
  }
};
