export type WeatherConditionSource = "ultraNow" | "ultraForecast" | "shortForecast";
export type WeatherConditionCategory = "SKY" | "PTY";

export type UnknownWeatherConditionDiagnostic = {
  source: WeatherConditionSource;
  category: WeatherConditionCategory;
  rawValue: string | number | null | undefined;
  normalizedValue: number;
  baseDate?: string;
  baseTime?: string;
  fcstDate?: string;
  fcstTime?: string;
  fallbackCondition: "unavailable";
};

const isDevMode = (): boolean => {
  return typeof import.meta !== "undefined" && Boolean(import.meta.env?.DEV);
};

export const reportUnknownWeatherCondition = (
  diagnostic: UnknownWeatherConditionDiagnostic,
): void => {
  if (!isDevMode()) {
    return;
  }

  console.warn("[MyWeatherBot] Unknown weather condition code", diagnostic);
};
