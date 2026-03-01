export interface DistrictSearchItem {
  fullName: string; // 서울특별시-종로구-청운동 (json 조회 key)
  separates: string[]; // ["서울특별시", "종로구", "청운동"]
  parsed: string; // 서울특별시총로구청운동 (추가 지원 검색 유형 - 참고 "도로명주소" 검색)
}

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
 * 검색 비교용 정규화 리스트 반환
 * @param districtNames
 */
export const buildDistrictSearchIndex = (districtNames: string[]): DistrictSearchItem[] => {
  return districtNames.map((_fullName) => ({
    fullName: _fullName,
    separates: _fullName.split("-").filter(Boolean),
    parsed: parseLocationText(_fullName),
  }));
};

/**
 * 검색 일치율에 따라서 점수 부여
 * @param search
 * @param parsedInput
 * @returns
 */
const getMatchingRate = (search: DistrictSearchItem, parsedInput: string): number => {
  const firstSeprate = search.separates[0] ?? ""; // 시/도
  const remainSeprate = search.separates[search.separates.length - 1] ?? "";

  // 1. 시/도 전체 혹은 접두어 일치 확인
  if (firstSeprate === parsedInput) return 0; // 시/도 전체 일치
  if (firstSeprate.startsWith(parsedInput)) return 1; // 시/도 접두어 일치

  // 2. 구/동 전체 혹은 접두어 일치 확인
  if (remainSeprate === parsedInput) return 2; // 동/구 일치
  if (remainSeprate.startsWith(parsedInput)) return 3; // 동/구 접두어 일치

  // 3. 전체 접두어 일치 확인
  if (search.parsed.startsWith(parsedInput)) return 4;

  // 4. 전체 일치 확인
  if (parsedInput.length >= 3 && search.parsed.includes(parsedInput)) return 5;

  return Number.POSITIVE_INFINITY;
};

/**
 * 일치율이 높은 지역으로 목록 반환 (최대 20개))
 * @param input
 * @param searchIndex
 * @param limit
 * @returns
 */
export const searchDistricts = (
  input: string,
  searchIndex: DistrictSearchItem[],
  limit = 20,
): DistrictSearchItem[] => {
  const parsedInput = parseLocationText(input);

  if (!parsedInput) return [];

  return searchIndex
    .map((_search) => ({
      search: _search,
      matchingRate: getMatchingRate(_search, parsedInput),
    }))
    .filter((_data) => Number.isFinite(_data.matchingRate))
    .sort((x, y) => {
      // 서로 다르므로 정렬
      if (x.matchingRate !== y.matchingRate) return x.matchingRate - y.matchingRate;

      // 동점의 경우 좀더 구체화 해서 정렬 (동 > 구 > 시도)
      const depthDiff = y.search.separates.length - x.search.separates.length;
      if (depthDiff !== 0) return depthDiff;

      // 행정구역별 정렬에 실패 했을 경우 fallback으로 json key로 길이 대조해서 정렬
      return x.search.fullName.length - y.search.fullName.length;
    })
    .slice(0, limit)
    .map((_data) => _data.search); // 일치율은 제거하고 데이터만 반환
};

/**
 * UI 표시용
 * @param item
 * @returns
 */
export const toDisplayDistrictName = (item: DistrictSearchItem): string => {
  return item.separates.join(" ");
};
