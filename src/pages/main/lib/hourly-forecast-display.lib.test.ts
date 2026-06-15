import { describe, expect, it } from "vitest";
import {
  formatHourlyPrecipitationProbability,
  getHourlyPrecipitationAmountShortText,
  getHourlyPrecipitationAmountText,
  getHourlyPrecipitationAriaLabel,
} from "./hourly-forecast-display.lib";

describe("hourly forecast display helpers", () => {
  it("강수확률이 없으면 fallback 표기를 반환한다", () => {
    expect(formatHourlyPrecipitationProbability(null)).toBe("--%");
  });

  it("강수량과 적설량 상세 문구를 함께 만든다", () => {
    const forecast = {
      rainAmountText: "16.0mm",
      snowAmountText: "1cm 미만",
    };

    expect(getHourlyPrecipitationAmountText(forecast)).toBe("강수량 16.0mm · 적설 1cm 미만");
    expect(getHourlyPrecipitationAmountShortText(forecast)).toBe("16.0mm · 눈 1cm 미만");
  });

  it("강수/적설이 없으면 상세 문구를 만들지 않는다", () => {
    expect(getHourlyPrecipitationAmountText({ rainAmountText: null, snowAmountText: null })).toBe(
      null,
    );
  });

  it("접근성 라벨에 강수확률과 상세 강수 정보를 함께 담는다", () => {
    expect(
      getHourlyPrecipitationAriaLabel({
        precipitationProbability: 60,
        rainAmountText: "16.0mm",
        snowAmountText: null,
      }),
    ).toBe("강수확률 60%, 강수량 16.0mm");
  });
});
