export interface ResponseHeaderType {
  resultCode: string;
  resultMsg: string;
}

/**
 * 현재 날씨 정보 타입 (초단기실황)
 */
export interface UltraNowItemType {
  baseDate: string; // 예보 기준일자
  baseTime: string; // 예보 기준시각
  category: string; // 데이터 카테고리
  nx: number; // 좌표 X점
  ny: number; // 좌표 Y점
  obsrValue: string; // 실황 데이터(기온))
}

/**
 * 초단기실황 응답 타입
 */
export interface UltraNowResponseType {
  response: {
    header: ResponseHeaderType;
    body: {
      dataType: "JSON" | string;
      items: { item: UltraNowItemType[] };
      pageNo: number;
      numOfRows: number;
      totalCount: number;
    };
  };
}

/**
 * 시간 단위 날씨 정보 타입 (단기예보))
 */
export interface ShortFcstItemType {
  baseDate: string; // 예보 기준일자
  baseTime: string; // 예보 기준시각
  category: string; // 데이터 카테고리
  fcstDate: string; // 단기예보 일자
  fcstTime: string; // 단기예보 시각
  fcstValue: string; // 예보 기온
  nx: number; // 좌표 X점
  ny: number; // 좌표 Y점
  obsrValue: string; // 실황 데이터
}

/**
 * 단기예보 응답 타입
 */
export interface ShortFcstResponseType {
  response: {
    header: ResponseHeaderType;
    body: {
      dataType: "JSON" | string;
      items: { item: ShortFcstItemType[] };
      pageNo: number;
      numOfRows: number;
      totalCount: number;
    };
  };
}

export type WeatherResponseMap = {
  ULTRA_NOW: UltraNowResponseType;
  SHORT_FORECAST: ShortFcstResponseType;
  TODAY_TEMP_RANGE: ShortFcstResponseType;
};

export const WeatherApiType = {
  ULTRA_NOW: "ULTRA_NOW",
  SHORT_FORECAST: "SHORT_FORECAST",
  TODAY_TEMP_RANGE: "TODAY_TEMP_RANGE",
} as const;

export type WeatherApiType = (typeof WeatherApiType)[keyof typeof WeatherApiType];
