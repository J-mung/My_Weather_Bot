import type { SummaryDomain } from "@/entities/weather/model/weather.types";

export interface NowInfoCardProps {
  district: string; // 위치명
  data: SummaryDomain | null;
  isFetching: boolean;
  error: Error | null;
}
