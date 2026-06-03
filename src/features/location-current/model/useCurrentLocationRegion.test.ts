import { APP_ERROR } from "@/shared/api/app-errors";
import { AppError } from "@/shared/api/types";
import { describe, expect, it } from "vitest";
import { getCurrentLocationFailureReason } from "./useCurrentLocationRegion";

describe("current location failure reason", () => {
  it.each([
    [APP_ERROR.LOCATION_PERMISSION, "permission-denied"],
    [APP_ERROR.LOCATION_UNAVAILABLE, "unavailable"],
    [APP_ERROR.LOCATION_TIMEOUT, "timeout"],
    [APP_ERROR.LOCATION_LOOKUP_OUT_OF_SERVICE_AREA, "unsupported-service-area"],
    [APP_ERROR.LOCATION_LOOKUP_UNEXPECTED, "region-lookup-failed"],
  ] as const)("%s AppError를 %s 사유로 정규화한다", (type, expectedReason) => {
    expect(getCurrentLocationFailureReason(new AppError(type))).toBe(expectedReason);
  });

  it("AppError가 아니면 unexpected 사유로 정규화한다", () => {
    expect(getCurrentLocationFailureReason(new Error("unknown"))).toBe("unexpected");
  });
});
