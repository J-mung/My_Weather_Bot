import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { HourlyInfoCard } from "./HourlyInfoCard";

const refresh = vi.fn(async () => {});

describe("HourlyInfoCard", () => {
  it("renders common no-data state separately from request errors", () => {
    const markup = renderToStaticMarkup(
      <HourlyInfoCard
        data={null}
        isLoading={false}
        isFetching={false}
        error={null}
        isNoData
        refresh={refresh}
      />,
    );

    expect(markup).toContain("시간대별 예보가 아직 없어요");
    expect(markup).toContain("시간대별 예보 데이터가 아직 준비되지 않았어요.");
    expect(markup).not.toContain("기상청");
    expect(markup).toContain("src=\"/images/no_data_image.png\"");
    expect(markup).toContain("상태 코드:");
    expect(markup).toContain("MWB-NODATA-KMA-HOURLY");
    expect(markup).not.toContain("MWB-WEATHER-");
  });
});
