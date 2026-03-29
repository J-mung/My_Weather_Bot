import type { LatLon } from "@/entities/weather/model/weather.types";
import { APP_ERROR } from "@/shared/api/app-errors";
import { getApiClient } from "@/shared/api/axios";
import { API_ERROR, AppError, isApiError } from "@/shared/api/types";
import type { KakaoCoord2RegionResponse } from "./types";

const kakaoApiClient = getApiClient("kakao");

export const fetchRegionNameFromCoord = async ({ lat, lon }: LatLon): Promise<string> => {
  try {
    const response = await kakaoApiClient.get<KakaoCoord2RegionResponse>("coord2regioncode", {
      params: {
        x: lon,
        y: lat,
        input_coord: "WGS84",
      },
    });

    const region =
      response.data.documents.find((document) => document.region_type === "B") ??
      response.data.documents[0];

    if (!region) {
      throw new AppError(APP_ERROR.LOCATION_LOOKUP_NOT_FOUND);
    }

    return [region.region_1depth_name, region.region_2depth_name, region.region_3depth_name]
      .filter(Boolean)
      .join(" ");
  } catch (error: unknown) {
    if (error instanceof AppError) {
      throw error;
    }

    if (isApiError(error) && error.type === API_ERROR.HTTP) {
      if (error.status === 404) {
        throw new AppError(APP_ERROR.LOCATION_LOOKUP_NOT_FOUND, error);
      }

      if (error.status === 429 || error.status >= 500) {
        throw new AppError(APP_ERROR.LOCATION_LOOKUP_RETRY_LATER, error);
      }

      throw new AppError(APP_ERROR.LOCATION_LOOKUP, error);
    }

    throw new AppError(APP_ERROR.LOCATION_LOOKUP_UNEXPECTED, error);
  }
};
