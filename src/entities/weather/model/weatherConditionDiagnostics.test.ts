import { afterEach, describe, expect, it, vi } from "vitest";
import { reportUnknownWeatherCondition } from "./weatherConditionDiagnostics";

describe("reportUnknownWeatherCondition", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("개발 모드에서만 미지원 날씨 코드 진단 로그를 남긴다", () => {
    vi.stubEnv("DEV", true);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    reportUnknownWeatherCondition({
      source: "shortForecast",
      category: "PTY",
      rawValue: "9",
      normalizedValue: 9,
      fcstDate: "20260614",
      fcstTime: "2300",
      fallbackCondition: "unavailable",
    });

    expect(warn).toHaveBeenCalledWith("[MyWeatherBot] Unknown weather condition code", {
      source: "shortForecast",
      category: "PTY",
      rawValue: "9",
      normalizedValue: 9,
      fcstDate: "20260614",
      fcstTime: "2300",
      fallbackCondition: "unavailable",
    });
  });

  it("운영 모드에서는 진단 정보를 콘솔에 남기지 않는다", () => {
    vi.stubEnv("DEV", false);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    reportUnknownWeatherCondition({
      source: "shortForecast",
      category: "SKY",
      rawValue: "8",
      normalizedValue: 8,
      fallbackCondition: "unavailable",
    });

    expect(warn).not.toHaveBeenCalled();
  });
});
