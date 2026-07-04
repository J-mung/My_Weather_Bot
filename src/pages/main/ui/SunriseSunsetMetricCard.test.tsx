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

  it("renders no-data state for failed response handling", () => {
    const markup = renderToStaticMarkup(
      <SunriseSunsetMetricCard data={null} isLoading={false} isError />,
    );

    expect(markup).toContain("일출·일몰 정보를 불러오지 못했어요");
    expect(markup).toContain("현재 이 지역의 일출·일몰 정보를 확인할 수 없어요.");
    expect(markup).toContain("잠시 후 다시 확인해 주세요.");
    expect(markup).not.toContain("--:--");
    expect(markup).not.toContain("로컬 환경 변수");
    expect(markup).not.toContain("API 응답");
  });

  it("keeps failed query state in no-data even if stale data is present", () => {
    const markup = renderToStaticMarkup(
      <SunriseSunsetMetricCard data={summary} isLoading={false} isError />,
    );

    expect(markup).toContain("일출·일몰 정보를 불러오지 못했어요");
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
