import type { WeatherCondition } from "./weather.types";
import {
  reportUnknownWeatherCondition,
  type UnknownWeatherConditionDiagnostic,
} from "./weatherConditionDiagnostics";

export type WeatherConditionDiagnosticContext = Omit<
  UnknownWeatherConditionDiagnostic,
  "category" | "normalizedValue" | "fallbackCondition"
>;

/**
 * 하늘상태(SKY) 코드값을 WeatherCondition으로 매핑
 * @param sky
 * @returns
 */
export const mapSkyToCondition = (
  sky: number,
  diagnosticContext?: WeatherConditionDiagnosticContext,
): WeatherCondition => {
  switch (sky) {
    case 1:
      return "sunny";
    case 2:
      return "partlyCloudy";
    case 3:
      return "mostlyCloudy";
    case 4:
      return "cloudy";
    default:
      if (diagnosticContext) {
        reportUnknownWeatherCondition({
          ...diagnosticContext,
          category: "SKY",
          normalizedValue: sky,
          fallbackCondition: "unavailable",
        });
      }
      return "unavailable";
  }
};

/**
 * 강수형태(PTY) 코드값을 WeatherCondition으로 매핑
 * @param pty
 * @returns
 */
export const mapPtyToCondition = (
  pty: number,
  diagnosticContext?: WeatherConditionDiagnosticContext,
): WeatherCondition => {
  switch (pty) {
    case 1:
      return "rain";
    case 2:
      return "rainSnow";
    case 3:
      return "snow";
    case 4:
      return "shower";
    case 5:
      return "drizzle";
    case 6:
      return "drizzleSnow";
    case 7:
      return "snowFlurry";
    default:
      if (diagnosticContext) {
        reportUnknownWeatherCondition({
          ...diagnosticContext,
          category: "PTY",
          normalizedValue: pty,
          fallbackCondition: "unavailable",
        });
      }
      return "unavailable";
  }
};
