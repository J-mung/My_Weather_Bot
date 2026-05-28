import { getLatestRadarTmKst } from "@/entities/weather/model/radarTime";
import { APP_ERROR, appErrorMetaMap, type AppErrorType } from "@/shared/api/app-errors";

type RadarCompositeImageErrorType =
  | typeof APP_ERROR.RADAR_HTTP
  | typeof APP_ERROR.RADAR_FORMAT
  | typeof APP_ERROR.RADAR_UNEXPECTED;

export type RadarErrorCode = (typeof appErrorMetaMap)[RadarCompositeImageErrorType]["code"];

export class RadarCompositeImageError extends Error {
  code: RadarErrorCode;
  type: RadarCompositeImageErrorType;

  constructor(type: RadarCompositeImageErrorType, cause?: unknown) {
    const meta = appErrorMetaMap[type];

    super(meta.description);
    this.name = "RadarCompositeImageError";
    this.type = type;
    this.code = meta.code;
    this.cause = cause;
  }
}

export const createRadarCompositeImageError = (
  type: RadarCompositeImageErrorType,
  cause?: unknown,
) => {
  return new RadarCompositeImageError(type, cause);
};

export const getRadarCompositeImageErrorCode = (error: unknown): RadarErrorCode => {
  return error instanceof RadarCompositeImageError
    ? error.code
    : appErrorMetaMap[APP_ERROR.RADAR_UNEXPECTED].code;
};

export const getRadarCompositeImageErrorMessage = (type: AppErrorType): string =>
  appErrorMetaMap[type].description;

const RADAR_API_PROXY_PATH = "/api/radar";

export interface RadarCompositeImageData {
  imageUrl: string;
  observedAtText: string;
  tm: string;
  cacheStatus: string | null;
}

export const fetchRadarCompositeImage = async (
  options: { signal?: AbortSignal; tm?: string } = {},
): Promise<RadarCompositeImageData> => {
  const requestedTm = options.tm ?? getLatestRadarTmKst();
  const searchParams = new URLSearchParams({ tm: requestedTm });
  const response = await fetch(`${RADAR_API_PROXY_PATH}/composite-image?${searchParams.toString()}`, {
    method: "GET",
    signal: options.signal,
  }).catch((error: unknown) => {
    throw createRadarCompositeImageError(APP_ERROR.RADAR_UNEXPECTED, error);
  });

  if (!response.ok) {
    throw createRadarCompositeImageError(APP_ERROR.RADAR_HTTP);
  }

  const contentType = response.headers.get("Content-Type") ?? "";

  if (!contentType.toLowerCase().startsWith("image/")) {
    throw createRadarCompositeImageError(APP_ERROR.RADAR_FORMAT);
  }

  const blob = await response.blob();
  const tm = response.headers.get("X-Radar-Tm") ?? requestedTm;
  const observedAtText = response.headers.get("X-Radar-Observed-At-KST") ?? tm;

  return {
    imageUrl: URL.createObjectURL(blob),
    observedAtText,
    tm,
    cacheStatus: response.headers.get("X-Radar-Cache"),
  };
};
