import { APP_ERROR, appErrorMetaMap } from "@/shared/api/app-errors";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CurrentLocationErrorCard } from "./CurrentLocationErrorCard";

describe("CurrentLocationErrorCard", () => {
  it("현재 위치 실패를 별도 에러 안내 레이아웃으로 표시한다", () => {
    const errorMeta = appErrorMetaMap[APP_ERROR.LOCATION_PERMISSION];
    const html = renderToStaticMarkup(<CurrentLocationErrorCard errorMeta={errorMeta} />);

    expect(html).toContain("현재 위치");
    expect(html).toContain("현재 위치를 불러오지 못했어요");
    expect(html).toContain("현재 위치 확인이 필요해요");
    expect(html).toContain(errorMeta.description);
    expect(html).toContain(errorMeta.code);
    expect(html).toContain("위치 권한을 허용하거나 검색에서 지역을 추가해 주세요.");
  });
});
