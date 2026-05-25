export const getAirQualityDisplayDistrict = (fullDistrict: string): string => {
  const tokens = fullDistrict.trim().split(/\s+/).filter(Boolean);
  return (tokens.at(-1) ?? fullDistrict) || "선택 지역";
};
