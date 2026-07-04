import type { RiseSetInfoItemType } from "@/entities/sun/api/rise-set-api.types";

const KOREA_TIME_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MINUTES = 24 * 60;

const SPECIAL_CITY_LOCATION_MAP: Record<string, string> = {
  서울특별시: "서울",
  서울: "서울",
  부산광역시: "부산",
  부산: "부산",
  대구광역시: "대구",
  대구: "대구",
  인천광역시: "인천",
  인천: "인천",
  광주광역시: "광주",
  광주: "광주",
  대전광역시: "대전",
  대전: "대전",
  울산광역시: "울산",
  울산: "울산",
  세종특별자치시: "세종",
  세종: "세종",
  제주특별자치도: "제주",
  제주도: "제주",
  제주: "제주",
};

const PROVINCE_REPRESENTATIVE_LOCATION_MAP: Record<string, string> = {
  경기도: "수원",
  강원특별자치도: "춘천",
  강원도: "춘천",
  충청북도: "청주",
  충청남도: "홍성",
  전북특별자치도: "전주",
  전라북도: "전주",
  전라남도: "목포",
  경상북도: "안동",
  경상남도: "창원",
};

export interface RiseSetSummary {
  location: string;
  locdate: string;
  sunriseText: string;
  sunsetText: string;
  sunriseMinutes: number;
  sunsetMinutes: number;
  dayLengthMinutes: number;
  dayLengthText: string;
}

export const getKoreaTodayLocdate = (date: Date = new Date()): string => {
  const koreaDate = new Date(date.getTime() + KOREA_TIME_OFFSET_MS);
  return [
    String(koreaDate.getUTCFullYear()),
    String(koreaDate.getUTCMonth() + 1).padStart(2, "0"),
    String(koreaDate.getUTCDate()).padStart(2, "0"),
  ].join("");
};

export const normalizeRiseSetLocation = (district: string): string => {
  const tokens = district.trim().split(/\s+/).filter(Boolean);

  if (tokens.length === 0) {
    return "";
  }

  const [firstToken] = tokens;
  const cityMatch = SPECIAL_CITY_LOCATION_MAP[firstToken];
  if (cityMatch) {
    return cityMatch;
  }

  const provinceMatch = PROVINCE_REPRESENTATIVE_LOCATION_MAP[firstToken];
  if (provinceMatch) {
    return provinceMatch;
  }

  return firstToken.replace(/특별시|광역시|특별자치시|특별자치도|자치도|도|시|군|구$/g, "");
};

const formatRiseSetApiValue = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
};

export const parseRiseSetTimeToMinutes = (
  time: string | number | null | undefined,
): number | null => {
  if (time === null || time === undefined) {
    return null;
  }

  const trimmed = String(time).trim();
  if (!trimmed) {
    return null;
  }

  const normalized = trimmed.padStart(4, "0");
  if (!/^\d{4}$/.test(normalized)) {
    return null;
  }

  const hours = Number(normalized.slice(0, 2));
  const minutes = Number(normalized.slice(2, 4));

  if (hours > 23 || minutes > 59) {
    return null;
  }

  return hours * 60 + minutes;
};

export const formatRiseSetMinutes = (minutes: number | null): string => {
  if (minutes === null) {
    return "--:--";
  }

  const normalizedMinutes = ((minutes % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;
  const hours = Math.floor(normalizedMinutes / 60);
  const minute = normalizedMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

export const formatDayLength = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;

  if (hours <= 0) {
    return `${restMinutes}분`;
  }

  if (restMinutes === 0) {
    return `${hours}시간`;
  }

  return `${hours}시간 ${restMinutes}분`;
};

export const mapRiseSetInfo = (item: RiseSetInfoItemType): RiseSetSummary | null => {
  const sunriseMinutes = parseRiseSetTimeToMinutes(item.sunrise);
  const sunsetMinutes = parseRiseSetTimeToMinutes(item.sunset);

  if (sunriseMinutes === null || sunsetMinutes === null || sunriseMinutes >= sunsetMinutes) {
    return null;
  }

  const dayLengthMinutes = sunsetMinutes - sunriseMinutes;

  return {
    location: formatRiseSetApiValue(item.location ?? item.locatioan),
    locdate: formatRiseSetApiValue(item.locdate),
    sunriseText: formatRiseSetMinutes(sunriseMinutes),
    sunsetText: formatRiseSetMinutes(sunsetMinutes),
    sunriseMinutes,
    sunsetMinutes,
    dayLengthMinutes,
    dayLengthText: formatDayLength(dayLengthMinutes),
  };
};
