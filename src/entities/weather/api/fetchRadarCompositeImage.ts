import { getLatestRadarTmKst } from "@/entities/weather/model/radarTime";

const DEFAULT_RADAR_API_PROXY_PATH = "/api/radar";

const getRadarApiProxyPath = (): string => {
  const configuredPath = import.meta.env.VITE_RADAR_API_PROXY_PATH as string | undefined;
  const proxyPath = configuredPath?.trim() || DEFAULT_RADAR_API_PROXY_PATH;
  const withLeadingSlash = proxyPath.startsWith("/") ? proxyPath : `/${proxyPath}`;

  return withLeadingSlash.replace(/\/+$/, "");
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
  const requestedTm = options.tm ?? getLatestRadarTmKst();
  const searchParams = new URLSearchParams({ tm: requestedTm });
  const response = await fetch(
    `${getRadarApiProxyPath()}/composite-image?${searchParams.toString()}`,
    {
      method: "GET",
      signal: options.signal,
    },
  );

  if (!response.ok) {
    throw new Error("레이더 영상을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
  }

  const contentType = response.headers.get("Content-Type") ?? "";

  if (!contentType.toLowerCase().startsWith("image/")) {
    throw new Error("레이더 영상 응답 형식이 올바르지 않아요.");
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
