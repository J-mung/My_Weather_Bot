import { describe, expect, it, vi } from "vitest";
import { serveAsset } from "./assets";
import type { Env } from "./types";

const createEnv = (fetch: Env["ASSETS"]["fetch"]): Env =>
  ({
    ASSETS: { fetch },
  }) as Env;

describe("serveAsset", () => {
  it("falls back SPA html navigations to the app shell without requesting /index.html", async () => {
    const assetFetch = vi.fn<Env["ASSETS"]["fetch"]>()
      .mockResolvedValueOnce(new Response("missing", { status: 404 }))
      .mockResolvedValueOnce(new Response("app shell", { status: 200 }));

    const response = await serveAsset(
      new Request("https://app.example.test/bookmark", {
        headers: { Accept: "text/html,application/xhtml+xml" },
      }),
      createEnv(assetFetch),
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("app shell");
    expect(assetFetch).toHaveBeenCalledTimes(2);
    const fallbackRequest = assetFetch.mock.calls[1]?.[0];
    expect(fallbackRequest).toBeInstanceOf(Request);
    expect(new URL(fallbackRequest?.url ?? "").pathname).toBe("/");
  });

  it("does not fallback non-html missing assets", async () => {
    const assetFetch = vi.fn(async () => new Response("missing", { status: 404 }));

    const response = await serveAsset(
      new Request("https://app.example.test/assets/missing.js", {
        headers: { Accept: "*/*" },
      }),
      createEnv(assetFetch),
    );

    expect(response.status).toBe(404);
    expect(assetFetch).toHaveBeenCalledTimes(1);
  });
});
