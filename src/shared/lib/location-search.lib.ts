import {
  DASH_REGEX,
  SEARCH_CANDIDATE_POOL_LIMIT,
  SEARCH_STRICT_MATCH_MIN_LENGTH,
  SPACE_REGEX,
} from "./location-search.constants";
import type {
  DistrictSearchEngine,
  DistrictSearchItem,
  DistrictSearchResult,
  SearchHighlightPart,
} from "./location.types";

/**
 * 검색 비교용 정규화
 *    - 공백/구분자 제거, 소문자 변환
 * @param value
 * @returns
 */
export const parseLocationText = (value: string): string => {
  return value.trim().replace(SPACE_REGEX, "").replace(DASH_REGEX, "").toLowerCase();
};

type SearchPriority = 0 | 1 | 2 | 3;

/**
 * 정규화된 검색어와 후보 문자열 간의 우선순위를 계산한다.
 * - exact > prefix > contains > fuzzy fallback
 * @param candidate 검색 후보
 * @param parsedInput 정규화된 검색어
 * @returns 우선순위 값
 */
const getSearchPriority = (candidate: DistrictSearchItem, parsedInput: string): SearchPriority => {
  if (candidate.parsed === parsedInput) {
    return 0;
  }

  if (candidate.parsed.startsWith(parsedInput)) {
    return 1;
  }

  if (candidate.parsed.includes(parsedInput)) {
    return 2;
  }

  return 3;
};

/**
 * 긴 검색어 입력에서는 exact/prefix/contains 기준으로 후보를 한 번 더 좁힌다.
 * @param results Fuse 검색 결과
 * @param parsedInput 정규화된 검색어
 * @returns 후처리된 검색 결과
 */
const applyStrictSearchFilter = (
  results: DistrictSearchResult[],
  parsedInput: string,
): DistrictSearchResult[] => {
  if (parsedInput.length < SEARCH_STRICT_MATCH_MIN_LENGTH) {
    return results;
  }

  const narrowedResults = results.filter(
    (_result) => getSearchPriority(_result.item, parsedInput) < 3,
  );

  return narrowedResults.length > 0 ? narrowedResults : results;
};

/**
 * exact/prefix/contains 우선순위와 Fuse score 기준으로 정렬한다.
 * @param results 검색 결과
 * @param parsedInput 정규화된 검색어
 * @returns 정렬된 검색 결과
 */
const sortSearchResults = (
  results: DistrictSearchResult[],
  parsedInput: string,
): DistrictSearchResult[] => {
  return [...results].sort((a, b) => {
    const priorityDiff =
      getSearchPriority(a.item, parsedInput) - getSearchPriority(b.item, parsedInput);

    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    return (a.score ?? Number.POSITIVE_INFINITY) - (b.score ?? Number.POSITIVE_INFINITY);
  });
};

/**
 * Fuse 검색용 지역 목록 생성
 *    - 좌표 데이터 없이 지역명 문자열만으로 인덱스를 구성
 * @returns
 */
export const buildDistrictSearchIndex = (districts: string[]): DistrictSearchItem[] => {
  return districts.map((_district) => {
    const separates = _district.split("-").filter(Boolean);

    return {
      fullName: _district,
      displayName: separates.join(" "),
      separates,
      parsed: parseLocationText(_district),
    };
  });
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
): DistrictSearchResult[] => {
  const parsedInput = parseLocationText(input);

  if (!parsedInput) {
    return [];
  }

  const fuseResults = engine.fuse.search(parsedInput, {
    limit: Math.max(limit, SEARCH_CANDIDATE_POOL_LIMIT),
  });

  const mappedResults = fuseResults.map((_result) => ({
    item: _result.item,
    matches: _result.matches,
    score: _result.score,
  }));

  const narrowedResults = applyStrictSearchFilter(mappedResults, parsedInput);
  return sortSearchResults(narrowedResults, parsedInput).slice(0, limit);
};

/**
 * UI 표시용
 * @param item
 * @returns
 */
export const toDisplayDistrictName = (item: DistrictSearchItem): string => {
  return item.displayName;
};

/**
 * 화면 표시 문자열 기준으로 검색어 일치 구간을 분리한다.
 * - 후보 선정은 Fuse가 담당
 * - 하이라이트는 사용자가 입력한 문자열을 기준으로 직관적으로 표현
 * @param displayName 화면에 렌더링할 문자열
 * @param query 사용자가 입력한 검색어
 * @returns 하이라이트 여부가 포함된 문자열 조각 목록
 */
export const buildDisplayHighlightParts = (
  displayName: string,
  query: string,
): SearchHighlightPart[] => {
  const normalizedQuery = query.trim().replace(SPACE_REGEX, " ");

  if (!normalizedQuery) {
    return [{ text: displayName, matched: false }];
  }

  const lowerDisplayName = displayName.toLowerCase();
  const lowerQuery = normalizedQuery.toLowerCase();
  const parts: SearchHighlightPart[] = [];

  let cursor = 0;
  let matchIndex = lowerDisplayName.indexOf(lowerQuery, cursor);

  while (matchIndex !== -1) {
    if (cursor < matchIndex) {
      parts.push({
        text: displayName.slice(cursor, matchIndex),
        matched: false,
      });
    }

    const matchEnd = matchIndex + normalizedQuery.length;
    parts.push({
      text: displayName.slice(matchIndex, matchEnd),
      matched: true,
    });

    cursor = matchEnd;
    matchIndex = lowerDisplayName.indexOf(lowerQuery, cursor);
  }

  if (cursor < displayName.length) {
    parts.push({
      text: displayName.slice(cursor),
      matched: false,
    });
  }

  return parts.length > 0 ? parts : [{ text: displayName, matched: false }];
};
