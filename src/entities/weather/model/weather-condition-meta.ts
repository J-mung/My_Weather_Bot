import type { WeatherCondition } from "@/entities/weather/model/weather.types";
import type { IconName } from "@/shared/ui/icon";

type WeatherConditionMeta = {
  label: string;
  icon: IconName;
  iconClassName: string;
};

/** 기상상태별 라벨 및 아이콘 */
export const weatherConditionMeta: Record<WeatherCondition, WeatherConditionMeta> = {
  sunny: {
    label: "Sunny",
    icon: "wbSunny",
    iconClassName: "text-[var(--weather-icon-sunny)] md:text-[var(--weather-icon-sunny)]",
  },
  mostlyCloudy: {
    label: "Mostly Cloudy",
    icon: "partlyCloudyDay",
    iconClassName:
      "text-[var(--weather-icon-mostly-cloudy)] md:text-[var(--weather-icon-mostly-cloudy)]",
  },
  unavailable: {
    label: "Unavailable",
    icon: "cloudAlert",
    iconClassName:
      "text-[var(--weather-icon-unavailable)] md:text-[var(--weather-icon-unavailable)]",
  },
  cloudy: {
    label: "Cloudy",
    icon: "cloud",
    iconClassName: "text-[var(--weather-icon-cloudy)] md:text-[var(--weather-icon-cloudy)]",
  },
  rain: {
    label: "Rain",
    icon: "rainy",
    iconClassName: "text-[var(--weather-icon-rain)] md:text-[var(--weather-icon-rain)]",
  },
  rainSnow: {
    label: "Rain / Snow",
    icon: "weatherMix",
    iconClassName: "text-[var(--weather-icon-rain-snow)] md:text-[var(--weather-icon-rain-snow)]",
  },
  snow: {
    label: "Snow",
    icon: "weatherSnowy",
    iconClassName: "text-[var(--weather-icon-snow)] md:text-[var(--weather-icon-snow)]",
  },
  drizzle: {
    label: "Drizzle",
    icon: "rainyLight",
    iconClassName: "text-[var(--weather-icon-drizzle)] md:text-[var(--weather-icon-drizzle)]",
  },
  drizzleSnow: {
    label: "Drizzle / Snow",
    icon: "weatherMix",
    iconClassName: "text-[var(--weather-icon-rain-snow)] md:text-[var(--weather-icon-rain-snow)]",
  },
  snowFlurry: {
    label: "Snow Flurry",
    icon: "snowing",
    iconClassName: "text-[var(--weather-icon-snow)] md:text-[var(--weather-icon-snow)]",
  },
};
