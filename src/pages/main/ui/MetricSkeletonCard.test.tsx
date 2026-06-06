import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AirQualityMetricCard } from "./AirQualityMetricCard";
import { MetricSkeletonCard } from "./MetricSkeletonCard";

const countSkeletonBlocks = (markup: string): number =>
  (markup.match(/animate-\[skeleton-shimmer_1\.6s_infinite\]/g) ?? []).length;

describe("main metric skeletons", () => {
  it("renders metric cards as skeleton blocks while loading", () => {
    const markup = renderToStaticMarkup(<MetricSkeletonCard showBadge />);

    expect(countSkeletonBlocks(markup)).toBeGreaterThanOrEqual(5);
  });

  it("hides air quality values and badges behind skeletons while loading", () => {
    const markup = renderToStaticMarkup(
      <AirQualityMetricCard
        title="미세먼지"
        label="미세먼지"
        displayDistrict="서울특별시"
        isLoading
        isError={false}
        metric={{ value: 17, grade: "good", flag: null }}
      />,
    );

    expect(countSkeletonBlocks(markup)).toBeGreaterThanOrEqual(5);
    expect(markup).not.toContain("17");
    expect(markup).not.toContain("좋음");
    expect(markup).not.toContain("미세먼지");
  });
});
