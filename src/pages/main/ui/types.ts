import type { SummaryDomain } from "@/entities/weather/model/weather.types";
import type { IconName } from "@/shared/ui/icon";

export interface NowInfoCardProps {
  district: string; // 위치명
  data: SummaryDomain | null;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export type DetailWeatherItem = {
  icon: IconName;
  label: "HIGH" | "LOW" | "HUMIDITY";
  value: number | null;
};
