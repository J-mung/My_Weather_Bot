import type { AirQualityMetric } from "@/entities/air-quality/model/air-quality.types";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AirQualityMetricCard } from "./AirQualityMetricCard";

const metric: AirQualityMetric = {
  value: 23,
  grade: "normal",
  flag: null,
};

describe("AirQualityMetricCard", () => {
  it("renders measured value for successful data", () => {
    const markup = renderToStaticMarkup(
      <AirQualityMetricCard
        title={"미세먼지"}
        metric={metric}
        label={"미세먼지"}
        displayDistrict={"복대동"}
        isLoading={false}
        isError={false}
      />,
    );

    expect(markup).toContain("23");
    expect(markup).toContain("복대동 기준 미세먼지 보통");
    expect(markup).not.toContain("src=\"/images/no_data_image.png\"");
  });

  it("renders common no-data state for successful empty metric", () => {
    const markup = renderToStaticMarkup(
      <AirQualityMetricCard
        title={"초미세먼지"}
        metric={{ value: null, grade: "unavailable", flag: null }}
        label={"초미세먼지"}
        displayDistrict={"복대동"}
        isLoading={false}
        isError={false}
        isNoData
      />,
    );

    expect(markup).toContain("초미세먼지 정보가 아직 없어요");
    expect(markup).toContain("복대동의 초미세먼지 관측값이 아직 제공되지 않았어요.");
    expect(markup).toContain("src=\"/images/no_data_image.png\"");
    expect(markup).toContain("상태 코드:");
    expect(markup).toContain("MWB-NODATA-AIRKOREA-PM25");
    expect(markup).not.toContain("MWB-AIRQUALITY-001");
  });

  it("renders request error state with error code", () => {
    const markup = renderToStaticMarkup(
      <AirQualityMetricCard
        title={"미세먼지"}
        metric={undefined}
        label={"미세먼지"}
        displayDistrict={"복대동"}
        isLoading={false}
        isError
        errorCode={"MWB-AIRQUALITY-001"}
      />,
    );

    expect(markup).toContain("대기질 정보를 불러오지 못했어요");
    expect(markup).toContain("에러 코드:");
    expect(markup).toContain("MWB-AIRQUALITY-001");
  });
});
