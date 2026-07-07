import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BookmarkForecastPreviewNoData } from "./BookmarkForecastPreview";

describe("BookmarkForecastPreviewNoData", () => {
  it("renders compact no-data state with bookmark preview status code", () => {
    const markup = renderToStaticMarkup(<BookmarkForecastPreviewNoData />);

    expect(markup).toContain("예보 데이터가 아직 없어요");
    expect(markup).toContain("북마크 지역의 예보 데이터가 아직 준비되지 않았어요.");
    expect(markup).toContain("상태 코드:");
    expect(markup).toContain("MWB-NODATA-KMA-BOOKMARK-PREVIEW");
    expect(markup).not.toContain("src=\"/images/no_data_image.png\"");
    expect(markup).not.toContain("에러 코드:");
  });
});
