import { afterEach, describe, expect, it, vi } from "vitest";
import { handleAirQualityApiRequest } from "./air-quality";
import type { Env } from "./types";

const createEnv = (overrides: Partial<Env> = {}): Env => ({
  API_BASE_URL: "https://weather.example.test",
  API_KEY: "weather-key",
  AIRKOREA_API_BASE_URL: "https://air.example.test",
  AIRKOREA_API_KEY: "airkorea-key",
  KAKAO_REST_API_KEY: "kakao-key",
  KAKAO_REST_API_BASE_URL: "https://kakao.example.test",
  ASSETS: {
    fetch: vi.fn(),
  },
  ...overrides,
});

const createAirQualityRequest = (query = "sidoName=서울&serviceKey=client-key"): Request =>
  new Request(`https://app.example.test/api/air-quality/getCtprvnRltmMesureDnsty?${query}`, {
    headers: { Origin: "https://app.example.test" },
  });

const createAirKoreaBody = (resultCode = "00") =>
  JSON.stringify({
    response: {
      header: { resultCode, resultMsg: resultCode === "00" ? "NORMAL_CODE" : "SERVICE_ERROR" },
      body: { items: [] },
    },
  });

const createMemoryCache = () => {
  const store = new Map<string, Response>();

  return {
    store,
    match: vi.fn((request: Request) => store.get(request.url) ?? null),
    put: vi.fn(async (request: Request, response: Response) => {
      store.set(request.url, response.clone());
    }),
  };
};

describe("handleAirQualityApiRequest", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("returns a generic configuration error without exposing env variable names", async () => {
    const response = await handleAirQualityApiRequest(
      createAirQualityRequest(),
      createEnv({ AIRKOREA_API_KEY: "", API_KEY: "" }),
    );

    await expect(response.text()).resolves.toBe("Air quality service configuration unavailable");
    expect(response.status).toBe(500);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://app.example.test");
  });

  it("uses the server-side API key and excludes client serviceKey from the cache key", async () => {
    const cache = createMemoryCache();
    vi.stubGlobal("caches", { default: cache });
    const fetchedUrls: string[] = [];
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      fetchedUrls.push(String(input));

      return new Response(createAirKoreaBody("00"), {
        status: 200,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await handleAirQualityApiRequest(createAirQualityRequest(), createEnv());

    expect(response.headers.get("X-Air-Quality-Cache")).toBe("MISS");
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchedUrls[0]).toBeDefined();
    const upstreamUrl = new URL(fetchedUrls[0]);
    expect(upstreamUrl.searchParams.get("serviceKey")).toBe("airkorea-key");
    expect(upstreamUrl.searchParams.get("returnType")).toBe("json");
    expect(cache.put).toHaveBeenCalledOnce();
    const cacheRequest = cache.put.mock.calls[0]?.[0] as Request;
    expect(cacheRequest.url).not.toContain("client-key");
    expect(cacheRequest.url).not.toContain("airkorea-key");
  });

  it("does not cache AirKorea error payloads even when the HTTP status is 200", async () => {
    const cache = createMemoryCache();
    vi.stubGlobal("caches", { default: cache });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(createAirKoreaBody("30"), {
          status: 200,
          headers: { "Content-Type": "application/json; charset=utf-8" },
        }),
      ),
    );

    const response = await handleAirQualityApiRequest(createAirQualityRequest(), createEnv());

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("X-Air-Quality-Cache")).toBe("BYPASS");
    expect(cache.put).not.toHaveBeenCalled();
  });

  it("serves cached successful responses without calling upstream", async () => {
    const cache = createMemoryCache();
    const request = createAirQualityRequest("numOfRows=100&sidoName=서울");
    const cacheKey = new Request(
      "https://app.example.test/api/air-quality/getCtprvnRltmMesureDnsty?numOfRows=100&sidoName=%EC%84%9C%EC%9A%B8",
      { method: "GET" },
    );
    cache.store.set(
      cacheKey.url,
      new Response(createAirKoreaBody("00"), {
        status: 200,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      }),
    );
    vi.stubGlobal("caches", { default: cache });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await handleAirQualityApiRequest(request, createEnv());

    expect(response.headers.get("X-Air-Quality-Cache")).toBe("HIT");
    expect(fetchMock).not.toHaveBeenCalled();
    await expect(response.text()).resolves.toContain("NORMAL_CODE");
  });
});
