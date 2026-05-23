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

  return response.data;
};
