import type {
  CurrentWeatherNow,
  OutfitComfortLevel,
  OutfitRecommendation,
  WeatherPrecipitation,
} from "@/entities/weather/model/weather.types";
import {
  RECOMMENDATION_BY_LEVEL,
  UNAVAILABLE_RECOMMENDATION,
} from "./outfitRecommendation.constants";
import { getOutfitCautions } from "./outfitRecommendationCautions";

const getTemperatureLevel = (temperature: number): Exclude<OutfitComfortLevel, "unavailable"> => {
  if (temperature >= 28) return "hot";
  if (temperature >= 23) return "warm";
  if (temperature >= 20) return "mild";
  if (temperature >= 17) return "cool";
  if (temperature >= 12) return "chilly";
  if (temperature >= 5) return "cold";
  return "freezing";
};

const getBasis = (
  now: CurrentWeatherNow,
): Pick<OutfitRecommendation, "basisTemperature" | "basisSource"> => {
  if (typeof now.feelsLike === "number" && Number.isFinite(now.feelsLike)) {
    return { basisTemperature: now.feelsLike, basisSource: "feelsLike" };
  }

  if (typeof now.temperature === "number" && Number.isFinite(now.temperature)) {
    return { basisTemperature: now.temperature, basisSource: "temperature" };
  }

  return { basisTemperature: null, basisSource: "unavailable" };
};

export const getOutfitRecommendation = (
  now: CurrentWeatherNow,
  precipitation?: WeatherPrecipitation,
): OutfitRecommendation => {
  const basis = getBasis(now);

  if (basis.basisTemperature === null) {
    return UNAVAILABLE_RECOMMENDATION;
  }

  const level = getTemperatureLevel(basis.basisTemperature);
  const recommendation = RECOMMENDATION_BY_LEVEL[level];

  return {
    ...recommendation,
    cautions: getOutfitCautions(now, basis.basisTemperature, precipitation),
    basisTemperature: basis.basisTemperature,
    basisSource: basis.basisSource,
  };
};
