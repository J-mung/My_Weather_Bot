import { APP_ERROR, appErrorMetaMap } from "@/shared/api/app-errors";
import { renderToStaticMarkup } from "react-dom/server";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { describe, expect, it } from "vitest";
import ErrorPage from "./ErrorPage";

const renderErrorPage = (initialEntry: string, element = <ErrorPage />) => {
  const router = createMemoryRouter([{ path: "/error", element }], {
    initialEntries: [initialEntry],
  });

  return renderToStaticMarkup(<RouterProvider router={router} />);
};

describe("ErrorPage", () => {
  it("위치 요청 제한 reason이면 전용 오류 안내를 표시한다", () => {
    const meta = appErrorMetaMap[APP_ERROR.LOCATION_REQUEST_LIMIT];
    const html = renderErrorPage("/error?reason=location-request-limit");

    expect(html).toContain(meta.title);
    expect(html).toContain(meta.description);
    expect(html).toContain(meta.code);
    expect(html).toContain("지역 검색으로 선택");
    expect(html).toContain("홈으로 이동");
  });

  it("알 수 없는 reason이면 런타임 오류 안내로 fallback한다", () => {
    const meta = appErrorMetaMap[APP_ERROR.APP_RUNTIME];
    const html = renderErrorPage("/error?reason=unknown");

    expect(html).toContain(meta.title);
    expect(html).toContain(meta.description);
    expect(html).toContain(meta.code);
  });

  it("notFound prop이 있으면 404 안내를 우선 표시한다", () => {
    const meta = appErrorMetaMap[APP_ERROR.APP_ROUTE_NOT_FOUND];
    const html = renderErrorPage("/error?reason=location-request-limit", <ErrorPage notFound />);

    expect(html).toContain(meta.title);
    expect(html).toContain(meta.description);
    expect(html).toContain(meta.code);
  });
});
