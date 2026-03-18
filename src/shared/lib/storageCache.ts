import type { CachedValue } from "./location.types";

/**
 * localStorage에서 캐싱 데이터 조회
 * @param key
 * @param ttlMs
 * @returns
 */
export const getStorageCache = <T>(key: string, ttlMs: number): T | null => {
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as CachedValue<T>;
    const isExpired = Date.now() - parsed.savedAt > ttlMs;

    if (isExpired) {
      localStorage.removeItem(key);
      return null;
    }

    return parsed.value;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
};

/**
 * localStorage에 캐싱 데이터 저장
 * @param key
 * @param value
 */
export const setStorageCache = <T>(key: string, value: T): void => {
  const payload: CachedValue<T> = {
    value,
    savedAt: Date.now(),
  };

  localStorage.setItem(key, JSON.stringify(payload));
};
