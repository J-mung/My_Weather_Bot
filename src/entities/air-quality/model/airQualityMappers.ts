import type { AirQualityStationItemType } from "@/entities/air-quality/api/air-quality-api.types";
import type {
  AirQualityGrade,
  AirQualityStationSelectionReason,
  AirQualitySummary,
} from "./air-quality.types";

const SIDO_NAME_MAP: Record<string, string> = {
  서울특별시: "서울",
  부산광역시: "부산",
  대구광역시: "대구",
  인천광역시: "인천",
  광주광역시: "광주",
  대전광역시: "대전",
  울산광역시: "울산",
  세종특별자치시: "세종",
  경기도: "경기",
  강원특별자치도: "강원",
  강원도: "강원",
  충청북도: "충북",
  충청남도: "충남",
  전북특별자치도: "전북",
  전라북도: "전북",
  전라남도: "전남",
  경상북도: "경북",
  경상남도: "경남",
  제주특별자치도: "제주",
};

const AIR_QUALITY_GRADE_MAP: Record<string, AirQualityGrade> = {
  "1": "good",
  "2": "normal",
  "3": "bad",
  "4": "veryBad",
};

const toNullableNumber = (value: string | undefined): number | null => {
  if (!value || value === "-") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeToken = (token: string): string => token.trim().replace(/\s+/g, "");

const stripAdministrativeSuffix = (token: string): string => {
  const stripped = token.replace(/(특별시|광역시|특별자치시|특별자치도|자치시|자치도|시|군|구)$/, "");
  return stripped.length >= 2 ? stripped : token;
};

export const resolveSidoName = (district: string): string | null => {
  const normalizedDistrict = district.trim();

  if (!normalizedDistrict) {
    return null;
  }

  const firstToken = normalizedDistrict.split(/\s+/)[0];
  return (
    SIDO_NAME_MAP[firstToken] ?? firstToken.replace(/(특별시|광역시|특별자치시|특별자치도|도)$/, "")
  );
};

export const resolveDistrictStationKeywords = (district: string): string[] => {
  const tokens = district.trim().split(/\s+/).filter(Boolean);
  const [, ...districtTokens] = tokens;
  const keywords = new Set<string>();

  districtTokens
    .slice()
    .reverse()
    .forEach((token) => {
      const normalizedToken = normalizeToken(token);

      if (!normalizedToken || SIDO_NAME_MAP[normalizedToken]) {
        return;
      }

      keywords.add(normalizedToken);
      keywords.add(stripAdministrativeSuffix(normalizedToken));
    });

  return Array.from(keywords).filter(Boolean);
};

export const resolveDistrictStationKeyword = (district: string): string | null =>
  resolveDistrictStationKeywords(district)[0] ?? null;

const getGrade = (grade: string | undefined): AirQualityGrade =>
  grade ? (AIR_QUALITY_GRADE_MAP[grade] ?? "unavailable") : "unavailable";

const hasMeasuredValue = (item: AirQualityStationItemType): boolean =>
  toNullableNumber(item.pm10Value) !== null || toNullableNumber(item.pm25Value) !== null;

type StationMatch = {
  item: AirQualityStationItemType;
  keyword: string | null;
  reason: AirQualityStationSelectionReason;
  score: number;
};

export type SelectedAirQualityStation = {
  item: AirQualityStationItemType | null;
  matchedKeyword: string | null;
  selectionReason: AirQualityStationSelectionReason;
};

const scoreStationMatch = (
  item: AirQualityStationItemType,
  keywords: string[],
): StationMatch | null => {
  const stationName = normalizeToken(item.stationName ?? "");

  if (!stationName || keywords.length === 0) {
    return null;
  }

  return keywords.reduce<StationMatch | null>((best, keyword, index) => {
    if (!keyword) {
      return best;
    }

    const priorityOffset = keywords.length - index;
    let candidate: StationMatch | null = null;

    if (stationName === keyword) {
      candidate = { item, keyword, reason: "exact", score: 300 + priorityOffset };
    } else if (stationName.includes(keyword)) {
      candidate = { item, keyword, reason: "includes", score: 200 + priorityOffset };
    } else if (keyword.includes(stationName)) {
      candidate = { item, keyword, reason: "reverseIncludes", score: 100 + priorityOffset };
    }

    if (!candidate) {
      return best;
    }

    return !best || candidate.score > best.score ? candidate : best;
  }, null);
};

const findBestStationMatch = (
  items: AirQualityStationItemType[],
  keywords: string[],
): StationMatch | null =>
  items.reduce<StationMatch | null>((best, item) => {
    const candidate = scoreStationMatch(item, keywords);

    if (!candidate) {
      return best;
    }

    return !best || candidate.score > best.score ? candidate : best;
  }, null);

export const selectAirQualityStation = (
  items: AirQualityStationItemType[],
  stationKeywords: string | string[] | null,
): SelectedAirQualityStation => {
  if (!items.length) {
    return { item: null, matchedKeyword: null, selectionReason: "unavailable" };
  }

  const measuredItems = items.filter(hasMeasuredValue);
  const candidates = measuredItems.length ? measuredItems : items;
  const keywords = (
    Array.isArray(stationKeywords) ? stationKeywords : stationKeywords ? [stationKeywords] : []
  )
    .map(normalizeToken)
    .filter(Boolean);

  if (keywords.length === 0) {
    return {
      item: candidates[0] ?? null,
      matchedKeyword: null,
      selectionReason: candidates[0] ? "fallback" : "unavailable",
    };
  }

  const measuredMatch = findBestStationMatch(measuredItems, keywords);
  const anyMatch = measuredMatch ?? findBestStationMatch(items, keywords);

  if (anyMatch) {
    return {
      item: anyMatch.item,
      matchedKeyword: anyMatch.keyword,
      selectionReason: anyMatch.reason,
    };
  }

  return {
    item: candidates[0] ?? null,
    matchedKeyword: null,
    selectionReason: candidates[0] ? "fallback" : "unavailable",
  };
};

export const toAirQualitySummary = (
  sidoName: string,
  selectedStation: AirQualityStationItemType | SelectedAirQualityStation | null,
): AirQualitySummary => {
  const selection: SelectedAirQualityStation =
    selectedStation && "item" in selectedStation
      ? selectedStation
      : {
          item: selectedStation,
          matchedKeyword: null,
          selectionReason: selectedStation ? "fallback" : "unavailable",
        };
  const item = selection.item;

  return {
    sidoName,
    stationName: item?.stationName ?? null,
    dataTime: item?.dataTime ?? null,
    matchedKeyword: selection.matchedKeyword,
    selectionReason: selection.selectionReason,
    pm10: {
      value: toNullableNumber(item?.pm10Value),
      grade: getGrade(item?.pm10Grade),
      flag: item?.pm10Flag ?? null,
    },
    pm25: {
      value: toNullableNumber(item?.pm25Value),
      grade: getGrade(item?.pm25Grade),
      flag: item?.pm25Flag ?? null,
    },
  };
};

export const ensureAirQualityItems = (
  items:
    | { item: AirQualityStationItemType[] | AirQualityStationItemType }
    | AirQualityStationItemType[]
    | AirQualityStationItemType
    | undefined,
): AirQualityStationItemType[] => {
  if (!items) {
    return [];
  }

  if (Array.isArray(items)) {
    return items;
  }

  if ("item" in items) {
    return Array.isArray(items.item) ? items.item : [items.item];
  }

  return [items];
};
