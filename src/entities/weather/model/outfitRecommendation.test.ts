import { describe, expect, it } from "vitest";
import { getOutfitRecommendation } from "./outfitRecommendation";
import type {
  CurrentWeatherNow,
  OutfitComfortLevel,
  WeatherPrecipitation,
} from "./weather.types";

const baseNow: CurrentWeatherNow = {
  temperature: 20,
  humidity: 50,
  windSpeedMs: 2,
  feelsLike: 20,
  condition: "sunny",
};

const basePrecipitation: WeatherPrecipitation = {
  probability: null,
  rainAmountMm: null,
  rainAmountText: null,
  snowAmountCm: null,
  snowAmountText: null,
};

const createNow = (overrides: Partial<CurrentWeatherNow> = {}): CurrentWeatherNow => ({
  ...baseNow,
  ...overrides,
});

const createPrecipitation = (
  overrides: Partial<WeatherPrecipitation> = {},
): WeatherPrecipitation => ({
  ...basePrecipitation,
  ...overrides,
});

const expectCautionContaining = (cautions: string[], text: string) => {
  expect(cautions.some((caution) => caution.includes(text))).toBe(true);
};

describe("getOutfitRecommendation", () => {
  it("uses feelsLike before temperature when both are available", () => {
    const recommendation = getOutfitRecommendation(
      createNow({ feelsLike: 29, temperature: 10 }),
    );

    expect(recommendation.basisSource).toBe("feelsLike");
    expect(recommendation.basisTemperature).toBe(29);
    expect(recommendation.level).toBe("hot");
  });

  it("falls back to temperature when feelsLike is unavailable", () => {
    const recommendation = getOutfitRecommendation(
      createNow({ feelsLike: null, temperature: 24 }),
    );

    expect(recommendation.basisSource).toBe("temperature");
    expect(recommendation.basisTemperature).toBe(24);
    expect(recommendation.level).toBe("warm");
  });

  it("returns an unavailable recommendation when no basis temperature exists", () => {
    const recommendation = getOutfitRecommendation(
      createNow({ feelsLike: null, temperature: null }),
    );

    expect(recommendation.basisSource).toBe("unavailable");
    expect(recommendation.basisTemperature).toBeNull();
    expect(recommendation.level).toBe("unavailable");
    expect(recommendation.summary).toContain("온도 정보가 부족");
  });

  it.each<[number, OutfitComfortLevel]>([
    [28, "hot"],
    [27, "warm"],
    [23, "warm"],
    [22, "mild"],
    [20, "mild"],
    [19, "cool"],
    [17, "cool"],
    [16, "chilly"],
    [12, "chilly"],
    [11, "cold"],
    [5, "cold"],
    [4, "freezing"],
  ])("maps basis temperature %s°C to %s", (basisTemperature, expectedLevel) => {
    const recommendation = getOutfitRecommendation(
      createNow({ feelsLike: basisTemperature, temperature: 30 }),
    );

    expect(recommendation.level).toBe(expectedLevel);
  });

  it.each(["rain", "drizzle"] as const)(
    "adds rain-ready caution for %s",
    (condition) => {
      const recommendation = getOutfitRecommendation(createNow({ condition }));

      expectCautionContaining(recommendation.cautions, "우산");
      expectCautionContaining(recommendation.cautions, "방수");
    },
  );

  it.each(["snow", "snowFlurry"] as const)(
    "adds snow-ready caution for %s",
    (condition) => {
      const recommendation = getOutfitRecommendation(createNow({ condition }));

      expectCautionContaining(recommendation.cautions, "미끄럼 방지");
      expectCautionContaining(recommendation.cautions, "보온");
    },
  );

  it.each(["rainSnow", "drizzleSnow"] as const)(
    "adds combined rain and snow caution for %s",
    (condition) => {
      const recommendation = getOutfitRecommendation(createNow({ condition }));

      expectCautionContaining(recommendation.cautions, "우산");
      expectCautionContaining(recommendation.cautions, "미끄럼 방지");
      expectCautionContaining(recommendation.cautions, "방수");
    },
  );

  it("adds wind, humid heat, and freezing cautions at exact thresholds", () => {
    const recommendation = getOutfitRecommendation(
      createNow({ feelsLike: 0, temperature: 24, humidity: 75, windSpeedMs: 7 }),
    );

    expect(recommendation.level).toBe("freezing");
    expectCautionContaining(recommendation.cautions, "바람");
    expectCautionContaining(recommendation.cautions, "습하고 더워요");
    expectCautionContaining(recommendation.cautions, "영하권");
  });

  it("does not add threshold cautions below wind and humid-heat cutoffs", () => {
    const recommendation = getOutfitRecommendation(
      createNow({ feelsLike: 20, temperature: 23, humidity: 74, windSpeedMs: 6.9 }),
    );

    expect(recommendation.cautions.some((caution) => caution.includes("바람"))).toBe(false);
    expect(recommendation.cautions.some((caution) => caution.includes("습하고 더워요"))).toBe(
      false,
    );
  });

  it("adds precipitation forecast cautions without changing the temperature level", () => {
    const recommendation = getOutfitRecommendation(
      createNow({ feelsLike: 24, condition: "sunny" }),
      createPrecipitation({
        probability: 60,
        rainAmountText: "1mm 미만",
        snowAmountText: "1cm 미만",
      }),
    );

    expect(recommendation.level).toBe("warm");
    expectCautionContaining(recommendation.cautions, "비 가능성");
    expectCautionContaining(recommendation.cautions, "예상 강수량");
    expectCautionContaining(recommendation.cautions, "예상 적설");
  });

  it("deduplicates repeated caution messages", () => {
    const recommendation = getOutfitRecommendation(
      createNow({ feelsLike: -1, condition: "rainSnow", windSpeedMs: 8 }),
    );

    expect(new Set(recommendation.cautions).size).toBe(recommendation.cautions.length);
  });
});
