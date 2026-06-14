import { APP_ERROR } from "@/shared/api/app-errors";
import { AppError } from "@/shared/api/types";
import { describe, expect, it } from "vitest";
import { getWeatherSummaryQueryState } from "./useWeatherSummary";

const readyQuery = () => ({
  data: {},
  isLoading: false,
  isFetching: false,
  isError: false,
  error: null,
});

describe("getWeatherSummaryQueryState", () => {
  it("일 최저/최고 보조 조회만 실패하면 홈 전체 에러로 전파하지 않는다", () => {
    const state = getWeatherSummaryQueryState({
      ultraNow: readyQuery(),
      ultraForecast: readyQuery(),
      shortForecast: readyQuery(),
      todayTempRange: {
        data: undefined,
        isLoading: false,
        isFetching: false,
        isError: true,
        error: new AppError(APP_ERROR.SHORT_FORECAST_NOT_FOUND),
      },
    });

    expect(state).toMatchObject({
      hasRequiredData: true,
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  it("핵심 날씨 조회가 실패하면 에러로 전파한다", () => {
    const error = new AppError(APP_ERROR.ULTRA_NOW_NOT_FOUND);
    const state = getWeatherSummaryQueryState({
      ultraNow: {
        data: undefined,
        isLoading: false,
        isFetching: false,
        isError: true,
        error,
      },
      ultraForecast: readyQuery(),
      shortForecast: readyQuery(),
      todayTempRange: readyQuery(),
    });

    expect(state).toMatchObject({
      hasRequiredData: false,
      isLoading: false,
      isError: true,
      error,
    });
  });
});
