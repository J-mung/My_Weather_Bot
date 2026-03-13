import type { LatLon } from "@/entities/weather/model/weatherTypes";
import { getApiClient } from "@/shared/api/axios";
import type { KakaoCoord2RegionResponse } from "./types";

const kakaoApiClient = getApiClient("kakao");

export const fetchRegionNameFromCoord = async ({ lat, lon }: LatLon): Promise<string> => {
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
    throw new Error("좌표에 해당하는 지역명을 찾을 수 없습니다.");
  }

  return [region.region_1depth_name, region.region_2depth_name, region.region_3depth_name]
    .filter(Boolean)
    .join(" ");
};
