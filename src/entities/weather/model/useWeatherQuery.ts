import type { WeatherApiType, WeatherResponseMap } from "@/entities/weather/api/weather-api.types";
import { WEATHER_QUERY_POLICY } from "@/entities/weather/model/weather-cache-policy";
import {
  createWeatherQueryKey,
  type WeatherQueryKey,
} from "@/entities/weather/model/weather-query-key";
import { weatherStrategyRegistry } from "@/entities/weather/model/weatherStrategyRegistry";
import { AppError } from "@/shared/api/types";
import { convertToGridCoord } from "@/shared/lib/convertToGridCoord";
import { getUserLocation } from "@/shared/lib/userLocation";
import { useQueries, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import type { RequestWeatherParams } from "./weather-model.types";
import type { GridCoord } from "./weather.types";

const hasResolvedGridCoord = (nx: number, ny: number): boolean =>
  Number.isFinite(nx) && Number.isFinite(ny);

export const useWeatherQuery = <T extends WeatherApiType>(
  type: T,
  param: GridCoord,
  options?: { enabled?: boolean },
) => {
  const { nx, ny } = param;
  const strategy = weatherStrategyRegistry[type];
  const isQueryEnabled = options?.enabled ?? true;

  if (!strategy) {
    throw new Error("지원하지 않는 기능입니다.");
  }

  const buildParamsFromGridCoord = useCallback((): RequestWeatherParams | null => {
    if (!hasResolvedGridCoord(nx, ny)) {
      return null;
    }

    return { ...strategy.buildParams(), nx, ny };
  }, [strategy, nx, ny]);

  const [params, setParams] = useState<RequestWeatherParams | null>(() =>
    buildParamsFromGridCoord(),
  );

  const resolveParams = useCallback(async (): Promise<RequestWeatherParams> => {
    const gridParams = buildParamsFromGridCoord();
    if (gridParams) {
      return gridParams;
    }

    const userLocation = await getUserLocation();
    const { nx, ny }: GridCoord = convertToGridCoord(userLocation);
    return { ...strategy.buildParams(), nx, ny };
  }, [buildParamsFromGridCoord, strategy]);

  // API type 또는 좌표가 바뀌면 발표시각과 격자 기준의 정규화된 params를 재생성한다.
  useEffect(() => {
    let ignore = false;

    const init = async () => {
      const newParams = await resolveParams();
      if (!ignore) {
        setParams(newParams);
      }
    };

    void init();

    return () => {
      ignore = true;
    };
  }, [resolveParams]);

  // UI에서 데이터 조회 요청할 때 사용
  const refresh = useCallback(async () => {
    const newParams = await resolveParams();
    setParams(newParams);
    return newParams;
  }, [resolveParams]);

  const queries: UseQueryOptions<
    WeatherResponseMap[T],
    AppError,
    WeatherResponseMap[T],
    WeatherQueryKey
  >[] = params
    ? [
        {
          queryKey: createWeatherQueryKey(type, params),
          queryFn: () => strategy.fetch(params),
          staleTime: WEATHER_QUERY_POLICY[type].staleTimeMs,
          gcTime: WEATHER_QUERY_POLICY[type].gcTimeMs,
          enabled: isQueryEnabled,
        },
      ]
    : [];

  const [query] = useQueries({
    queries,
  }) as [UseQueryResult<WeatherResponseMap[T], AppError>?];

  const isResolvingParams = isQueryEnabled && !params;

  return {
    params,
    refresh,
    data: query?.data,
    error: query?.error ?? null,
    isLoading: isResolvingParams || (query?.isLoading ?? false),
    isFetching: isResolvingParams || (query?.isFetching ?? false),
    isError: query?.isError ?? false,
    refetch:
      query?.refetch ??
      (async () => {
        await refresh();
        return undefined;
      }),
  };
};
