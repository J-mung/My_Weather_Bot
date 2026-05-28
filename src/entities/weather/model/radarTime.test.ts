import { describe, expect, it } from "vitest";
import { formatRadarTmDisplay, formatRadarTmKst, getLatestRadarTmKst } from "./radarTime";

describe("radarTime", () => {
  it("formats UTC Date as KST timestamp", () => {
    expect(formatRadarTmKst(new Date("2026-05-29T05:20:00.000Z"))).toBe("202605291420");
  });

  it("uses a 20 minute safety delay and floors to 10 minute radar interval", () => {
    expect(getLatestRadarTmKst(new Date("2026-05-29T05:47:30.000Z"))).toBe("202605291420");
  });

  it("formats radar timestamp for display", () => {
    expect(formatRadarTmDisplay("202605291420")).toBe("2026.05.29 14:20 기준");
  });
});
