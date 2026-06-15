export const formatFavoritePreviewTemperature = (value: number | null): string => {
  if (value === null) {
    return "--°";
  }

  return `${Math.round(value)}°`;
};

export const formatFavoritePreviewTemperatureRange = (todayMax: number, todayMin: number): string =>
  `최고 ${Math.round(todayMax)}° · 최저 ${Math.round(todayMin)}°`;
