import type { LatLon } from "@/entities/weather/model/weather.types";
import { APP_ERROR } from "@/shared/api/app-errors";
import { getApiClient } from "@/shared/api/axios";
import { API_ERROR, AppError, isApiError } from "@/shared/api/types";
import type { KakaoAddressSearchResponse } from "./types";

const kakaoApiClient = getApiClient("kakao");

/**
 * 지역명으로 위/경도 조회 api
 * @param region
 * @returns
 */
export const fetchLatLonByRegion = async (region: string): Promise<LatLon> => {
  try {
    const response = await kakaoApiClient.get<KakaoAddressSearchResponse>("search/address", {
      params: {
        query: region,
      },
    });

    // 검색 결과 중 일치률이 가장 높은 1번째
    const target = response.data.documents[0];

    if (!target) {
      throw new AppError(APP_ERROR.LATLON_LOOKUP_NOT_FOUND);
    }

    const lon = Number(target.x);
    const lat = Number(target.y);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      throw new Error("유효하지 않은 좌표 응답입니다.");
    }

    return { lat, lon };
  } catch (error: unknown) {
    if (error instanceof AppError) {
      throw error;
    }

    if (isApiError(error) && error.type === API_ERROR.HTTP) {
      if (error.status === 404) {
        throw new AppError(APP_ERROR.LATLON_LOOKUP_NOT_FOUND, error);
      }

      if (error.status === 429 || error.status >= 500) {
        throw new AppError(APP_ERROR.LATLON_LOOKUP_RETRY_LATER, error);
      }

      throw new AppError(APP_ERROR.LATLON_LOOKUP, error);
    }

    throw new AppError(APP_ERROR.LATLON_LOOKUP_UNEXPECTED, error);
  }
};
