import { WeatherApiType } from "@/entities/weather/api/weatherApiTypes";
import { useWeatherQuery } from "@/entities/weather/model/useWeatherQuery";

/**
 * 단기예보 커스텀 훅
 * @returns
 */
export const useShortFcstWeather = () => {
  const query = useWeatherQuery(WeatherApiType.SHORT_FORECAST);
  return { ...query, fetchShortFcstWeather: query.refresh };
};
