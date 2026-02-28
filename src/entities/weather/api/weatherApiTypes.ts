import type { WeatherFcstType, WeatherNowType } from "@/entities/weather/model/weatherTypes";

export type WeatherResponseMap = {
  ULTRA_NOW: WeatherNowType;
  SHORT_FORECAST: WeatherFcstType;
};

export const WeatherApiType = {
  ULTRA_NOW: "ULTRA_NOW",
  SHORT_FORECAST: "SHORT_FORECAST",
} as const;

export type WeatherApiType = (typeof WeatherApiType)[keyof typeof WeatherApiType];
