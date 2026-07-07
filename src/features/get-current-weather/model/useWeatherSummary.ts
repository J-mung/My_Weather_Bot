import { WeatherApiType } from "@/entities/weather/api/weather-api.constants";
import {
  getCurrentWeatherNow,
  getObservationDateTime,
  getPrecipitationSummary,
  getTemperatureSummary,
} from "@/entities/weather/model/temperatureMappers";
import { getOutfitRecommendation } from "@/entities/weather/model/outfitRecommendation";
import { useWeatherQuery } from "@/entities/weather/model/useWeatherQuery";
import type {
  GridCoord,
  SummaryDomain,
  TemperatureSummary,
} from "@/entities/weather/model/weather.types";
import { APP_ERROR, type AppErrorType } from "@/shared/api/app-errors";
import type { AppError } from "@/shared/api/types";

type WeatherSummaryQuerySnapshot = {
  data: unknown;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: AppError | null;
};

type WeatherSummaryQueryStateInput = {
  ultraNow: WeatherSummaryQuerySnapshot;
  ultraForecast: WeatherSummaryQuerySnapshot;
  shortForecast: WeatherSummaryQuerySnapshot;
  todayTempRange: WeatherSummaryQuerySnapshot;
};

const weatherNoDataErrorTypes = new Set<AppErrorType>([
  APP_ERROR.ULTRA_NOW_NOT_FOUND,
  APP_ERROR.ULTRA_FORECAST_NOT_FOUND,
  APP_ERROR.SHORT_FORECAST_NOT_FOUND,
]);

const isWeatherNoDataError = (error: AppError | null): boolean =>
  Boolean(error && weatherNoDataErrorTypes.has(error.type));

export const getWeatherSummaryQueryState = ({
  ultraNow,
  ultraForecast,
  shortForecast,
  todayTempRange,
}: WeatherSummaryQueryStateInput): {
  hasRequiredData: boolean;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isNoData: boolean;
  error: AppError | null;
} => {
  const requiredQueries = [ultraNow, ultraForecast, shortForecast];
  const allQueries = [...requiredQueries, todayTempRange];
  const requiredErrors = requiredQueries
    .map((query) => query.error)
    .filter((error): error is AppError => Boolean(error));
  const error = requiredErrors.find((queryError) => !isWeatherNoDataError(queryError)) ?? null;
  const isNoData = requiredErrors.length > 0 && requiredErrors.every(isWeatherNoDataError);

  return {
    hasRequiredData: requiredQueries.every((query) => Boolean(query.data)),
    isLoading: requiredQueries.some((query) => query.isLoading),
    isFetching: allQueries.some((query) => query.isFetching),
    isError: Boolean(error),
    isNoData,
    error,
  };
};

/**
 * 메인/북마크 화면에 필요한 날씨 요약 정보를 반환한다.
 * - 현재 관측값(now): 기온, 습도, 풍속, 체감온도, 상태
 * - 오늘 최저/최고 기온
 * - 시간대별 기온
 * @returns
 */
export const useWeatherSummary = (
  param: GridCoord,
  options?: { enabled?: boolean },
): {
  data: SummaryDomain | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isNoData: boolean;
  error: AppError | null;
  refresh: () => Promise<void>;
} => {
  const queryOptions = { enabled: options?.enabled ?? true };
  const ultraQuery = useWeatherQuery(WeatherApiType.ULTRA_NOW, param, queryOptions);
  const ultraForecastQuery = useWeatherQuery(WeatherApiType.ULTRA_FORECAST, param, queryOptions);
  const shortQuery = useWeatherQuery(WeatherApiType.SHORT_FORECAST, param, queryOptions);
  const todayTempRangeQuery = useWeatherQuery(WeatherApiType.TODAY_TEMP_RANGE, param, queryOptions);

  const queryState = getWeatherSummaryQueryState({
    ultraNow: ultraQuery,
    ultraForecast: ultraForecastQuery,
    shortForecast: shortQuery,
    todayTempRange: todayTempRangeQuery,
  });

  // 최신 발표시각 기준으로 각 날씨 API를 다시 조회한다.
  const refresh = async () => {
    await Promise.all([
      ultraQuery.refresh(),
      ultraForecastQuery.refresh(),
      shortQuery.refresh(),
      todayTempRangeQuery.refetch(),
    ]);
  };

  if (
    !queryState.hasRequiredData ||
    !ultraQuery.data ||
    !ultraForecastQuery.data ||
    !shortQuery.data
  ) {
    return {
      data: null,
      isLoading: queryState.isLoading,
      isFetching: queryState.isFetching,
      isError: queryState.isError,
      isNoData: queryState.isNoData,
      error: queryState.error,
      refresh,
    };
  }

  // 초단기실황예보 응답에서 현재 시각 조회 - 현재(API 요청) 시각 기준으로 시간별로 구성하기 위함
  const currentDT = getObservationDateTime(ultraQuery.data) ?? new Date();
  const now = getCurrentWeatherNow(ultraQuery.data, ultraForecastQuery.data, currentDT);
  const precipitation = getPrecipitationSummary(shortQuery.data, currentDT);
  const { todayMin, todayMax, hourly }: TemperatureSummary = getTemperatureSummary(
    shortQuery.data,
    currentDT,
    todayTempRangeQuery.data,
  );
  const outfitRecommendation = getOutfitRecommendation(now, precipitation);

  const data: SummaryDomain = {
    now,
    precipitation,
    outfitRecommendation,
    todayMin,
    todayMax,
    hourly,
  };

  return {
    data: data,
    isLoading: queryState.isLoading,
    isFetching: queryState.isFetching,
    isError: queryState.isError,
    isNoData: false,
    error: queryState.error,
    refresh,
  };
};
