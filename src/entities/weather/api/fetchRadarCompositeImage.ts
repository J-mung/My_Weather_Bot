import { APP_ERROR, appErrorMetaMap, type AppErrorType } from "@/shared/api/app-errors";
import { getApiClient } from "@/shared/api/axios";

const clientConfigApiClient = getApiClient("clientConfig");

type RadarCompositeImageErrorType =
  | typeof APP_ERROR.RADAR_CONFIG
  | typeof APP_ERROR.RADAR_HTTP
  | typeof APP_ERROR.RADAR_FORMAT
  | typeof APP_ERROR.RADAR_UNEXPECTED;

export type RadarErrorCode = (typeof appErrorMetaMap)[RadarCompositeImageErrorType]["code"];

type ClientConfigResponse = {
  radarApiProxyPath?: string;
};

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

const normalizeProxyPath = (path: string): string => {
  const trimmedPath = path.trim();
  const withLeadingSlash = trimmedPath.startsWith("/") ? trimmedPath : `/${trimmedPath}`;
  return withLeadingSlash.replace(/\/+$/, "");
};

const fetchRadarApiProxyPath = async (signal?: AbortSignal): Promise<string> => {
  try {
    const response = await clientConfigApiClient.get<ClientConfigResponse>("", { signal });
    const radarApiProxyPath = response.data.radarApiProxyPath?.trim();

    if (!radarApiProxyPath) {
      throw createRadarCompositeImageError(APP_ERROR.RADAR_CONFIG);
    }

    return normalizeProxyPath(radarApiProxyPath);
  } catch (error: unknown) {
    if (error instanceof RadarCompositeImageError) {
      throw error;
    }

    throw createRadarCompositeImageError(APP_ERROR.RADAR_CONFIG, error);
  }
};

export interface RadarCompositeImageData {
  imageUrl: string;
  observedAtText: string;
  tm: string;
  cacheStatus: string | null;
}

export const fetchRadarCompositeImage = async (
  options: { signal?: AbortSignal; tm?: string } = {},
): Promise<RadarCompositeImageData> => {
  const radarApiProxyPath = await fetchRadarApiProxyPath(options.signal);
  const searchParams = new URLSearchParams();

  if (options.tm) {
    searchParams.set("tm", options.tm);
  }

  const query = searchParams.toString();
  const requestUrl = `${radarApiProxyPath}/composite-image${query ? `?${query}` : ""}`;
  const response = await fetch(requestUrl, {
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
  const tm = response.headers.get("X-Radar-Tm") ?? options.tm ?? "";
  const observedAtText = response.headers.get("X-Radar-Observed-At-KST") ?? tm;

  return {
    imageUrl: URL.createObjectURL(blob),
    observedAtText,
    tm,
    cacheStatus: response.headers.get("X-Radar-Cache"),
  };
};
