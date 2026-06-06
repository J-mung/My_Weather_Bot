import { afterEach, describe, expect, it, vi } from "vitest";
import {
  addRequestIdHeader,
  createWorkerRequestLog,
  REQUEST_ID_HEADER,
  resolveRequestId,
  withWorkerObservability,
} from "./observability";

describe("worker observability", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reuses a safe incoming request id", () => {
    const request = new Request("https://app.example.test/api/getVilageFcst?serviceKey=secret", {
      headers: { [REQUEST_ID_HEADER]: "client-req_123:abc" },
    });

    expect(resolveRequestId(request)).toBe("client-req_123:abc");
  });

  it("rejects unsafe incoming request id values", () => {
    const request = new Request("https://app.example.test/api/getVilageFcst", {
      headers: { [REQUEST_ID_HEADER]: "unsafe request id with spaces" },
    });

    expect(resolveRequestId(request)).not.toBe("unsafe request id with spaces");
    expect(resolveRequestId(request)).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it("adds request id without dropping existing response headers", () => {
    const response = addRequestIdHeader(
      new Response("ok", {
        headers: {
          "Cache-Control": "public, max-age=60",
          "X-Weather-Cache": "HIT",
        },
      }),
      "req-1",
    );

    expect(response.headers.get(REQUEST_ID_HEADER)).toBe("req-1");
    expect(response.headers.get("Cache-Control")).toBe("public, max-age=60");
    expect(response.headers.get("X-Weather-Cache")).toBe("HIT");
  });

  it("creates a safe structured request log without query strings", () => {
    const request = new Request(
      "https://app.example.test/api/getVilageFcst?serviceKey=secret&nx=60",
      { method: "GET" },
    );
    const response = new Response("ok", {
      status: 200,
      headers: { "X-Weather-Cache": "MISS" },
    });

    expect(
      createWorkerRequestLog({
        request,
        response,
        requestId: "req-1",
        durationMs: 12,
      }),
    ).toEqual({
      event: "worker_request",
      requestId: "req-1",
      method: "GET",
      path: "/api/getVilageFcst",
      route: "weather",
      status: 200,
      durationMs: 12,
      cache: "MISS",
    });
  });

  it("sets the response request id and logs cache status for handled requests", async () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const request = new Request("https://app.example.test/api/air-quality/getCtprvnRltmMesureDnsty", {
      headers: { [REQUEST_ID_HEADER]: "req-2" },
    });

    const response = await withWorkerObservability(request, "air-quality", async () =>
      new Response("ok", {
        status: 200,
        headers: { "X-Air-Quality-Cache": "HIT" },
      }),
    );

    expect(response.headers.get(REQUEST_ID_HEADER)).toBe("req-2");
    expect(infoSpy).toHaveBeenCalledOnce();
    expect(JSON.parse(String(infoSpy.mock.calls[0]?.[0]))).toMatchObject({
      event: "worker_request",
      requestId: "req-2",
      path: "/api/air-quality/getCtprvnRltmMesureDnsty",
      route: "air-quality",
      status: 200,
      cache: "HIT",
    });
  });
});
