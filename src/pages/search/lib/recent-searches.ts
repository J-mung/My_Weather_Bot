import type { GridCoord } from "@/entities/weather/model/weather.types";

const RECENT_SEARCH_STORAGE_KEY = "weather_recent_searches";
const MAX_RECENT_SEARCHES = 5;

export interface RecentSearchItem extends GridCoord {
  displayName: string;
  fullName: string;
  searchedAt: string;
}

const isRecentSearchItem = (value: unknown): value is RecentSearchItem => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<RecentSearchItem>;

  return (
    typeof candidate.displayName === "string" &&
    typeof candidate.fullName === "string" &&
    typeof candidate.nx === "number" &&
    Number.isFinite(candidate.nx) &&
    typeof candidate.ny === "number" &&
    Number.isFinite(candidate.ny) &&
    typeof candidate.searchedAt === "string"
  );
};

export const readRecentSearches = (): RecentSearchItem[] => {
  try {
    const raw = localStorage.getItem(RECENT_SEARCH_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isRecentSearchItem).slice(0, MAX_RECENT_SEARCHES);
  } catch {
    return [];
  }
};

export const writeRecentSearch = (
  item: Omit<RecentSearchItem, "searchedAt">,
): RecentSearchItem[] => {
  const nextItem: RecentSearchItem = {
    ...item,
    searchedAt: new Date().toISOString(),
  };
  const nextList = [
    nextItem,
    ...readRecentSearches().filter((recent) => recent.fullName !== item.fullName),
  ].slice(0, MAX_RECENT_SEARCHES);

  localStorage.setItem(RECENT_SEARCH_STORAGE_KEY, JSON.stringify(nextList));
  return nextList;
};
