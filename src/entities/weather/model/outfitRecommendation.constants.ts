import type {
  OutfitComfortLevel,
  OutfitRecommendation,
  WeatherCondition,
} from "@/entities/weather/model/weather.types";

type TemperatureRecommendation = Pick<
  OutfitRecommendation,
  "level" | "title" | "summary" | "items"
>;

export const RECOMMENDATION_BY_LEVEL: Record<
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

export const UNAVAILABLE_RECOMMENDATION: OutfitRecommendation = {
  level: "unavailable",
  title: "날씨 정보를 확인한 뒤 추천할게요",
  summary: "추천을 계산할 온도 정보가 부족해요. 최신 날씨를 불러오면 옷차림을 제안할 수 있어요.",
  items: ["가벼운 겉옷", "날씨 확인 후 조절"],
  cautions: [],
  basisTemperature: null,
  basisSource: "unavailable",
};

export const RAIN_CONDITIONS = new Set<WeatherCondition>(["rain", "shower", "drizzle"]);
export const RAIN_SNOW_CONDITIONS = new Set<WeatherCondition>(["rainSnow", "drizzleSnow"]);
export const SNOW_CONDITIONS = new Set<WeatherCondition>(["snow", "snowFlurry"]);

export const HIGH_RAIN_PROBABILITY = 60;
export const NOTICEABLE_RAIN_AMOUNT_MM = 5;
export const NOTICEABLE_SNOW_AMOUNT_CM = 1;
