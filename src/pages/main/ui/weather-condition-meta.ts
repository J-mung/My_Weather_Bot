import type { WeatherCondition } from "@/entities/weather/model/weather.types";
import type { IconName } from "@/shared/ui/icon";

/** 기상상태별 라벨 및 아이콘 */
export const weatherConditionMeta: Record<WeatherCondition, { label: string; icon: IconName }> = {
  sunny: {
    label: "Sunny",
    icon: "wbSunny",
  },
  mostlyCloudy: {
    label: "Mostly Cloudy",
    icon: "partlyCloudyDay",
  },
  unavailable: {
    label: "Unavailable",
    icon: "cloudAlert",
  },
  cloudy: {
    label: "Cloudy",
    icon: "cloud",
  },
  rain: {
    label: "Rain",
    icon: "rainy",
  },
  rainSnow: {
    label: "Rain / Snow",
    icon: "weatherMix",
  },
  snow: {
    label: "Snow",
    icon: "weatherSnowy",
  },
  drizzle: {
    label: "Drizzle",
    icon: "rainyLight",
  },
  drizzleSnow: {
    label: "Drizzle / Snow",
    icon: "weatherMix",
  },
  snowFlurry: {
    label: "Snow Flurry",
    icon: "snowing",
  },
};
