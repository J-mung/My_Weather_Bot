import type {
  CurrentWeatherNow,
  WeatherCondition,
  WeatherPrecipitation,
} from "@/entities/weather/model/weather.types";
import {
  HIGH_RAIN_PROBABILITY,
  NOTICEABLE_RAIN_AMOUNT_MM,
  NOTICEABLE_SNOW_AMOUNT_CM,
  RAIN_CONDITIONS,
  RAIN_SNOW_CONDITIONS,
  SNOW_CONDITIONS,
} from "./outfitRecommendation.constants";

type CautionRuleContext = {
  now: CurrentWeatherNow;
  basisTemperature: number;
  precipitation?: WeatherPrecipitation;
};

type CautionRule = {
  id: string;
  applies: (context: CautionRuleContext) => boolean;
  message: (context: CautionRuleContext) => string | null;
};

const isCurrentRainCondition = (condition: WeatherCondition): boolean =>
  RAIN_CONDITIONS.has(condition) || RAIN_SNOW_CONDITIONS.has(condition);

const isLessThanAmountText = (text: string | null | undefined): boolean =>
  text?.includes("미만") ?? false;

const hasForecastRainAmount = (precipitation?: WeatherPrecipitation): boolean =>
  typeof precipitation?.rainAmountMm === "number" || !!precipitation?.rainAmountText;

const hasForecastSnowAmount = (precipitation?: WeatherPrecipitation): boolean =>
  typeof precipitation?.snowAmountCm === "number" || !!precipitation?.snowAmountText;

const getRainAmountCaution = (precipitation: WeatherPrecipitation): string | null => {
  if (!hasForecastRainAmount(precipitation)) {
    return null;
  }

  const rainAmountText = precipitation.rainAmountText ?? "비 예보";
  const rainAmountMm = precipitation.rainAmountMm;

  if (
    typeof rainAmountMm === "number" &&
    rainAmountMm >= NOTICEABLE_RAIN_AMOUNT_MM &&
    !isLessThanAmountText(precipitation.rainAmountText)
  ) {
    return `예상 강수량이 ${rainAmountText}예요. 방수 신발과 여분 양말을 챙기면 좋아요.`;
  }

  return `예상 강수량이 ${rainAmountText}예요. 젖어도 부담 없는 신발이 좋아요.`;
};

const getSnowAmountCaution = (precipitation: WeatherPrecipitation): string | null => {
  if (!hasForecastSnowAmount(precipitation)) {
    return null;
  }

  const snowAmountText = precipitation.snowAmountText ?? "눈 예보";
  const snowAmountCm = precipitation.snowAmountCm;

  if (
    typeof snowAmountCm === "number" &&
    snowAmountCm >= NOTICEABLE_SNOW_AMOUNT_CM &&
    !isLessThanAmountText(precipitation.snowAmountText)
  ) {
    return `예상 적설이 ${snowAmountText}예요. 보온을 유지하고 미끄럼 방지 신발을 우선해요.`;
  }

  return `예상 적설이 ${snowAmountText}예요. 미끄럼 방지 신발을 챙겨요.`;
};

const CAUTION_RULES: CautionRule[] = [
  {
    id: "current-rain",
    applies: ({ now }) => RAIN_CONDITIONS.has(now.condition),
    message: () => "우산을 챙기고 방수 신발이나 젖어도 부담 없는 겉옷을 추천해요.",
  },
  {
    id: "current-rain-snow",
    applies: ({ now }) => RAIN_SNOW_CONDITIONS.has(now.condition),
    message: () => "우산과 미끄럼 방지 신발, 방수 외투를 함께 준비해요.",
  },
  {
    id: "current-snow",
    applies: ({ now }) => SNOW_CONDITIONS.has(now.condition),
    message: () => "미끄럼 방지 신발과 장갑, 보온성 높은 외투를 챙겨요.",
  },
  {
    id: "forecast-high-rain-probability",
    applies: ({ now, precipitation }) =>
      typeof precipitation?.probability === "number" &&
      precipitation.probability >= HIGH_RAIN_PROBABILITY &&
      !isCurrentRainCondition(now.condition),
    message: ({ precipitation }) =>
      typeof precipitation?.probability === "number"
        ? `강수확률이 ${precipitation.probability}%예요. 접이식 우산이나 방수되는 겉옷을 준비해요.`
        : null,
  },
  {
    id: "forecast-rain-amount",
    applies: ({ precipitation }) => hasForecastRainAmount(precipitation),
    message: ({ precipitation }) =>
      precipitation ? getRainAmountCaution(precipitation) : null,
  },
  {
    id: "forecast-snow-amount",
    applies: ({ precipitation }) => hasForecastSnowAmount(precipitation),
    message: ({ precipitation }) =>
      precipitation ? getSnowAmountCaution(precipitation) : null,
  },
  {
    id: "strong-wind",
    applies: ({ now }) => typeof now.windSpeedMs === "number" && now.windSpeedMs >= 7,
    message: () => "바람이 강해요. 바람막이나 고정력 있는 겉옷이 좋아요.",
  },
  {
    id: "humid-heat",
    applies: ({ now }) =>
      typeof now.humidity === "number" &&
      typeof now.temperature === "number" &&
      now.humidity >= 75 &&
      now.temperature >= 24,
    message: () => "습하고 더워요. 통기성 좋은 소재와 여벌 상의를 준비해요.",
  },
  {
    id: "freezing-accessories",
    applies: ({ basisTemperature }) => basisTemperature <= 0,
    message: () => "영하권 추위에 대비해 장갑, 목도리, 귀마개 같은 방한 소품을 챙겨요.",
  },
];

export const getOutfitCautions = (
  now: CurrentWeatherNow,
  basisTemperature: number,
  precipitation?: WeatherPrecipitation,
): string[] => {
  const context: CautionRuleContext = { now, basisTemperature, precipitation };
  const cautions = CAUTION_RULES.filter((rule) => rule.applies(context))
    .map((rule) => rule.message(context))
    .filter((message): message is string => Boolean(message));

  return Array.from(new Set(cautions));
};
