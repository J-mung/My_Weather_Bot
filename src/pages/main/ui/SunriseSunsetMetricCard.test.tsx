import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SunriseSunsetMetricCard } from "./SunriseSunsetMetricCard";

const summary = {
  location: "서울",
  locdate: "20260704",
  sunriseText: "05:16",
  sunsetText: "19:57",
  sunriseMinutes: 316,
  sunsetMinutes: 1197,
  dayLengthMinutes: 881,
  dayLengthText: "14시간 41분",
};

describe("SunriseSunsetMetricCard", () => {
  it("renders sun path and times for successful response data", () => {
    const markup = renderToStaticMarkup(
      <SunriseSunsetMetricCard data={summary} isLoading={false} isError={false} />,
    );

    expect(markup).toContain("일출 · 일몰");
    expect(markup).toContain("05:16");
    expect(markup).toContain("19:57");
    expect(markup).toContain("낮 14시간 41분");
    expect(markup).toContain("stroke-dasharray=\"4 6\"");
    expect(markup).not.toContain("일출·일몰 정보를 불러오지 못했어요");
  });

  it("renders no-data state for successful empty response handling", () => {
    const markup = renderToStaticMarkup(
      <SunriseSunsetMetricCard data={null} isLoading={false} isError={false} isNoData />,
    );

    expect(markup).toContain("이 지역의 일출·일몰 정보가 아직 없어요");
    expect(markup).toContain("오늘의 일출·일몰 데이터가 아직 없어요.");
    expect(markup).not.toContain("한국천문연구원");
    expect(markup).toContain("잠시 후 다시 확인해 주세요.");
    expect(markup).toContain("src=\"/images/no_data_image.png\"");
    expect(markup).toContain("상태 코드:");
    expect(markup).toContain("MWB-NODATA-KASI-SUN");
    expect(markup).not.toContain("에러 코드:");
    expect(markup).not.toContain("--:--");
    expect(markup).not.toContain("로컬 환경 변수");
    expect(markup).not.toContain("API 응답");
  });

  it("keeps failed query state in error even if stale data is present", () => {
    const markup = renderToStaticMarkup(
      <SunriseSunsetMetricCard
        data={summary}
        isLoading={false}
        isError
        errorCode={"MWB-SUN-001"}
      />,
    );

    expect(markup).toContain("일출·일몰 정보를 불러오지 못했어요");
    expect(markup).toContain("일출·일몰 정보를 요청하는 중 문제가 발생했어요.");
    expect(markup).toContain("에러 코드:");
    expect(markup).toContain("MWB-SUN-001");
    expect(markup).not.toContain("05:16");
    expect(markup).not.toContain("19:57");
  });

  it("renders skeleton while loading instead of no-data copy", () => {
    const markup = renderToStaticMarkup(
      <SunriseSunsetMetricCard data={null} isLoading isError={false} />,
    );

    expect(markup).toContain("animate-[skeleton-shimmer_1.6s_infinite]");
    expect(markup).not.toContain("일출·일몰 정보를 불러오지 못했어요");
  });
});
