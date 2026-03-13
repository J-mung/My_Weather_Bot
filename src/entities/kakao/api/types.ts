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
