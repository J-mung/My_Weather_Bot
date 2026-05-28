import { APP_ERROR, appErrorMetaMap } from "@/shared/api/app-errors";
import { afterEach, describe, expect, it, vi } from "vitest";

const clientConfigGetMock = vi.hoisted(() => vi.fn());

vi.mock("@/shared/api/axios", () => ({
  getApiClient: () => ({
    get: clientConfigGetMock,
  }),
}));

import {
  createRadarCompositeImageError,
  fetchRadarCompositeImage,
  getRadarCompositeImageErrorCode,
} from "./fetchRadarCompositeImage";

describe("radar composite image errors", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    clientConfigGetMock.mockReset();
  });

  it("uses centralized safe metadata without exposing configuration names", () => {
    const error = createRadarCompositeImageError(APP_ERROR.RADAR_CONFIG);
    const meta = appErrorMetaMap[APP_ERROR.RADAR_CONFIG];

    expect(error.message).toBe(meta.description);
    expect(error.message).not.toContain("RADAR_API");
    expect(error.message).not.toContain("KEY");
    expect(getRadarCompositeImageErrorCode(error)).toBe("MWB-RADAR-001");
  });

  it("falls back to an unknown radar code for unexpected errors", () => {
    expect(getRadarCompositeImageErrorCode(new Error("unexpected"))).toBe("MWB-RADAR-999");
  });

  it("requests the runtime radar proxy path returned by worker client config", async () => {
    clientConfigGetMock.mockResolvedValue({ data: { radarApiProxyPath: "weather/radar/" } });
    const fetchMock = vi.fn(async () => {
      return new Response(new Blob(["radar"]), {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "X-Radar-Tm": "202605291420",
          "X-Radar-Observed-At-KST": "2026-05-29 14:20",
        },
      });
    });
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:radar");

    await expect(fetchRadarCompositeImage({ tm: "202605291420" })).resolves.toMatchObject({
      imageUrl: "blob:radar",
      tm: "202605291420",
    });
    expect(clientConfigGetMock).toHaveBeenCalledWith("", { signal: undefined });
    expect(fetchMock).toHaveBeenCalledWith(
      "/weather/radar/composite-image?tm=202605291420",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("maps missing runtime radar proxy path to the radar config code", async () => {
    clientConfigGetMock.mockResolvedValue({ data: {} });

    await expect(fetchRadarCompositeImage({ tm: "202605291420" })).rejects.toMatchObject({
      code: "MWB-RADAR-001",
    });
  });
});
