import { useEffect, useState } from "react";
import { WeatherApiType } from "../../entities/weather/api/weatherApiMap";
import { useWeatherQuery } from "../../entities/weather/model/useWeatherQuery";
import type { BaseDateTime, GridCoord } from "../../entities/weather/model/weatherTypes";
import { convertToGridCoord } from "../../shared/convertToGridcoord";
import { getUserLocation } from "../../shared/getUserLocation";
import { getUltraSrtNcstBaseDateTime } from "../../shared/weatherDateTime";
import type { CurrentWeatherParams } from "./model/currentWeatherParams";

export const useCurrentWeather = () => {
  const [params, setParams] = useState<CurrentWeatherParams | null>(null);

  // 마운트 시 정보 출력
  useEffect(() => {
    const initApiParams = async () => {
      const userLocation = await getUserLocation();
      const { base_date, base_time }: BaseDateTime = getUltraSrtNcstBaseDateTime();
      const { nx, ny }: GridCoord = convertToGridCoord(userLocation);

      setParams({ base_date, base_time, nx, ny });
    };

    initApiParams();
  }, []);

  const query = useWeatherQuery(WeatherApiType.ULTRA_NOW, params!, { enabled: !!params });

  const fetchByCurrentWeather = async (): Promise<CurrentWeatherParams> => {
    const userLocation = await getUserLocation();
    const { base_date, base_time }: BaseDateTime = getUltraSrtNcstBaseDateTime();
    const { nx, ny }: GridCoord = convertToGridCoord(userLocation);

    return { base_date, base_time, nx, ny };
  };

  return {
    params,
    ...query,
    fetchByCurrentWeather,
  };
};
