import { WeatherApiType } from "@/entities/weather/api/weather-api.constants";
import {
  getBookmarkSummary,
  getObservationDateTime,
} from "@/entities/weather/model/temperatureMappers";
import { useWeatherQuery } from "@/entities/weather/model/useWeatherQuery";
import type { BookmarkSummary, BookmarkSummaryReq } from "./types";

export const useBookmarkSummary = (param: BookmarkSummaryReq): BookmarkSummary => {
  const ultraQuery = useWeatherQuery(WeatherApiType.ULTRA_NOW, param);
  const todayTempRangeQuery = useWeatherQuery(WeatherApiType.TODAY_TEMP_RANGE, param);

  const {
    isLoading: ultraIsLoading,
    isFetching: ultraIsFetching,
    isError: ultraIsError,
    data: ultraData,
    error: ultraError,
  } = ultraQuery;
  const {
    isLoading: todayIsLoading,
    isFetching: todayIsFetching,
    isError: todayIsError,
    data: todayData,
    error: todayError,
  } = todayTempRangeQuery;

  const isLoading = ultraIsLoading || todayIsLoading;
  const isFetching = ultraIsFetching || todayIsFetching;
  const isError = ultraIsError || todayIsError;
  const error = ultraError ?? todayError ?? null;

  if (!ultraData || !todayData) {
    return {
      data: null,
      isLoading,
      isFetching,
      isError,
      error,
    };
  }

  const currentDT = getObservationDateTime(ultraData) ?? new Date();
  const summary = getBookmarkSummary(ultraData, todayData, currentDT);

  return {
    data: summary,
    isLoading,
    isFetching,
    isError,
    error,
  };
};
