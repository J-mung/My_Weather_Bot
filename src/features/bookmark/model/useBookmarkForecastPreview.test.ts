import { APP_ERROR } from "@/shared/api/app-errors";
import { AppError } from "@/shared/api/types";
import { describe, expect, it } from "vitest";
import { isBookmarkForecastNoDataError } from "./useBookmarkForecastPreview";

describe("isBookmarkForecastNoDataError", () => {
  it("treats short forecast NOT_FOUND as no-data", () => {
    expect(isBookmarkForecastNoDataError(new AppError(APP_ERROR.SHORT_FORECAST_NOT_FOUND))).toBe(
      true,
    );
  });

  it("does not treat request retry errors as no-data", () => {
    expect(isBookmarkForecastNoDataError(new AppError(APP_ERROR.SHORT_FORECAST_RETRY_LATER))).toBe(
      false,
    );
  });
});
