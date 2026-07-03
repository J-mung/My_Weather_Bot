import { describe, expect, it } from "vitest";
import {
  formatDayLength,
  formatRiseSetMinutes,
  getKoreaTodayLocdate,
  mapRiseSetInfo,
  normalizeRiseSetLocation,
  parseRiseSetTimeToMinutes,
} from "./riseSetMappers";

describe("riseSetMappers", () => {
  it("formats KASI HHmm time into display text", () => {
    expect(parseRiseSetTimeToMinutes("0518")).toBe(318);
    expect(formatRiseSetMinutes(318)).toBe("05:18");
  });

  it("rejects invalid KASI time values", () => {
    expect(parseRiseSetTimeToMinutes("")).toBeNull();
    expect(parseRiseSetTimeToMinutes("2460")).toBeNull();
    expect(parseRiseSetTimeToMinutes("----")).toBeNull();
  });

  it("calculates daytime length from sunrise and sunset", () => {
    const summary = mapRiseSetInfo({
      locdate: "20260703",
      location: "서울",
      sunrise: "0518",
      sunset: "1957",
    });

    expect(summary).toMatchObject({
      sunriseText: "05:18",
      sunsetText: "19:57",
      dayLengthMinutes: 879,
      dayLengthText: "14시간 39분",
    });
  });

  it("normalizes long Korean district names into representative API locations", () => {
    expect(normalizeRiseSetLocation("서울특별시 강남구 역삼동")).toBe("서울");
    expect(normalizeRiseSetLocation("경기도 성남시 분당구")).toBe("수원");
    expect(normalizeRiseSetLocation("제주특별자치도 제주시")).toBe("제주");
  });

  it("creates Korea date text in YYYYMMDD", () => {
    expect(getKoreaTodayLocdate(new Date("2026-07-02T15:10:00.000Z"))).toBe("20260703");
  });

  it("formats short daytime length", () => {
    expect(formatDayLength(45)).toBe("45분");
    expect(formatDayLength(120)).toBe("2시간");
  });
});
