import { WeatherApiType } from "@/entities/weather/api/weather-api.constants";
import type { WeatherApiType as WeatherApiTypeValue } from "@/entities/weather/api/weather-api.types";

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

export const WEATHER_QUERY_ROOT_KEY = "weather" as const;

export const WEATHER_QUERY_PERSIST_MAX_AGE_MS = 4 * HOUR;

export const WEATHER_QUERY_POLICY: Record<
  WeatherApiTypeValue,
  {
    staleTimeMs: number;
    gcTimeMs: number;
  }
> = {
  [WeatherApiType.ULTRA_NOW]: {
    staleTimeMs: 20 * MINUTE,
    gcTimeMs: 2 * HOUR,
  },
  [WeatherApiType.ULTRA_FORECAST]: {
    staleTimeMs: 30 * MINUTE,
    gcTimeMs: 2 * HOUR,
  },
  [WeatherApiType.SHORT_FORECAST]: {
    staleTimeMs: 2 * HOUR,
    gcTimeMs: 4 * HOUR,
  },
  [WeatherApiType.TODAY_TEMP_RANGE]: {
    staleTimeMs: 4 * HOUR,
    gcTimeMs: 8 * HOUR,
  },
};
