import { describe, expect, it } from "vitest";
import {
  formatRadarObservedAtKst,
  formatRadarTmKst,
  getRadarCandidateTimes,
  isRadarApiRequest,
} from "./radar";
import type { Env } from "./types";

const createEnv = (overrides: Partial<Env> = {}): Env =>
  ({
    API_BASE_URL: "https://weather.example.test",
    API_KEY: "weather-key",
    AIRKOREA_API_BASE_URL: "https://air.example.test",
    KAKAO_REST_API_KEY: "kakao-key",
    KAKAO_REST_API_BASE_URL: "https://kakao.example.test",
    ASSETS: {
      fetch: async () => new Response(null),
    },
    ...overrides,
  }) as Env;

describe("radar time helpers", () => {
  it("formats UTC Date as KST radar timestamp", () => {
    expect(formatRadarTmKst(new Date("2026-05-29T05:20:00.000Z"))).toBe("202605291420");
  });

  it("rounds candidate times down after the safe delay and walks back by 10 minutes", () => {
    expect(getRadarCandidateTimes(new Date("2026-05-29T05:47:30.000Z"), 4)).toEqual([
      "202605291420",
      "202605291410",
      "202605291400",
      "202605291350",
    ]);
  });

  it("formats observed-at header text from radar timestamp", () => {
    expect(formatRadarObservedAtKst("202605291420")).toBe("2026-05-29 14:20");
  });

  it("routes radar requests through configured proxy path", () => {
    const env = createEnv({ RADAR_API_PROXY_PATH: "/weather/radar" });

    expect(isRadarApiRequest("/weather/radar/composite-image", env)).toBe(true);
    expect(isRadarApiRequest("/api/radar/composite-image", env)).toBe(false);
  });
});
