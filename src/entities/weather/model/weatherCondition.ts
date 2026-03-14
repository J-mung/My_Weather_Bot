import type { WeatherCondition } from "./weather.types";

/**
 * 하늘상태(SKY) 코드값을 WeatherCondition으로 매핑
 * @param sky
 * @returns
 */
export const mapSkyToCondition = (sky: number): WeatherCondition => {
  switch (sky) {
    case 1:
      return "sunny";
    case 3:
      return "mostlyCloudy";
    case 4:
      return "cloudy";
    default:
      return "unavailable";
  }
};

/**
 * 강수형태(PTY) 코드값을 WeatherCondition으로 매핑
 * @param pty
 * @returns
 */
export const mapPtyToCondition = (pty: number): WeatherCondition => {
  switch (pty) {
    case 1:
      return "rain";
    case 2:
      return "rainSnow";
    case 3:
      return "snow";
    case 5:
      return "drizzle";
    case 6:
      return "drizzleSnow";
    case 7:
      return "snowFlurry";
    default:
      return "unavailable";
  }
};
