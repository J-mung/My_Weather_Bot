export interface DistrictsGeoMapItem {
  nx: number;
  ny: number;
  lat: number;
  lon: number;
}

export interface DistrictSearchItem {
  fullName: string; // 서울특별시-종로구-청운동 (json 조회 key)
  separates: string[]; // ["서울특별시", "종로구", "청운동"]
  parsed: string; // 서울특별시총로구청운동 (추가 지원 검색 유형 - 참고 "도로명주소" 검색)
}
