import type { ResponseHeaderType } from "@/entities/weather/api/weather-api.types";

export interface AirQualitySidoRequestParams {
  sidoName: string;
}

export interface AirQualityStationItemType {
  stationName?: string;
  sidoName?: string;
  dataTime?: string;
  pm10Value?: string;
  pm10Grade?: string;
  pm25Value?: string;
  pm25Grade?: string;
  pm10Flag?: string | null;
  pm25Flag?: string | null;
}

export interface AirQualitySidoResponseType {
  response: {
    header: ResponseHeaderType;
    body: {
      items:
        | { item: AirQualityStationItemType[] | AirQualityStationItemType }
        | AirQualityStationItemType[];
      pageNo: number;
      numOfRows: number;
      totalCount: number;
    };
  };
}
