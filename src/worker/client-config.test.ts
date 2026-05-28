import { describe, expect, it, vi } from "vitest";
import { handleClientConfigRequest } from "./client-config";
import type { Env } from "./types";

const createEnv = (overrides: Partial<Env> = {}): Env => ({
  API_BASE_URL: "https://weather.example.test",
  API_KEY: "weather-key",
  AIRKOREA_API_BASE_URL: "https://air.example.test",
  KAKAO_REST_API_KEY: "kakao-key",
  KAKAO_REST_API_BASE_URL: "https://kakao.example.test",
  ASSETS: {
    fetch: vi.fn(),
  },
  ...overrides,
});

describe("handleClientConfigRequest", () => {
  it("returns the runtime radar proxy path from worker environment", async () => {
    const response = await handleClientConfigRequest(
      new Request("https://app.example.test/api/client-config", {
        headers: { Origin: "https://app.example.test" },
      }),
      createEnv({ RADAR_API_PROXY_PATH: "weather/radar/" }),
    );

    await expect(response.json()).resolves.toEqual({ radarApiProxyPath: "/weather/radar" });
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://app.example.test");
  });

  it("returns a generic error when client configuration is unavailable", async () => {
    const response = await handleClientConfigRequest(
      new Request("https://app.example.test/api/client-config"),
      createEnv({ RADAR_API_PROXY_PATH: "" }),
    );

    await expect(response.text()).resolves.toBe("Client configuration unavailable");
    expect(response.status).toBe(503);
  });
});
