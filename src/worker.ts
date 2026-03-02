interface Env {
  API_BASE_URL: string;
  API_KEY: string;
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
}

/**
 * 이 Worker 파일이 필요한 이유
 * - 프론트에서 기상청 API를 직접 호출하면 CORS 및 키 노출 이슈가 생김
 * - Worker가 /api/* 요청을 받아 서버에서 API_KEY를 주입한 뒤 기상청으로 프록시 호출
 * - 같은 Worker에서 정적 dist 자산도 함께 서빙해 단일 배포 경로로 운영 가능
 */
const ALLOWED_ENDPOINTS = new Set(["getUltraSrtNcst", "getVilageFcst"]);
const API_PREFIX = "/api/";

/**
 * 브라우저 CORS 처리를 위한 공통 응답 헤더 생성
 */
const createCorsHeaders = (origin: string): Record<string, string> => ({
  "Access-Control-Allow-Origin": origin || "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  Vary: "Origin",
});

/**
 * 기존 ResponseInit에 CORS 헤더를 병합
 */
const withCors = (origin: string, init?: ResponseInit): ResponseInit => {
  const headers = new Headers(init?.headers);
  const corsHeaders = createCorsHeaders(origin);
  Object.entries(corsHeaders).forEach(([key, value]) => headers.set(key, value));
  return { ...init, headers };
};

/**
 * 클라이언트 요청 쿼리를 upstream으로 전달하고,
 * API_KEY/serviceKey를 서버에서만 주입한 기상청 호출 URL 생성
 */
const buildUpstreamUrl = (request: Request, env: Env, endpoint: string): URL => {
  const incomingUrl = new URL(request.url);
  const normalizedBase = env.API_BASE_URL.replace(/\/+$/, "");
  const upstreamUrl = new URL(`${normalizedBase}/${endpoint}`);

  incomingUrl.searchParams.forEach((value, key) => {
    upstreamUrl.searchParams.set(key, value);
  });

  upstreamUrl.searchParams.set("serviceKey", env.API_KEY);

  if (!upstreamUrl.searchParams.has("dataType")) {
    upstreamUrl.searchParams.set("dataType", "JSON");
  }

  return upstreamUrl;
};

/**
 * /api/* 요청 처리
 * - OPTIONS: preflight 처리
 * - GET: 허용 endpoint 검증 후 기상청 API 프록시 호출
 */
const handleApiRequest = async (request: Request, env: Env): Promise<Response> => {
  const origin = request.headers.get("Origin") ?? "";
  const url = new URL(request.url);
  const endpoint = url.pathname.slice(API_PREFIX.length);

  if (request.method === "OPTIONS") {
    return new Response(null, withCors(origin, { status: 204 }));
  }

  if (request.method !== "GET") {
    return new Response("Method Not Allowed", withCors(origin, { status: 405 }));
  }

  if (!ALLOWED_ENDPOINTS.has(endpoint)) {
    return new Response("Invalid endpoint", withCors(origin, { status: 400 }));
  }

  if (!env.API_BASE_URL || !env.API_KEY) {
    return new Response("Missing API env", withCors(origin, { status: 500 }));
  }

  const upstreamUrl = buildUpstreamUrl(request, env, endpoint);
  const upstreamRes = await fetch(upstreamUrl.toString(), { method: "GET" });
  const body = await upstreamRes.text();

  return new Response(
    body,
    withCors(origin, {
      status: upstreamRes.status,
      headers: {
        // upstream content-type 우선, 없으면 JSON 기본값
        "Content-Type":
          upstreamRes.headers.get("Content-Type") ?? "application/json; charset=utf-8",
        // API 응답은 캐시 미사용(디버깅/신선도 확보)
        "Cache-Control": "no-store",
      },
    }),
  );
};

/**
 * 정적 자산 서빙
 * - 요청 파일이 없으면(SPA 라우팅) index.html fallback 반환
 */
const serveAsset = async (request: Request, env: Env): Promise<Response> => {
  const assetResponse = await env.ASSETS.fetch(request);

  if (assetResponse.status !== 404) {
    return assetResponse;
  }

  const acceptsHtml = request.headers.get("Accept")?.includes("text/html");
  if (request.method === "GET" && acceptsHtml) {
    const indexUrl = new URL("/index.html", request.url);
    return env.ASSETS.fetch(new Request(indexUrl.toString(), request));
  }

  return assetResponse;
};

export default {
  /**
   * Worker 진입점
   * - /api/* 는 API 프록시 핸들러로 전달
   * - 그 외 경로는 정적 자산 응답
   */
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith(API_PREFIX)) {
      return handleApiRequest(request, env);
    }

    return serveAsset(request, env);
  },
};
