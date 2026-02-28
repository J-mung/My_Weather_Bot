import { WeatherApiType } from "@/entities/weather/api/weatherApiTypes";
import {
  getCurrentTemperature,
  getObservationDateTime,
  getTemperatureSummary,
} from "@/entities/weather/model/temperatureMappers";
import { useWeatherQuery } from "@/entities/weather/model/useWeatherQuery";
import type { TemperatureSummary } from "@/entities/weather/model/weatherTypes";

/**
 * 날씨 정보 반환 훅(현재 기온, 최저/최고 기온, 시간대별 기온)
 * @returns
 */
export const useCurrentTemperature = () => {
  const ultraQuery = useWeatherQuery(WeatherApiType.ULTRA_NOW);
  const shortQuery = useWeatherQuery(WeatherApiType.SHORT_FORECAST);

  const isLoading = ultraQuery.isLoading || shortQuery.isLoading;
  const isFetching = ultraQuery.isFetching || shortQuery.isFetching;
  const isError = ultraQuery.isError || shortQuery.isError;
  const error = ultraQuery.error ?? shortQuery.error ?? null;

  // 모든 API로부터 응답을 받을 때까지 대기
  const refresh = async () => {
    await Promise.all([ultraQuery.refresh(), shortQuery.refresh()]);
  };

  if (!ultraQuery.data || !shortQuery.data) {
    return {
      data: null,
      isLoading,
      isFetching,
      isError,
      error,
      refresh,
    };
  }

  // 현재 기온
  const current = getCurrentTemperature(ultraQuery.data);
  // 초단기실황예보 응답에서 현재 시각 조회 - 현재(API 요청) 시각 기준으로 시간별로 구성하기 위함
  const currentDT = getObservationDateTime(ultraQuery.data) ?? new Date();
  const { todayMin, todayMax, hourly }: TemperatureSummary = getTemperatureSummary(
    shortQuery.data,
    currentDT,
  );

  return {
    data: { current, todayMin, todayMax, hourly },
    isLoading,
    isFetching,
    isError,
    error,
    refresh,
  };
};
