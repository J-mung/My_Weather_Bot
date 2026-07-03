import { fetchRiseSetInfo } from "@/entities/sun/api/fetchRiseSetInfo";
import {
  getKoreaTodayLocdate,
  normalizeRiseSetLocation,
  type RiseSetSummary,
} from "@/entities/sun/model/riseSetMappers";
import { useQuery } from "@tanstack/react-query";

const HOUR = 60 * 60 * 1000;

export const createSunriseSunsetQueryKey = (locdate: string, location: string) =>
  ["sunrise-sunset", locdate, location] as const;

export const useSunriseSunsetSummary = (
  district: string,
  options?: { enabled?: boolean },
): {
  data: RiseSetSummary | null;
  location: string;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
} => {
  const locdate = getKoreaTodayLocdate();
  const location = normalizeRiseSetLocation(district);
  const enabled = Boolean(location) && (options?.enabled ?? true);

  const query = useQuery({
    queryKey: createSunriseSunsetQueryKey(locdate, location),
    queryFn: () => fetchRiseSetInfo({ locdate, location }),
    enabled,
    staleTime: 12 * HOUR,
    gcTime: 24 * HOUR,
    retry: 1,
  });

  return {
    data: query.data ?? null,
    location,
    isLoading: enabled && query.isLoading,
    isFetching: enabled && query.isFetching,
    isError: query.isError,
  };
};
