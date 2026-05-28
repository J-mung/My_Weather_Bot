import { APP_ERROR, appErrorMetaMap } from "@/shared/api/app-errors";
import { describe, expect, it } from "vitest";
import {
  createRadarCompositeImageError,
  getRadarCompositeImageErrorCode,
} from "./fetchRadarCompositeImage";

describe("radar composite image errors", () => {
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
});
