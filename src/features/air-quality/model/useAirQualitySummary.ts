import { fetchAirQualityBySido } from "@/entities/air-quality/api/fetchAirQualityBySido";
import {
  ensureAirQualityItems,
  resolveDistrictStationKeyword,
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
} => {
  const sidoName = useMemo(() => resolveSidoName(district), [district]);
  const stationKeyword = useMemo(() => resolveDistrictStationKeyword(district), [district]);

  const query = useQuery({
    queryKey: ["air-quality", sidoName, stationKeyword],
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
    const station = selectAirQualityStation(items, stationKeyword);
    return toAirQualitySummary(sidoName, station);
  }, [query.data, sidoName, stationKeyword]);

  return {
    data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
  };
};
