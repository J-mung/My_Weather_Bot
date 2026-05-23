import type { AirQualityStationItemType } from "@/entities/air-quality/api/air-quality-api.types";
import type { AirQualityGrade, AirQualitySummary } from "./air-quality.types";

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

export const resolveDistrictStationKeyword = (district: string): string | null => {
  const tokens = district.trim().split(/\s+/).filter(Boolean);
  const stationCandidate = tokens.find((token) => /[시군구]$/.test(token) && !SIDO_NAME_MAP[token]);
  return stationCandidate ?? tokens[1] ?? null;
};

const getGrade = (grade: string | undefined): AirQualityGrade =>
  grade ? (AIR_QUALITY_GRADE_MAP[grade] ?? "unavailable") : "unavailable";

const hasMeasuredValue = (item: AirQualityStationItemType): boolean =>
  toNullableNumber(item.pm10Value) !== null || toNullableNumber(item.pm25Value) !== null;

export const selectAirQualityStation = (
  items: AirQualityStationItemType[],
  stationKeyword: string | null,
): AirQualityStationItemType | null => {
  if (!items.length) {
    return null;
  }

  const measuredItems = items.filter(hasMeasuredValue);
  const candidates = measuredItems.length ? measuredItems : items;

  if (!stationKeyword) {
    return candidates[0] ?? null;
  }

  const normalizedKeyword = stationKeyword.replace(/\s+/g, "");
  return (
    candidates.find((item) => item.stationName?.replace(/\s+/g, "").includes(normalizedKeyword)) ??
    candidates.find((item) =>
      normalizedKeyword.includes(item.stationName?.replace(/\s+/g, "") ?? ""),
    ) ??
    candidates[0] ??
    null
  );
};

export const toAirQualitySummary = (
  sidoName: string,
  item: AirQualityStationItemType | null,
): AirQualitySummary => ({
  sidoName,
  stationName: item?.stationName ?? null,
  dataTime: item?.dataTime ?? null,
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
});

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
