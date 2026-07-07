import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { KakaoMapStatusOverlay } from "./KakaoMapStatusOverlay";

describe("KakaoMapStatusOverlay", () => {
  it("renders an error code when map status is error", () => {
    const markup = renderToStaticMarkup(
      <KakaoMapStatusOverlay
        status={"error"}
        message={"지도를 요청하는 중 문제가 발생했습니다."}
        errorCode={"MWB-MAP-001"}
      />,
    );

    expect(markup).toContain("지도를 표시하지 못했어요");
    expect(markup).toContain("지도를 요청하는 중 문제가 발생했습니다.");
    expect(markup).toContain("에러 코드:");
    expect(markup).toContain("MWB-MAP-001");
  });
});
