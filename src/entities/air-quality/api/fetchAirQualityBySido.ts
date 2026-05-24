import { getApiClient } from "@/shared/api/axios";
import type {
  AirQualitySidoRequestParams,
  AirQualitySidoResponseType,
} from "./air-quality-api.types";

const airQualityApiClient = getApiClient("airQuality");

export const fetchAirQualityBySido = async ({
  sidoName,
}: AirQualitySidoRequestParams): Promise<AirQualitySidoResponseType> => {
  const response = await airQualityApiClient.get("/getCtprvnRltmMesureDnsty", {
    params: {
      pageNo: 1,
      numOfRows: 100,
      returnType: "json",
      sidoName,
      ver: "1.3",
    },
  });

  const resultCode = response.data.response.header.resultCode;

  if (resultCode !== "00") {
    throw new Error(
      response.data.response.header.resultMsg || "대기질 정보를 불러오지 못했습니다.",
    );
  }

  return response.data;
};
