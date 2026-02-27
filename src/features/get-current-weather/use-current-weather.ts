import { useState } from "react";
import { useWeatherNow } from "../../entities/weather/api/weather.api";
import type { GridCoord } from "../../entities/weather/model/weather.types";
import { convertToGridCoord } from "../../shared/convert-to-gridcoord";
import { getUserLocation } from "../../shared/get-user-location";
import { getUltraSrtNcstBaseDateTime } from "../../shared/weather-date-time";
import type { CurrentWeatherParams } from "./model/current-weather.params";

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
