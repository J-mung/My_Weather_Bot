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
    label: "맑음",
    icon: "wbSunny",
    iconClassName: "text-[var(--weather-icon-sunny)] md:text-[var(--weather-icon-sunny)]",
  },
  partlyCloudy: {
    label: "구름 조금",
    icon: "partlyCloudyDay",
    iconClassName:
      "text-[var(--weather-icon-mostly-cloudy)] md:text-[var(--weather-icon-mostly-cloudy)]",
  },
  mostlyCloudy: {
    label: "구름많음",
    icon: "partlyCloudyDay",
    iconClassName:
      "text-[var(--weather-icon-mostly-cloudy)] md:text-[var(--weather-icon-mostly-cloudy)]",
  },
  unavailable: {
    label: "확인 중",
    icon: "cloudAlert",
    iconClassName:
      "text-[var(--weather-icon-unavailable)] md:text-[var(--weather-icon-unavailable)]",
  },
  cloudy: {
    label: "흐림",
    icon: "cloud",
    iconClassName: "text-[var(--weather-icon-cloudy)] md:text-[var(--weather-icon-cloudy)]",
  },
  rain: {
    label: "비",
    icon: "rainy",
    iconClassName: "text-[var(--weather-icon-rain)] md:text-[var(--weather-icon-rain)]",
  },
  shower: {
    label: "소나기",
    icon: "rainy",
    iconClassName: "text-[var(--weather-icon-rain)] md:text-[var(--weather-icon-rain)]",
  },
  rainSnow: {
    label: "비/눈",
    icon: "weatherMix",
    iconClassName: "text-[var(--weather-icon-rain-snow)] md:text-[var(--weather-icon-rain-snow)]",
  },
  snow: {
    label: "눈",
    icon: "weatherSnowy",
    iconClassName: "text-[var(--weather-icon-snow)] md:text-[var(--weather-icon-snow)]",
  },
  drizzle: {
    label: "약한 비",
    icon: "rainyLight",
    iconClassName: "text-[var(--weather-icon-drizzle)] md:text-[var(--weather-icon-drizzle)]",
  },
  drizzleSnow: {
    label: "약한 비/눈",
    icon: "weatherMix",
    iconClassName: "text-[var(--weather-icon-rain-snow)] md:text-[var(--weather-icon-rain-snow)]",
  },
  snowFlurry: {
    label: "눈 날림",
    icon: "snowing",
    iconClassName: "text-[var(--weather-icon-snow)] md:text-[var(--weather-icon-snow)]",
  },
};
