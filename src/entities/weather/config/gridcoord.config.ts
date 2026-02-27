/**
 * 기상청(KMA) 단기예보 격자 변환 설정값
 *
 * 단위:
 * - RE: km
 * - GRID: km
 * - 위도/경도: degree
 */
export const GRID_COORD_CONFIG = {
  RE: 6371.00877, // 지구 반경 (km)
  GRID: 5.0, // 격자 간격 (km)
  SLAT1: 30.0, // 표준 위도 1
  SLAT2: 60.0, // 표준 위도 2
  OLON: 126.0, // 기준점 경도
  OLAT: 38.0, // 기준점 위도
  XO: 43, // 기준점 X좌표
  YO: 136, // 기준점 Y좌표
} as const;
