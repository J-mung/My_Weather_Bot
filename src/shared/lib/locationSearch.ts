import districtsJson from "@/shared/lib/korea_districts.json";
import Fuse from "fuse.js";
import type { DistrictSearchEngine, DistrictSearchItem } from "./location.types";

const typedDistricts = districtsJson as string[];

export const SPACE_REGEX = /\s+/g;
const DASH_REGEX = /-/g;

/**
 * 검색 비교용 정규화
 *    - 공백/구분자 제거, 소문자 변환
 * @param value
 * @returns
 */
export const parseLocationText = (value: string): string => {
  return value.trim().replace(SPACE_REGEX, "").replace(DASH_REGEX, "").toLowerCase();
};

/**
 * Fuse 검색용 지역 목록 생성
 *    - 좌표 데이터 없이 지역명 문자열만으로 인덱스를 구성
 * @returns
 */
export const buildDistrictSearchIndex = (): DistrictSearchItem[] => {
  return typedDistricts.map((_district) => {
    const separates = _district.split("-").filter(Boolean);

    return {
      fullName: _district,
      separates,
      parsed: parseLocationText(_district),
    };
  });
};

/**
 * Fuse 검색 엔진 생성
 * @returns
 */
export const createDistrictSearchEngine = (): DistrictSearchEngine => {
  const items = buildDistrictSearchIndex();

  const fuse = new Fuse(items, {
    includeScore: true,
    threshold: 0.28,
    ignoreLocation: true,
    minMatchCharLength: 2,
    keys: [
      { name: "fullName", weight: 0.5 },
      { name: "parsed", weight: 0.3 },
      { name: "separates", weight: 0.2 },
    ] satisfies ReadonlyArray<{
      name: keyof DistrictSearchItem;
      weight: number;
    }>,
  });

  return { items, fuse };
};

/**
 * Fuse 기반 지역 검색
 * @param input
 * @param engine
 * @param limit
 * @returns
 */
export const searchDistricts = (
  input: string,
  engine: DistrictSearchEngine,
  limit = 20,
): DistrictSearchItem[] => {
  const parsedInput = parseLocationText(input);

  if (!parsedInput) {
    return [];
  }

  return engine.fuse.search(parsedInput, { limit }).map((_result) => _result.item);
};

/**
 * UI 표시용
 * @param item
 * @returns
 */
export const toDisplayDistrictName = (item: DistrictSearchItem): string => {
  return item.separates.join(" ");
};
