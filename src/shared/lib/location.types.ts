import type Fuse from "fuse.js";
import type { FuseResultMatch } from "fuse.js";

/**
 * 검색 인덱스 원본 데이터
 */
export interface DistrictSearchItem {
  fullName: string; // 서울특별시-종로구-청운동 (json₩ 조회 key)
  displayName: string; // 서울특별시 종로구 청운동 (화면 표시/하이라이트 기준)
  separates: string[]; // ["서울특별시", "종로구", "청운동"]
  parsed: string; // 서울특별시총로구청운동 (추가 지원 검색 유형 - 참고 "도로명주소" 검색)
}

/**
 * Fuse 검색 결과와 원본 item을 함께 표현한 타입
 */
export interface DistrictSearchResult {
  item: DistrictSearchItem;
  matches: readonly FuseResultMatch[] | undefined;
  score: number | undefined;
}

/**
 * 검색어 하이라이트를 위해 분리한 문자열 조각
 */
export interface SearchHighlightPart {
  text: string;
  matched: boolean;
}

/**
 * 지역명 검색 엔진
 */
export interface DistrictSearchEngine {
  items: DistrictSearchItem[];
  fuse: Fuse<DistrictSearchItem>;
}

/**
 * TTL 기반 storage 캐시 엔트리
 */
export interface CachedValue<T> {
  value: T;
  savedAt: number;
}
