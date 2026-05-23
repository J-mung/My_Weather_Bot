import type {
  CurrentWeatherNow,
  OutfitComfortLevel,
  OutfitRecommendation,
  WeatherCondition,
} from "@/entities/weather/model/weather.types";

type TemperatureRecommendation = Pick<
  OutfitRecommendation,
  "level" | "title" | "summary" | "items"
>;

const RECOMMENDATION_BY_LEVEL: Record<
  Exclude<OutfitComfortLevel, "unavailable">,
  TemperatureRecommendation
> = {
  hot: {
    level: "hot",
    title: "통풍이 잘되는 시원한 차림",
    summary: "체감 온도가 높아요. 땀이 빠르게 마르는 얇고 밝은 옷을 추천해요.",
    items: ["반팔", "얇은 셔츠", "반바지", "통기성 좋은 옷"],
  },
  warm: {
    level: "warm",
    title: "가볍고 산뜻한 차림",
    summary: "따뜻한 날씨라 가벼운 상의와 편한 하의만으로도 충분해요.",
    items: ["반팔", "얇은 긴팔", "가벼운 하의"],
  },
  mild: {
    level: "mild",
    title: "얇은 겉옷을 더한 차림",
    summary: "활동하기 좋은 온도예요. 실내외 온도 차에 대비해 얇은 겉옷을 챙겨요.",
    items: ["얇은 긴팔", "셔츠", "가벼운 가디건"],
  },
  cool: {
    level: "cool",
    title: "선선함에 대비한 긴팔 차림",
    summary: "바람이 불면 서늘할 수 있어요. 긴팔과 얇은 자켓 조합이 좋아요.",
    items: ["긴팔", "맨투맨", "얇은 자켓"],
  },
  chilly: {
    level: "chilly",
    title: "자켓이 필요한 쌀쌀한 차림",
    summary: "쌀쌀함이 느껴지는 날씨예요. 보온감 있는 상의와 겉옷을 추천해요.",
    items: ["니트", "후드", "자켓", "가벼운 코트"],
  },
  cold: {
    level: "cold",
    title: "든든한 겉옷 중심의 차림",
    summary: "추위를 느끼기 쉬운 날씨예요. 두꺼운 상의와 코트류로 체온을 지켜요.",
    items: ["코트", "패딩 조끼", "두꺼운 니트"],
  },
  freezing: {
    level: "freezing",
    title: "방한용품까지 챙기는 한파 차림",
    summary: "매우 추운 날씨예요. 두꺼운 외투와 보온 소품을 함께 챙겨요.",
    items: ["두꺼운 패딩", "목도리", "장갑", "보온 이너"],
  },
};

const UNAVAILABLE_RECOMMENDATION: OutfitRecommendation = {
  level: "unavailable",
  title: "날씨 정보를 확인한 뒤 추천할게요",
  summary: "추천을 계산할 온도 정보가 부족해요. 최신 날씨를 불러오면 옷차림을 제안할 수 있어요.",
  items: ["가벼운 겉옷", "날씨 확인 후 조절"],
  cautions: [],
  basisTemperature: null,
  basisSource: "unavailable",
};

const RAIN_CONDITIONS = new Set<WeatherCondition>(["rain", "drizzle"]);
const RAIN_SNOW_CONDITIONS = new Set<WeatherCondition>(["rainSnow", "drizzleSnow"]);
const SNOW_CONDITIONS = new Set<WeatherCondition>(["snow", "snowFlurry"]);

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

const getCautions = (now: CurrentWeatherNow, basisTemperature: number): string[] => {
  const cautions: string[] = [];

  if (RAIN_CONDITIONS.has(now.condition)) {
    cautions.push("우산을 챙기고 방수 신발이나 젖어도 부담 없는 겉옷을 추천해요.");
  }

  if (RAIN_SNOW_CONDITIONS.has(now.condition)) {
    cautions.push("우산과 미끄럼 방지 신발, 방수 외투를 함께 준비해요.");
  }

  if (SNOW_CONDITIONS.has(now.condition)) {
    cautions.push("미끄럼 방지 신발과 장갑, 보온성 높은 외투를 챙겨요.");
  }

  if (typeof now.windSpeedMs === "number" && now.windSpeedMs >= 7) {
    cautions.push("바람이 강해요. 바람막이나 고정력 있는 겉옷이 좋아요.");
  }

  if (
    typeof now.humidity === "number" &&
    typeof now.temperature === "number" &&
    now.humidity >= 75 &&
    now.temperature >= 24
  ) {
    cautions.push("습하고 더워요. 통기성 좋은 소재와 여벌 상의를 준비해요.");
  }

  if (basisTemperature <= 0) {
    cautions.push("영하권 추위에 대비해 장갑, 목도리, 귀마개 같은 방한 소품을 챙겨요.");
  }

  return Array.from(new Set(cautions));
};

export const getOutfitRecommendation = (now: CurrentWeatherNow): OutfitRecommendation => {
  const basis = getBasis(now);

  if (basis.basisTemperature === null) {
    return UNAVAILABLE_RECOMMENDATION;
  }

  const level = getTemperatureLevel(basis.basisTemperature);
  const recommendation = RECOMMENDATION_BY_LEVEL[level];

  return {
    ...recommendation,
    cautions: getCautions(now, basis.basisTemperature),
    basisTemperature: basis.basisTemperature,
    basisSource: basis.basisSource,
  };
};
