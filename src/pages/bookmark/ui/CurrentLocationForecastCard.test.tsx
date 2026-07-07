import type { BookmarkForecastPreview } from "@/features/bookmark/model/types";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const noDataForecast = vi.hoisted(
  (): BookmarkForecastPreview => ({
    data: null,
    isLoading: false,
    isFetching: false,
    isError: false,
    isNoData: true,
    error: null,
    refresh: async () => {},
  }),
);

vi.mock("@/features/bookmark/model/useBookmarkForecastPreview", () => ({
  useBookmarkForecastPreview: () => noDataForecast,
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

describe("CurrentLocationForecastCard", () => {
  it("renders no-data state with current location bookmark status code", async () => {
    const { CurrentLocationForecastCard } = await import("./CurrentLocationForecastCard");
    const markup = renderToStaticMarkup(
      <CurrentLocationForecastCard regionName={"서울특별시"} gridCoord={{ nx: 60, ny: 127 }} />,
    );

    expect(markup).toContain("현재 위치 예보가 아직 없어요");
    expect(markup).toContain("현재 위치의 예보 데이터가 아직 준비되지 않았어요.");
    expect(markup).toContain("src=\"/images/no_data_image.png\"");
    expect(markup).toContain("상태 코드:");
    expect(markup).toContain("MWB-NODATA-KMA-BOOKMARK-CURRENT");
    expect(markup).not.toContain("에러 코드:");
  });
});
