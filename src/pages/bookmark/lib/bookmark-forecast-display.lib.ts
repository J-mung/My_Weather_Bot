import { weatherConditionMeta } from "@/entities/weather/model/weather-condition-meta";
import type { WeatherCondition } from "@/entities/weather/model/weather.types";

const BOOKMARK_CONDITION_LABEL: Record<WeatherCondition, string> = {
  sunny: "맑음",
  mostlyCloudy: "구름 조금",
  cloudy: "흐림",
  rain: "비",
  rainSnow: "비/눈",
  snow: "눈",
  drizzle: "약한 비",
  drizzleSnow: "약한 비/눈",
  snowFlurry: "눈 날림",
  unavailable: "확인 중",
};

export const getBookmarkConditionDisplay = (condition: WeatherCondition) => ({
  ...weatherConditionMeta[condition],
  label: BOOKMARK_CONDITION_LABEL[condition],
});
