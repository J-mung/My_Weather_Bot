import type { KakaoRegionMapStatus } from "./kakao-region-map.types";

export const getKakaoRegionMapStatusTitle = (status: KakaoRegionMapStatus): string => {
  switch (status) {
    case "loading":
      return "지도를 불러오고 있어요";
    case "idle":
      return "지도 표시 지역을 선택해 주세요";
    case "success":
      return "지도 표시가 완료됐어요";
    case "error":
      return "지도를 표시하지 못했어요";
  }
};
