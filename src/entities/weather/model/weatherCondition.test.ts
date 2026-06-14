import { afterEach, describe, expect, it, vi } from "vitest";
import { mapPtyToCondition, mapSkyToCondition } from "./weatherCondition";

describe("weather condition code mapping", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it.each([
    [1, "sunny"],
    [2, "partlyCloudy"],
    [3, "mostlyCloudy"],
    [4, "cloudy"],
  ] as const)("maps SKY code %s to %s", (code, expected) => {
    expect(mapSkyToCondition(code)).toBe(expected);
  });

  it.each([
    [1, "rain"],
    [2, "rainSnow"],
    [3, "snow"],
    [4, "shower"],
    [5, "drizzle"],
    [6, "drizzleSnow"],
    [7, "snowFlurry"],
  ] as const)("maps PTY code %s to %s", (code, expected) => {
    expect(mapPtyToCondition(code)).toBe(expected);
  });

  it("미지원 SKY 코드는 unavailable로 fallback하고 개발 모드에서 진단 정보를 남긴다", () => {
    vi.stubEnv("DEV", true);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    expect(
      mapSkyToCondition(8, {
        source: "shortForecast",
        rawValue: "8",
        fcstDate: "20260614",
        fcstTime: "2300",
      }),
    ).toBe("unavailable");

    expect(warn).toHaveBeenCalledWith("[MyWeatherBot] Unknown weather condition code", {
      source: "shortForecast",
      category: "SKY",
      rawValue: "8",
      normalizedValue: 8,
      fcstDate: "20260614",
      fcstTime: "2300",
      fallbackCondition: "unavailable",
    });
  });

  it("운영 모드에서는 미지원 PTY 코드 진단 정보를 콘솔에 남기지 않는다", () => {
    vi.stubEnv("DEV", false);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    expect(
      mapPtyToCondition(9, {
        source: "ultraForecast",
        rawValue: "9",
        fcstDate: "20260614",
        fcstTime: "2300",
      }),
    ).toBe("unavailable");

    expect(warn).not.toHaveBeenCalled();
  });
});
