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
 * 초단기실황예보 응답 item (현재는 온도 정보만 취급)
 */
export interface UltraNowDomain {
  baseDate: string;
  baseTime: string;
  nx: number;
  ny: number;

  temperature: number; // 현재 기온(T1H)
}

/**
 * 단기예보 응답 item
 *
 * 항목값        항목명        단위             압축bit수
 * TMP    1시간 기온            ℃              10
 */
export interface ShortFcstDomain {
  baseDate: string;
  baseTime: string;
  nx: number;
  ny: number;

  category: string; // TMP, ...
  todayMin: number; // 오늘 최저
  todayMax: number; // 온르 최고
  hourly: {
    time: string;
    temp: number;
  }[];
}

export interface TemperatureSummary {
  todayMin: number;
  todayMax: number;
  hourly: {
    time: string;
    temp: number;
  }[];
}

/**
 * 초단기실황예보 UI ViewModal (화면에 바로 쓰기 좋은 형태로 표현)
 */
export interface CurrentWeatherViewModal {
  temperatureText: string;
}
