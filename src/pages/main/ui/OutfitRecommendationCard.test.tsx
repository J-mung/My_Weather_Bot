import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { OutfitRecommendationCard } from "./OutfitRecommendationCard";

describe("OutfitRecommendationCard", () => {
  it("renders common no-data state when weather data cannot support a recommendation", () => {
    const markup = renderToStaticMarkup(
      <OutfitRecommendationCard
        recommendation={null}
        isLoading={false}
        isFetching={false}
        isNoData
      />,
    );

    expect(markup).toContain("오늘의 옷차림 정보가 아직 없어요");
    expect(markup).toContain("날씨 데이터가 아직 없어 옷차림을 추천할 수 없어요.");
    expect(markup).toContain("src=\"/images/no_data_image.png\"");
    expect(markup).toContain("상태 코드:");
    expect(markup).toContain("MWB-NODATA-KMA-OUTFIT");
  });
});
