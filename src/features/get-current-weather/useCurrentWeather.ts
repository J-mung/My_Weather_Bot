import { WeatherApiType } from "@/entities/weather/api/weatherApiTypes";
import { useWeatherQuery } from "@/entities/weather/model/useWeatherQuery";

/**
 * 초단기실황예보 커스텀 훅
 * @returns
 */
export const useCurrentWeather = () => {
  const query = useWeatherQuery(WeatherApiType.ULTRA_NOW);

  return {
    ...query,
    fetchByCurrentWeather: query.refresh,
  };
};
