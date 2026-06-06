import { afterEach, describe, expect, it, vi } from "vitest";
import worker from "./worker";
import { REQUEST_ID_HEADER } from "./worker/observability";
import type { Env, WorkerExecutionContext } from "./worker/types";

const createEnv = (overrides: Partial<Env> = {}): Env => ({
  API_BASE_URL: "https://weather.example.test",
  API_KEY: "weather-key",
  AIRKOREA_API_BASE_URL: "https://air.example.test",
  KAKAO_REST_API_KEY: "kakao-key",
  KAKAO_REST_API_BASE_URL: "https://kakao.example.test",
  RADAR_API_PROXY_PATH: "/api/radar",
  ASSETS: {
    fetch: vi.fn(async () => new Response("asset")),
  },
  ...overrides,
});

const createContext = (): WorkerExecutionContext => ({
  waitUntil: vi.fn(),
});

describe("worker entry observability", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("adds request id to handled api responses and logs the same id", async () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const response = await worker.fetch(
      new Request("https://app.example.test/api/client-config", {
        headers: { [REQUEST_ID_HEADER]: "entry-req-1" },
      }),
      createEnv(),
      createContext(),
    );

    expect(response.headers.get(REQUEST_ID_HEADER)).toBe("entry-req-1");
    expect(infoSpy).toHaveBeenCalledOnce();
    expect(JSON.parse(String(infoSpy.mock.calls[0]?.[0]))).toMatchObject({
      event: "worker_request",
      requestId: "entry-req-1",
      path: "/api/client-config",
      route: "client-config",
      status: 200,
    });
  });
});
