import type { SummaryDomain } from "@/entities/weather/model/weather.types";
import type { AppError } from "@/shared/api/types";
import type { IconName } from "@/shared/ui/icon";

export interface HourlyInfoCardProps {
  data: SummaryDomain | null;
  isLoading: boolean;
  isFetching: boolean;
  error: AppError | null;
  refresh: () => Promise<void>;
}

export interface NowInfoCardProps {
  primaryDistrict: string;
  secondaryDistrict: string;
  fullDistrict: string;
  isAlias: boolean;
  data: SummaryDomain | null;
  isLoading: boolean;
  isFetching: boolean;
  error: AppError | null;
  refresh: () => Promise<void>;
}

export type DetailWeatherItem = {
  icon: IconName;
  label: "HIGH" | "LOW" | "HUMIDITY";
  value: number | null;
};

/**
 * NowInfoCard의 제목
 */
export type DistrictDisplay = {
  primary: string;
  secondary?: string;
  isAlias: boolean;
};
