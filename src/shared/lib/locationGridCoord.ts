import type { GridCoord } from "@/entities/weather/model/weatherTypes";
import districtGridMap from "@/shared/lib/korea_district_grid.json";

type DistrictGridMap = Record<string, GridCoord>;

// 타입 안정성을 위해 Map에 타입 지정
const typedDistrictGridMap = districtGridMap as DistrictGridMap;

/**
 * fullName 값으로 json에서 데이터 조회 후 {nx, ny} 형태로 반환
 * @param districtFullName
 * @returns
 */
export const getGridCoordByDistrictName = (districtFullName: string): GridCoord | null => {
  const gridCoord = typedDistrictGridMap[districtFullName];
  if (!gridCoord) return null;

  const nx = Number(gridCoord.nx);
  const ny = Number(gridCoord.ny);

  if (!Number.isFinite(nx) || !Number.isFinite(ny)) {
    return null;
  }

  return { nx, ny };
};
