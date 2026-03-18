type KakaoRegionDocument = {
  region_type: "B" | "H";
  address_name: string;
  region_1depth_name: string;
  region_2depth_name: string;
  region_3depth_name: string;
};

export type KakaoCoord2RegionResponse = {
  documents: KakaoRegionDocument[];
};

// kakao geocode 타입
export interface KakaoAddressSearchResponse {
  documents: Array<{
    x: string;
    y: string;
    address_name: string;
  }>;
}
