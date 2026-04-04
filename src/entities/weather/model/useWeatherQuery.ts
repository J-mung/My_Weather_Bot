import type { WeatherApiType, WeatherResponseMap } from "@/entities/weather/api/weather-api.types";
import { weatherStrategyRegistry } from "@/entities/weather/model/weatherStrategyRegistry";
import { APP_ERROR } from "@/shared/api/app-errors";
import { AppError } from "@/shared/api/types";
import { convertToGridCoord } from "@/shared/lib/convertToGridCoord";
import { getUserLocation } from "@/shared/lib/userLocation";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import type { RequestWeatherParams } from "./weather-model.types";
import type { GridCoord } from "./weather.types";

export const useWeatherQuery = <T extends WeatherApiType>(
  type: T,
  param: GridCoord,
  options?: { enabled?: boolean },
) => {
  const [params, setParams] = useState<RequestWeatherParams | null>(null);
  const strategy = weatherStrategyRegistry[type];

  if (!strategy) {
    throw new Error("지원하지 않는 기능입니다.");
  }

  const resolveParams = useCallback(async (): Promise<RequestWeatherParams> => {
    const baseParams = strategy.buildParams();

    if (Number.isFinite(param.nx) && Number.isFinite(param.ny)) {
      return { ...baseParams, nx: param.nx, ny: param.ny };
    }

    const userLocation = await getUserLocation();
    const { nx, ny }: GridCoord = convertToGridCoord(userLocation);
    return { ...baseParams, nx, ny };
  }, [strategy, param.nx, param.ny]);

  // API type에 따라서 params 재생성
  useEffect(() => {
    const init = async () => {
      const newParams = await resolveParams();
      setParams(newParams);
    };

    void init();
  }, [type, param.nx, param.ny]);

  // UI에서 데이터 조회 요청할 때 사용
  const refresh = useCallback(async () => {
    const newParams = await resolveParams();
    setParams(newParams);
    return newParams;
  }, [resolveParams]);

  const query = useQuery<WeatherResponseMap[T], AppError>({
    queryKey: ["weather", type, ...(params ? Object.values(params) : [])],
    queryFn: async () => {
      if (!params) {
        throw new AppError(APP_ERROR.WEATHER_PARAMETER);
      }

      return strategy.fetch(params);
    },
    staleTime: 1000 * 60 * 5, // 5분
    enabled: (options?.enabled ?? true) && !!params,
  });

  return {
    params,
    refresh,
    ...query,
  };
};
