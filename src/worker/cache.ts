type CacheStorageWithDefault = CacheStorage & { default?: Cache };

export const getDefaultWorkerCache = (): Cache | null => {
  const workerCaches = globalThis.caches as CacheStorageWithDefault | undefined;
  return workerCaches?.default ?? null;
};
