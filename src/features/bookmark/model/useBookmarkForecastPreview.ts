import { WeatherApiType } from "@/entities/weather/api/weather-api.constants";
import { getTemperatureSummary } from "@/entities/weather/model/temperatureMappers";
import { useWeatherQuery } from "@/entities/weather/model/useWeatherQuery";
import type { BookmarkForecastPreview, BookmarkForecastPreviewReq } from "./types";

export const useBookmarkForecastPreview = (
  param: BookmarkForecastPreviewReq,
  options?: { enabled?: boolean },
): BookmarkForecastPreview => {
  const forecastQuery = useWeatherQuery(WeatherApiType.SHORT_FORECAST, param, {
    enabled: options?.enabled ?? true,
  });

  const { isLoading, isFetching, isError, data, error } = forecastQuery;

  if (!data) {
    return {
      data: null,
      isLoading,
      isFetching,
      isError,
      error,
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
    error,
  };
};
