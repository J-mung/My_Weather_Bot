import { afterEach, describe, expect, it, vi } from "vitest";
import {
  formatRadarObservedAtKst,
  formatRadarTmKst,
  getRadarCandidateTimes,
  handleRadarApiRequest,
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
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

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

  it("routes radar requests through configured proxy path only", () => {
    const env = createEnv({ RADAR_API_PROXY_PATH: "/weather/radar" });

    expect(isRadarApiRequest("/weather/radar/composite-image", env)).toBe(true);
    expect(isRadarApiRequest("/api/radar/composite-image", env)).toBe(false);
  });

  it("does not expose configuration names or values when radar configuration is missing", async () => {
    const env = createEnv({ RADAR_API_PROXY_PATH: "/api/radar", RADAR_API_UPSTREAM_BASE_URL: "" });
    const response = await handleRadarApiRequest(
      new Request("https://example.test/api/radar/composite-image"),
      env,
    );
    const body = await response.text();

    expect(response.status).toBe(503);
    expect(body).toBe("Radar service unavailable");
    expect(body).not.toContain("RADAR");
    expect(body).not.toContain("API");
    expect(body).not.toContain("https://");
  });

  it("tries fallback candidate times when the client omits tm", async () => {
    const fetchedUrls: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        fetchedUrls.push(String(input));

        if (fetchedUrls.length === 1) {
          return new Response("not found", {
            status: 404,
            headers: { "Content-Type": "text/plain" },
          });
        }

        return new Response(new Blob(["radar"]), {
          status: 200,
          headers: { "Content-Type": "image/png" },
        });
      }),
    );

    const response = await handleRadarApiRequest(
      new Request("https://example.test/api/radar/composite-image"),
      createEnv({
        RADAR_API_PROXY_PATH: "/api/radar",
        RADAR_API_UPSTREAM_BASE_URL: "https://radar.example.test",
        RADAR_API_KEY: "radar-key",
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("X-Radar-Cache")).toBe("BYPASS");
    expect(response.headers.get("X-Radar-Candidate-Count")).toBe("6");
    expect(fetchedUrls).toHaveLength(2);
    expect(fetchedUrls[0]).toContain("authKey=radar-key");
    expect(fetchedUrls[1]).toContain("authKey=radar-key");
    expect(new URL(fetchedUrls[0]).searchParams.get("tm")).not.toBe(
      new URL(fetchedUrls[1]).searchParams.get("tm"),
    );
  });
});
