import districtDataUrl from "@/shared/lib/korea_districts.json?url";

export const SPACE_REGEX = /\s+/g;
export const DASH_REGEX = /-/g;

/**
 * Fuse 결과 후처리를 더 엄격하게 적용할 최소 검색어 길이
 */
export const SEARCH_STRICT_MATCH_MIN_LENGTH = 5;

/**
 * Fuse 검색 시 후처리 후보군 확보를 위한 내부 검색 개수
 */
export const SEARCH_CANDIDATE_POOL_LIMIT = 50;

let districtListPromise: Promise<string[]> | null = null;

const isDistrictList = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
};

export const loadDistrictList = async (): Promise<string[]> => {
  districtListPromise ??= fetch(districtDataUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load district search data");
      }

      return response.json() as Promise<unknown>;
    })
    .then((data) => {
      if (!isDistrictList(data)) {
        throw new Error("Invalid district search data");
      }

      return data;
    });

  return districtListPromise;
};
