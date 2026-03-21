import type { DistrictDisplay } from "./types";

export const buildDistrictDisplay = ({
  district,
  alias,
}: {
  district: string;
  alias: string;
}): DistrictDisplay => {
  const trimmedDistrict = district.trim();
  const trimmedAlias = alias.trim();

  const hasAlias = Boolean(trimmedAlias) && trimmedAlias !== trimmedDistrict;

  if (hasAlias) {
    return {
      primaryDistrict: trimmedAlias,
      secondaryDistrict: "",
      fullDistrict: trimmedAlias,
      isAlias: true,
    };
  }

  const tokens = trimmedDistrict.split(/\s+/).filter(Boolean);

  if (tokens.length <= 1) {
    const fallback = trimmedDistrict || "알 수 없음";

    return {
      primaryDistrict: fallback,
      secondaryDistrict: "",
      fullDistrict: fallback,
      isAlias: false,
    };
  }

  const primaryDistrict = tokens.pop() ?? trimmedDistrict;

  return {
    primaryDistrict: primaryDistrict,
    secondaryDistrict: tokens.join(" "),
    fullDistrict: trimmedDistrict,
    isAlias: false,
  };
};
