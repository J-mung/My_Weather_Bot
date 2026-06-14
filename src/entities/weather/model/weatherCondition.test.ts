import { describe, expect, it } from "vitest";
import { mapPtyToCondition, mapSkyToCondition } from "./weatherCondition";

describe("weather condition code mapping", () => {
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
});
