import { describe, expect, it } from "vitest";
import { getBookmarkConditionDisplay } from "./bookmark-forecast-display.lib";

describe("getBookmarkConditionDisplay", () => {
  it("북마크 카드에서 사용할 condition 아이콘과 한국어 라벨을 반환한다", () => {
    expect(getBookmarkConditionDisplay("sunny")).toMatchObject({
      icon: "wbSunny",
      label: "맑음",
    });
    expect(getBookmarkConditionDisplay("rainSnow")).toMatchObject({
      icon: "weatherMix",
      label: "비/눈",
    });
    expect(getBookmarkConditionDisplay("unavailable")).toMatchObject({
      icon: "cloudAlert",
      label: "확인 중",
    });
  });
});
