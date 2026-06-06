import {
  AIR_QUALITY_API_PREFIX,
  CLIENT_CONFIG_API_PATH,
  KAKAO_API_PREFIX,
  KAKAO_MAP_SDK_API_PATH,
  WEATHER_API_PREFIX,
} from "./constants";

export const REQUEST_ID_HEADER = "X-Request-Id";

const SAFE_REQUEST_ID_PATTERN = /^[A-Za-z0-9._:-]{1,80}$/;

type WorkerRouteGroup =
  | "weather"
  | "air-quality"
  | "radar"
  | "kakao"
  | "kakao-map-sdk"
  | "client-config"
  | "asset";

export interface WorkerRequestLog {
  event: "worker_request";
  requestId: string;
  method: string;
  path: string;
  route: WorkerRouteGroup;
  status: number;
  durationMs: number;
  cache?: string;
  radarTm?: string;
}

export const resolveRequestId = (request: Request): string => {
  const incomingRequestId = request.headers.get(REQUEST_ID_HEADER)?.trim();

  if (incomingRequestId && SAFE_REQUEST_ID_PATTERN.test(incomingRequestId)) {
    return incomingRequestId;
  }

  return crypto.randomUUID();
};

const resolveRouteGroup = (path: string): WorkerRouteGroup => {
  if (path.startsWith(AIR_QUALITY_API_PREFIX)) {
    return "air-quality";
  }

  if (path.startsWith(KAKAO_API_PREFIX)) {
    return "kakao";
  }

  if (path === KAKAO_MAP_SDK_API_PATH) {
    return "kakao-map-sdk";
  }

  if (path === CLIENT_CONFIG_API_PATH) {
    return "client-config";
  }

  if (path.startsWith(WEATHER_API_PREFIX)) {
    return "weather";
  }

  return "asset";
};

const resolveCacheStatus = (headers: Headers): string | undefined =>
  headers.get("X-Weather-Cache") ??
  headers.get("X-Air-Quality-Cache") ??
  headers.get("X-Radar-Cache") ??
  undefined;

export const addRequestIdHeader = (response: Response, requestId: string): Response => {
  const headers = new Headers(response.headers);
  headers.set(REQUEST_ID_HEADER, requestId);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

export const createWorkerRequestLog = ({
  request,
  response,
  requestId,
  durationMs,
  route,
}: {
  request: Request;
  response: Response;
  requestId: string;
  durationMs: number;
  route?: WorkerRouteGroup;
}): WorkerRequestLog => {
  const url = new URL(request.url);
  const headers = response.headers;
  const log: WorkerRequestLog = {
    event: "worker_request",
    requestId,
    method: request.method,
    path: url.pathname,
    route: route ?? resolveRouteGroup(url.pathname),
    status: response.status,
    durationMs,
  };
  const cache = resolveCacheStatus(headers);
  const radarTm = headers.get("X-Radar-Tm") ?? undefined;

  if (cache) {
    log.cache = cache;
  }

  if (radarTm) {
    log.radarTm = radarTm;
  }

  return log;
};

const logWorkerRequest = (log: WorkerRequestLog): void => {
  console.info(JSON.stringify(log));
};

export const withWorkerObservability = async (
  request: Request,
  route: WorkerRouteGroup,
  handler: () => Promise<Response>,
): Promise<Response> => {
  const startedAt = Date.now();
  const requestId = resolveRequestId(request);
  const response = addRequestIdHeader(await handler(), requestId);
  const durationMs = Date.now() - startedAt;

  logWorkerRequest(createWorkerRequestLog({ request, response, requestId, durationMs, route }));

  return response;
};
