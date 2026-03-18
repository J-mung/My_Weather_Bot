import type { LatLon } from "@/entities/weather/model/weather.types";
import { getApiClient } from "@/shared/api/axios";
import type { KakaoAddressSearchResponse } from "./types";

const kakaoApiClient = getApiClient("kakao");

/**
 * 지역명으로 위/경도 조회 api
 * @param region
 * @returns
 */
export const fetchLatLonByRegion = async (region: string): Promise<LatLon> => {
  const response = await kakaoApiClient.get<KakaoAddressSearchResponse>("search/address", {
    params: {
      query: region,
    },
  });

  // 검색 결과 중 일치률이 가장 높은 1번째
  const target = response.data.documents[0];

  if (!target) {
    throw new Error("지역 좌표를 찾지 못했습니다.");
  }

  const lon = Number(target.x);
  const lat = Number(target.y);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new Error("유효하지 않은 좌표 응답입니다.");
  }

  return { lat, lon };
};
