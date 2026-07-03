import { describe, expect, it } from "vitest";
import {
  createSunPathChartGeometry,
  getSunlightStatusText,
  isSunPathRenderable,
} from "./sunrise-sunset-display.lib";

describe("sunrise-sunset-display", () => {
  it("maps sunrise and sunset minutes to chart coordinates", () => {
    const geometry = createSunPathChartGeometry({
      sunriseMinutes: 360,
      sunsetMinutes: 1080,
      width: 240,
    });

    expect(geometry).toMatchObject({
      sunriseX: 60,
      sunsetX: 180,
      peakX: 120,
    });
  });

  it("rejects invalid sun path ranges", () => {
    expect(isSunPathRenderable(1080, 360)).toBe(false);
    expect(createSunPathChartGeometry({ sunriseMinutes: 1080, sunsetMinutes: 360 })).toBeNull();
  });

  it("describes current sunlight status", () => {
    expect(
      getSunlightStatusText({ currentMinutes: 300, sunriseMinutes: 360, sunsetMinutes: 1080 }),
    ).toBe("아직 해가 뜨기 전이에요");
    expect(
      getSunlightStatusText({ currentMinutes: 720, sunriseMinutes: 360, sunsetMinutes: 1080 }),
    ).toBe("현재는 해가 떠 있어요");
    expect(
      getSunlightStatusText({ currentMinutes: 1200, sunriseMinutes: 360, sunsetMinutes: 1080 }),
    ).toBe("해가 진 뒤예요");
  });
});
