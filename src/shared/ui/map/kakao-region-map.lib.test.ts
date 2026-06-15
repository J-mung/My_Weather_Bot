import { describe, expect, it } from "vitest";
import { getKakaoRegionMapStatusTitle } from "./kakao-region-map.lib";

describe("kakao region map display helpers", () => {
  it.each([
    ["loading", "지도를 불러오고 있어요"],
    ["idle", "지도 표시 지역을 선택해 주세요"],
    ["success", "지도 표시가 완료됐어요"],
    ["error", "지도를 표시하지 못했어요"],
  ] as const)("%s 상태 제목을 반환한다", (status, expectedTitle) => {
    expect(getKakaoRegionMapStatusTitle(status)).toBe(expectedTitle);
  });
});
