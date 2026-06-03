import Fuse from "fuse.js";
import { loadDistrictList } from "./location-search.constants";
import { buildDistrictSearchIndex } from "./location-search.lib";
import type { DistrictSearchEngine, DistrictSearchItem } from "./location.types";

/**
 * Fuse 검색 엔진 생성
 * @returns
 */
export const createDistrictSearchEngine = async (): Promise<DistrictSearchEngine> => {
  const districts = await loadDistrictList();
  const items = buildDistrictSearchIndex(districts);

  const fuse = new Fuse(items, {
    includeScore: true,
    includeMatches: true,
    threshold: 0.28,
    ignoreLocation: true,
    minMatchCharLength: 2,
    keys: [
      { name: "displayName", weight: 0.5 },
      { name: "parsed", weight: 0.3 },
      { name: "separates", weight: 0.2 },
    ] satisfies ReadonlyArray<{
      name: keyof DistrictSearchItem;
      weight: number;
    }>,
  });

  return { items, fuse };
};
