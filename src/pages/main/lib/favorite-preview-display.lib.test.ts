import { describe, expect, it } from "vitest";
import {
  formatFavoritePreviewTemperature,
  formatFavoritePreviewTemperatureRange,
} from "./favorite-preview-display.lib";

describe("favorite preview display helpers", () => {
  it("예보 기온을 반올림해 표시한다", () => {
    expect(formatFavoritePreviewTemperature(23.6)).toBe("24°");
  });

  it("예보 기온이 없으면 fallback을 표시한다", () => {
    expect(formatFavoritePreviewTemperature(null)).toBe("--°");
  });

  it("최고/최저 기온 범위를 표시한다", () => {
    expect(formatFavoritePreviewTemperatureRange(28.2, 19.7)).toBe("최고 28° · 최저 20°");
  });
});
