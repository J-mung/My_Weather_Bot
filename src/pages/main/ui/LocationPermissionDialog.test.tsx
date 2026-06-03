import { APP_ERROR, appErrorMetaMap } from "@/shared/api/app-errors";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { LocationPermissionDialog } from "./LocationPermissionDialog";

const renderDialog = (
  props: Partial<Parameters<typeof LocationPermissionDialog>[0]> = {},
) =>
  renderToStaticMarkup(
    <LocationPermissionDialog
      isOpen={true}
      status="prompt"
      error={null}
      isRequesting={false}
      onRequestLocation={vi.fn()}
      onSearchLocation={vi.fn()}
      {...props}
    />,
  );

describe("LocationPermissionDialog", () => {
  it("닫힌 상태에서는 렌더링하지 않는다", () => {
    expect(renderDialog({ isOpen: false })).toBe("");
  });

  it("권한 요청 전에는 현재 위치 권한 요청 안내를 표시한다", () => {
    const html = renderDialog();

    expect(html).toContain("현재 위치를 사용해도 될까요?");
    expect(html).toContain("현재 위치 권한 요청");
    expect(html).toContain("지역 검색으로 선택");
  });

  it("권한 거부 상태에서는 Chrome 권한 설정 안내를 표시한다", () => {
    const html = renderDialog({ status: "denied" });

    expect(html).toContain("Chrome 위치 권한이 꺼져 있어요");
    expect(html).toContain("주소창 왼쪽의 사이트 설정");
  });

  it("위치 기능 미지원 상태에서는 권한 요청 버튼을 비활성화한다", () => {
    const html = renderDialog({ status: "unsupported" });

    expect(html).toContain("현재 위치 기능을 사용할 수 없어요");
    expect(html).toContain("disabled");
  });

  it("위치 오류가 있으면 오류 설명과 에러 코드를 함께 표시한다", () => {
    const error = appErrorMetaMap[APP_ERROR.LOCATION_TIMEOUT];
    const html = renderDialog({ error });

    expect(html).toContain("현재 위치를 다시 확인해 주세요");
    expect(html).toContain(error.description);
    expect(html).toContain(error.code);
  });

  it("요청 중에는 진행 중 문구를 표시하고 두 버튼을 비활성화한다", () => {
    const html = renderDialog({ isRequesting: true });

    expect(html).toContain("확인 중...");
    expect(html.match(/<button[^>]*disabled/g)?.length).toBe(2);
  });
});
