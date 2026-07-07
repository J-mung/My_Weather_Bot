import { WeatherApiType } from "@/entities/weather/api/weather-api.constants";
import { getTemperatureSummary } from "@/entities/weather/model/temperatureMappers";
import { useWeatherQuery } from "@/entities/weather/model/useWeatherQuery";
import { APP_ERROR } from "@/shared/api/app-errors";
import type { AppError } from "@/shared/api/types";
import type { BookmarkForecastPreview, BookmarkForecastPreviewReq } from "./types";

export const isBookmarkForecastNoDataError = (error: AppError | null): boolean =>
  error?.type === APP_ERROR.SHORT_FORECAST_NOT_FOUND;

export const useBookmarkForecastPreview = (
  param: BookmarkForecastPreviewReq,
  options?: { enabled?: boolean },
): BookmarkForecastPreview => {
  const forecastQuery = useWeatherQuery(WeatherApiType.SHORT_FORECAST, param, {
    enabled: options?.enabled ?? true,
  });

  const { isLoading, isFetching, isError, data, error } = forecastQuery;
  const isNoData = isBookmarkForecastNoDataError(error);
  const refresh = async () => {
    await forecastQuery.refresh();
  };

  if (!data) {
    return {
      data: null,
      isLoading,
      isFetching,
      isError: isNoData ? false : isError,
      isNoData,
      error: isNoData ? null : error,
      refresh,
    };
  }

  const forecast = getTemperatureSummary(data, new Date());
  const nearestForecast = forecast.hourly[0] ?? null;

  return {
    data: {
      forecastTemperature: nearestForecast?.temp ?? null,
      todayMin: forecast.todayMin,
      todayMax: forecast.todayMax,
      condition: nearestForecast?.condition ?? "unavailable",
    },
    isLoading,
    isFetching,
    isError,
    isNoData: false,
    error,
    refresh,
  };
};
