import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { NowInfoCard } from "./NowInfoCard";

const refresh = vi.fn(async () => {});

describe("NowInfoCard", () => {
  it("renders common no-data state separately from request errors", () => {
    const markup = renderToStaticMarkup(
      <NowInfoCard
        primaryDistrict={"서울"}
        secondaryDistrict={""}
        fullDistrict={"서울특별시"}
        isAlias={false}
        data={null}
        isLoading={false}
        isFetching={false}
        error={null}
        isNoData
        refresh={refresh}
      />,
    );

    expect(markup).toContain("현재 날씨 데이터가 아직 없어요");
    expect(markup).toContain("현재 위치의 날씨 데이터가 아직 준비되지 않았어요.");
    expect(markup).not.toContain("기상청");
    expect(markup).toContain("src=\"/images/no_data_image.png\"");
    expect(markup).toContain("상태 코드:");
    expect(markup).toContain("MWB-NODATA-KMA-NOW");
    expect(markup).not.toContain("MWB-WEATHER-");
  });
});
