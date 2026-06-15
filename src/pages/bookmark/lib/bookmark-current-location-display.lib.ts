export const formatBookmarkCurrentTemperature = (value: number): string => `${Math.round(value)}°`;

export const formatBookmarkCurrentForecastTemperature = (value: number | null): string => {
  if (value === null) {
    return "--°";
  }

  return `${Math.round(value)}°`;
};

export const formatBookmarkCurrentTemperatureRange = (
  todayMax: number,
  todayMin: number,
): string =>
  `최고 ${formatBookmarkCurrentTemperature(todayMax)} · 최저 ${formatBookmarkCurrentTemperature(todayMin)}`;
