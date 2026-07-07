import { fetchAirQualityBySido } from "@/entities/air-quality/api/fetchAirQualityBySido";
import { APP_ERROR, appErrorMetaMap } from "@/shared/api/app-errors";
import type { AppErrorMeta } from "@/shared/api/types";
import {
  ensureAirQualityItems,
  resolveDistrictStationKeywords,
  resolveSidoName,
  selectAirQualityStation,
  toAirQualitySummary,
} from "@/entities/air-quality/model/airQualityMappers";
import type { AirQualitySummary } from "@/entities/air-quality/model/air-quality.types";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const AIR_QUALITY_STALE_TIME_MS = 20 * 60 * 1000;
const AIR_QUALITY_GC_TIME_MS = 60 * 60 * 1000;

export const useAirQualitySummary = (
  district: string,
): {
  data: AirQualitySummary | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  noData: {
    pm10: boolean;
    pm25: boolean;
  };
  error: AppErrorMeta | null;
} => {
  const sidoName = useMemo(() => resolveSidoName(district), [district]);
  const stationKeywords = useMemo(() => resolveDistrictStationKeywords(district), [district]);

  const query = useQuery({
    queryKey: ["air-quality", sidoName],
    queryFn: async () => {
      if (!sidoName) {
        throw new Error("대기질 조회 지역을 확인하지 못했습니다.");
      }

      return fetchAirQualityBySido({ sidoName });
    },
    enabled: !!sidoName,
    staleTime: AIR_QUALITY_STALE_TIME_MS,
    gcTime: AIR_QUALITY_GC_TIME_MS,
    retry: 1,
  });

  const data = useMemo(() => {
    if (!sidoName || !query.data) {
      return null;
    }

    const items = ensureAirQualityItems(query.data.response.body.items);
    const station = selectAirQualityStation(items, stationKeywords);
    return toAirQualitySummary(sidoName, station);
  }, [query.data, sidoName, stationKeywords]);

  const isSuccessfulEmptyResponse = query.isSuccess && data === null;
  const noData = {
    pm10: query.isSuccess && (isSuccessfulEmptyResponse || data?.pm10.value === null),
    pm25: query.isSuccess && (isSuccessfulEmptyResponse || data?.pm25.value === null),
  };

  return {
    data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    noData,
    error: query.isError ? appErrorMetaMap[APP_ERROR.AIR_QUALITY] : null,
  };
};
