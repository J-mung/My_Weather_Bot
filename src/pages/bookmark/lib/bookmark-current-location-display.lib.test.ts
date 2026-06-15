import { describe, expect, it } from "vitest";
import {
  formatBookmarkCurrentForecastTemperature,
  formatBookmarkCurrentTemperature,
  formatBookmarkCurrentTemperatureRange,
} from "./bookmark-current-location-display.lib";

describe("bookmark current location display", () => {
  it("현재 위치 대표 카드 온도를 정수 온도로 표시한다", () => {
    expect(formatBookmarkCurrentTemperature(21.4)).toBe("21°");
    expect(formatBookmarkCurrentTemperature(21.5)).toBe("22°");
  });

  it("예보 온도 null은 fallback으로 표시한다", () => {
    expect(formatBookmarkCurrentForecastTemperature(null)).toBe("--°");
    expect(formatBookmarkCurrentForecastTemperature(18.6)).toBe("19°");
  });

  it("최고/최저 온도 범위를 표시한다", () => {
    expect(formatBookmarkCurrentTemperatureRange(25.2, 12.7)).toBe("최고 25° · 최저 13°");
  });
});
