import { afterEach, describe, expect, it, vi } from "vitest";
import { handleRiseSetApiRequest } from "./rise-set";
import type { Env } from "./types";

const createEnv = (overrides: Partial<Env> = {}): Env => ({
  API_BASE_URL: "https://weather.example.test",
  API_KEY: "weather-key",
  AIRKOREA_API_BASE_URL: "https://air.example.test",
  KAKAO_REST_API_KEY: "kakao-key",
  KAKAO_REST_API_BASE_URL: "https://kakao.example.test",
  RISE_SET_API_BASE_URL: "https://rise.example.test",
  RISE_SET_API_KEY: "rise-set-key",
  ASSETS: {
    fetch: vi.fn(async () => new Response("asset")),
  },
  ...overrides,
});

describe("rise-set worker proxy", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("injects service key upstream without exposing it in client cache key", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        "<response><header><resultCode>00</resultCode></header><body><items><item><sunrise>0518</sunrise><sunset>1957</sunset></item></items></body></response>",
        { headers: { "Content-Type": "application/xml" } },
      ),
    );

    const response = await handleRiseSetApiRequest(
      new Request("https://app.example.test/api/rise-set/getAreaRiseSetInfo?locdate=20260703&location=서울"),
      createEnv(),
    );

    expect(response.status).toBe(200);
    const upstreamUrl = new URL(String(fetchSpy.mock.calls[0]?.[0]));
    expect(upstreamUrl.origin).toBe("https://rise.example.test");
    expect(upstreamUrl.pathname).toBe("/getAreaRiseSetInfo");
    expect(upstreamUrl.searchParams.get("serviceKey")).toBe("rise-set-key");
    expect(upstreamUrl.searchParams.get("location")).toBe("서울");
  });

  it("rejects unsupported endpoints", async () => {
    const response = await handleRiseSetApiRequest(
      new Request("https://app.example.test/api/rise-set/unknown"),
      createEnv(),
    );

    expect(response.status).toBe(400);
  });

  it("returns configuration error when base url or api key is missing", async () => {
    const response = await handleRiseSetApiRequest(
      new Request("https://app.example.test/api/rise-set/getAreaRiseSetInfo?locdate=20260703&location=서울"),
      createEnv({ RISE_SET_API_BASE_URL: "", RISE_SET_API_KEY: "" }),
    );

    expect(response.status).toBe(500);
  });
});
