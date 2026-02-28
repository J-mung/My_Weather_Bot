/**
 * 사용자 현재 위치 (위도/경도)
 */
export interface LatLon {
  lat: number;
  lon: number;
}

export interface BaseDateTime {
  base_date: string; // 요청 기준 일자
  base_time: string; // 요청 기준 시각
}

/**
 * 데이터 요청용 격차 좌표(기상청)
 *    - 위도와 경도를 변환해서 사용
 */
export interface GridCoord {
  nx: number; // 예보지점 x 좌표
  ny: number; // 예보지점 y 좌표
}

/**
 * 현재 날씨 정보 타입 (초단기실황)
 */
export interface WeatherNowType {
  numOfRows: number; // 한 페이지 결과 수
  pageNo: number; // 페이지 번호
  totalCount: number; // 데이터 총 개수
  resultCode: number; // 응답메시지 코드
  resultMsg: string; // 응답메시지 내용
  dataType: string; // 데이터 타입
  baseData: string; // 발표일자
  baseTime: string; // 발표시각
  nx: number; // 예보지점 x 좌표
  ny: number; // 예보지점 y 좌표
  category: string; // 자료구분코드
  obsrValue: number; //실황 값
}

/**
 * 시간 단위 날씨 정보 타입 (단기예보))
 */
export interface WeatherFcstType {
  numOfRows: number; // 한 페이지 결과 수
  pageNo: number; // 페이지 번호
  totalCount: number; // 데이터 총 개수
  resultCode: number; // 응답메시지 코드
  resultMsg: string; // 응답메시지 내용
  dataType: string; // 데이터 타입
  baseData: string; // 발표일자
  baseTime: string; // 발표시각
  fcstData: string; // 예보시각
  category: string; // 자료구분코드
  fcstValue: number; // 예보 값
  nx: number; // 예보지점 x 좌표
  ny: number; // 예보지점 y 좌표
}
