import type { WeatherApiType, WeatherResponseMap } from "@/entities/weather/api/weatherApiTypes";
import type { RequestWeatherParams } from "@/entities/weather/model/requestWeatherParams";
import { weatherStrategyRegistry } from "@/entities/weather/model/weatherStrategyRegistry";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import type { GridCoord } from "./weatherTypes";

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

  // API type에 따라서 params 재생성
  useEffect(() => {
    const initApiParams = async () => {
      let newParams = await weatherStrategyRegistry[type].buildParams();
      if (Number.isFinite(param.nx) && Number.isFinite(param.ny))
        newParams = { ...newParams, ...param };
      setParams(newParams);
    };
    void initApiParams();
  }, [type, param.nx, param.ny]);

  // UI에서 데이터 조회 요청할 때 사용
  const refresh = useCallback(async () => {
    const newParams = await strategy.buildParams();
    setParams(newParams);
    return newParams;
  }, [strategy]);

  const query = useQuery<WeatherResponseMap[T]>({
    queryKey: ["weather", type, ...(params ? Object.values(params) : [])],
    queryFn: async () => {
      if (!params) {
        throw new Error("요청 파라미터가 없습니다.");
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
