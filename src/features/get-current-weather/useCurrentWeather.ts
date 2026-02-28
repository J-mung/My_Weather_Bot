import { useState } from "react";
import { useWeatherNow } from "../../entities/weather/api/weatherApi";
import type { GridCoord } from "../../entities/weather/model/weatherTypes";
import { convertToGridCoord } from "../../shared/convertToGridcoord";
import { getUserLocation } from "../../shared/getUserLocation";
import { getUltraSrtNcstBaseDateTime } from "../../shared/weatherDateTime";
import type { CurrentWeatherParams } from "./model/currentWeatherParams";

export const useCurrentWeather = () => {
  const [params, setParams] = useState<CurrentWeatherParams | null>(null);

  const query = useWeatherNow(params, false);

  const fetchByCurrentLocation = async () => {
    const userLocation = await getUserLocation();
    const { base_date, base_time } = getUltraSrtNcstBaseDateTime();
    const { nx, ny }: GridCoord = convertToGridCoord(userLocation);
    setParams({ base_date, base_time, nx, ny });

    setTimeout(() => {
      query.refetch();
    }, 0);
  };

  return {
    params,
    ...query,
    fetchByCurrentLocation,
  };
};
